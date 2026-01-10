import { dbBucket } from '../../../../context/cache/buckets';
import { HandleErrorType } from '../../../../utils/misc/handleErrorType';
import { pause } from '../../../../utils/misc/pause';
import { _group, _sunoace, _sunoauth, _sunohook } from '../../../../context/cache/access';

////////////////////////////////////////////////////////////////

export class Suno {
    private userId: number;
    private userName: string;
    private action: string;
    private model: string;
    private lyrics: string;
    private isBeat: boolean;
    private title: string;
    private style: string;
    private negative: string;
    private artist: string;
    private sendMsg: boolean;
    private initbotMsg: number;
    private maxstyle: number;

    constructor(
        userId: number,
        userName: string,
        action: string, 
        model: string,
        lyrics: string,
        isBeat: boolean,
        title: string,
        style: string, 
        negative: string,
        artist: string,
        sendMsg: boolean,
        initbotMsg: number,
        maxstyle: number,
    ) {
        this.userId = userId;
        this.userName = userName;
        this.action = action;
        this.model = model;
        this.lyrics = lyrics;
        this.isBeat = isBeat;
        this.title = title;
        this.style = style;
        this.negative = negative;
        this.artist = artist;
        this.sendMsg = sendMsg;
        this.initbotMsg = initbotMsg;
        this.maxstyle = maxstyle;
    }

    private cleanString(str: string): string  {
        let result: string = ''
        try {
            result = str.replace(/[^a-zA-Z0-9\u0600-\u06FF\u0400-\u04FF\u0370-\u03FF\u00C0-\u017FäöüÄÖÜß?!\(\)\[\]\{\},.:;\-'"\*\s]/g, '');
        } catch (e: unknown){ 
            result = str; 
        }
        return result;
    };
    
    public async suno(): Promise<boolean> {

        try{

            if( this.sendMsg && ( !_sunoauth || !_sunohook || !_sunoace ) ){
                throw Error('E-CODE_000: could not fetch sunoauth OR sunowebhook OR acedatasuno');
            }

            const sunowebhookextended: string = `${_sunohook}/suno?authtoken=${_sunoauth}`;  
            if(!sunowebhookextended && this.sendMsg){
                throw Error('E-CODE_000: could build sunowebhookextended');
            }

            this.lyrics = this.lyrics ? this.cleanString(this.lyrics).trim().slice(0, 2500) : '';
            this.style = this.style ? this.cleanString(this.style).trim().slice(0, this.maxstyle) :'';
            this.negative = this.negative ? this.cleanString(this.negative).trim().slice(0, 119) : '';
            this.title = this.title ? this.cleanString(this.title).trim().slice(0, 40) : '';

            let payload: any = {
                model: this.model, 
                lyric: this.lyrics,
                custom: true, 
                instrumental: false, 
                title: this.title,  
                style: this.style,
                action: this.action,
                callback_url: sunowebhookextended
            };

            if(!payload && this.sendMsg) throw Error('E-CODE_000: could build suno payload object');

            const options: any = {  
                method: "post", 
                headers: { 
                    "accept": "application/json", 
                    "content-type": "application/json", 
                    "authorization": `Bearer ${_sunoace}`, 
                }, 
                body: JSON.stringify(payload)
            };

            try {
                let data: any = {};
                let retry: number = 5;
                let sunoSendSuccess: boolean = false;
                while(!sunoSendSuccess && retry > 0){
                    try {
                        const response: Response = await fetch("https://api.acedata.cloud/suno/audios", options);
                        if (!response.ok && this.sendMsg) {
                            throw new Error(`Suno Call HTTP error! Status: ${response.status} => ${response}`);
                        }
                        data = await response.json();
                        sunoSendSuccess = true;
                    } catch (e: unknown){
                        console.log(e instanceof Error ? e.message : e);
                        await pause(4)
                        retry--;
                    }
                }

                if (!sunoSendSuccess || !data || Object.keys(data).length == 0){
                    throw new Error(`E-CODE_015: no data on fetch from suno after 5 retries`);
                }

                if('task_id' in data && data.task_id && typeof(data.task_id) === 'string'){ 
                    const taskId: string = data.task_id || '';
                    //*********************************************************************************************************************
                    const db_sunotasksPath: string = `temp/sunotasks.json`;
                    const db_sunotasks: any = JSON.parse(await dbBucket.file(db_sunotasksPath).download().then(data => data[0].toString()));
                    db_sunotasks[taskId] = {
                        user_id: this.userId, 
                        user_name: this.userName, 
                        task_type: "generation", 
                        time_stamp: Date.now(),
                        artist_name: this.artist,
                        bot_msg_id: this.initbotMsg,
                    }
                    try{
                        dbBucket.file(db_sunotasksPath).save(JSON.stringify(db_sunotasks), { contentType: 'application/json' });
                    } catch(e: unknown){
                        console.log('writing sunotask to db failed', e instanceof Error ? e.message : e);
                    }
                    //*********************************************************************************************************************

                } else if(this.sendMsg){
                    throw Error("E-CODE_000: suno task_id could not be fetched");
                }

            } catch (e: unknown) {
                throw Error(`${e}`);
            }
            return true;

        } catch(e: unknown){
            try {
                console.log("❌ suno.js", e instanceof Error ? e.message : e);
                new HandleErrorType(e, this.userId, this.userName).handleErrorType();
                return false;
            } catch(_e: unknown){
                return false;
            }
        }

    }

}



