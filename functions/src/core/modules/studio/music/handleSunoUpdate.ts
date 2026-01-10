
import { bot } from '../../../../context/bot';
import { _group } from '../../../../context/cache/access';
import { dbBucket } from '../../../../context/cache/buckets';
import { GetTitle } from './getTitle';
import { HandleErrorType } from '../../../../utils/misc/handleErrorType';

////////////////////////////////////////////////////////////////

const MAX_TASK_AGE: number = 1000 * 60 * 30;
const minSongLengthInSeconds: number = 5;
const eCodeMap: Record<string, string> = {
    "negative tags":            "E-CODE_002",
    "please contact admin":     "E-CODE_004"
}

////////////////////////////////////////////////////////////////

export class SunoUpdate {

    private update: any;

    constructor(update: any = '') {
        this.update = update;
    }

    public async handleSunoUpdate() {

        let userId: number = 0; 
        let userName: string = ''; 
        let taskType: string = ''; 
        let messageId: number = 0; 
        let artist: string = ''; 
        let botMsgId: number = 0;
    
        try {
    
            const taskId: string = this.update && 'task_id' in this.update && this.update.task_id ? this.update.task_id : '';
            const success: boolean = this.update && this.update.success ? this.update.success : false;
            if(!success){
                const errorMsg: string = this.update && 'error' in this.update && this.update.error && 'message' in this.update.error && this.update.error.message ? this.update.error.message : ''
                const keyInECodes = Object.keys(eCodeMap).find(key => errorMsg.includes(key)) || '';
                if(keyInECodes){
                    const eCode = eCodeMap[keyInECodes];
                    throw Error(`${eCode}: Error while creating song: ${errorMsg}`);
                }
                throw Error(`E-CODE_003: Error while creating song`);
            }
    
            //*********************************************************************************************************************
            const db_sunotasksPath: string = `temp/sunotasks.json`;
            const db_sunotasks: any = JSON.parse(await dbBucket.file(db_sunotasksPath).download().then(data => data[0].toString()));
            const task: any = db_sunotasks[taskId] || {};
            if(task){
                userId = Number(task["user_id"]) || 0;
                userName = String(task["user_name"]) || '';
                taskType = String(task["task_type"]) || '';
                artist = String(task["artist_name"]) || '';
                botMsgId = Number(task["bot_msg_id"]) || 0;
            }
            try{
                for(const key of Object.keys(db_sunotasks)){
                    try{
                        if(db_sunotasks[key]["time_stamp"] && ( Number(db_sunotasks[key]["time_stamp"]) + MAX_TASK_AGE ) < Date.now() ){
                            delete db_sunotasks[key];
                        }
                    } catch(e: unknown){
                        throw Error(`${e}`);
                    }
                }
                await dbBucket.file(db_sunotasksPath).save(JSON.stringify(db_sunotasks), { contentType: 'application/json' });
            } catch(e: unknown){
                console.log(`could not delete one or more obsolete suno task(s) from db upon general clearing attempt => ${e instanceof Error ? e.message : e}`);
            }
            //*********************************************************************************************************************
    
            try{
    
                let title0: string = ''; let song0: boolean = false;
                const dataset0: any = this.update.data[0] ? this.update.data[0] : null;
                const audio_url0: string = this.update.data[0]?.audio_url || ''; 
                const style0: string = this.update.data[0]?.style || ''; 
                const lyrics0: string = this.update.data[0]?.lyric || ''; 
                const prompt0: string = this.update.data[0]?.prompt || '';
                let songId0: string = String(this.update.data[0]?.id) || '';
                title0 = String(this.update.data[0]?.title) || '';
                let duration0: number = Number(this.update.data[0]?.duration) || 0;
                if(dataset0 && audio_url0 && duration0 >= minSongLengthInSeconds){
                    song0 = true;
                    await this.songSuccess(userId, userName, taskType, audio_url0, title0, duration0, songId0, artist, style0, lyrics0, botMsgId, prompt0);
                } 
    
                // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
    
                let title1: string = ''; let song1: boolean = false;
                const dataset1: any = this.update.data[1] ? this.update.data[1] : null;
                const audio_url1: string = this.update.data[1]?.audio_url || '';
                const style1: string = this.update.data[1]?.style || '';  
                let songId1: string = String(this.update.data[1]?.id) || '';
                const lyrics1: string = this.update.data[1]?.lyric || ''; 
                const prompt1: string = this.update.data[1]?.prompt || ''; 
                title1 = String(this.update.data[1]?.title) || '';
                let duration1: number = Number(this.update.data[1]?.duration) || 0;
                if(dataset1 && audio_url1 && duration1 >= minSongLengthInSeconds){
                    song1 = true;
                    await this.songSuccess(userId, userName, taskType, audio_url1, title1, duration1, songId1, artist, style1, lyrics1, botMsgId, prompt1);
                } 
    
                if(!song0 && !song1) throw Error('E-CODE_000: data of both songs invalid');

                if(( song0 || song1) && botMsgId ){
                    try{
                        const notification: string = `<b>Meow @${userName} </b>😼 Your Track is Ready 💖🎉\nCommunity is Artist: Spread the Vibes 🎵 ${userId ? `<a href="tg://user?id=${userId}">&#8203;</a>` : ''}`
                        bot.telegram.editMessageText(
                            _group,
                            botMsgId,
                            undefined,
                            notification,
                            {parse_mode: 'HTML'}
                        );
                    } catch(e: unknown){
                        console.log("E-CODE_000: Error sending final track notification => ", e instanceof Error ? e.message : e)
                    }
                }
                
            } catch(e: unknown){
                throw Error(`E-CODE_000: data of both songs invalid ${e}`);
            }
    
        } catch(e: unknown) {
            try {
                console.log("❌ handleSunoUpdate.js", e instanceof Error ? e.message : e);
                const handleError: HandleErrorType = new HandleErrorType(e, userId, userName);
                handleError.handleErrorType();
            }catch{}
        }

    }


    ///////////////////////////////////////////////////////////////////////////////////////////////


    public async songSuccess (
        userId: number, 
        userName: string, 
        taskType: string, 
        audio_url: string, 
        title: string, 
        duration: number, 
        songId: string,
        artist: string,
        style: string,
        lyrics: string,
        botMsgId: number = 0,
        prompt: string,
    ) {
    
        try {

            if(title.includes(" -- ")){
                const parts: string[] = title.split(" -- ") || [];
                if(parts && parts.length === 2){
                    artist = parts[0];
                    title = parts[1]
                }
            }

            if(!artist && lyrics){ artist = await this.getArtistFromLyrics(lyrics) || ''; }
            if(!title) title = await new GetTitle(style, lyrics).getTitle();

            const validUser: string = userName && userName.toLowerCase() !== "undefined" ? userName : '';
            const displayName: string = artist || validUser || "PLACEHOLDER";
    
            const startEmoji: string = await this.getTitleEmoji(style);
            let msgOpt: any = {
                caption: `<b>${displayName} - ${title}</b> ${startEmoji} ${userId ? `<a href="tg://user?id=${userId}">&#8203;</a>` : ''}`,
                parse_mode: 'HTML',
                performer: artist ? artist : (userName ? userName : 'PLACEHOLDER'),
                title: title + ` ${startEmoji}`,
            };
            await bot.telegram.sendAudio(_group, audio_url, msgOpt);
    
        } catch {
            try{
                await this.songSuccess(userId, userName, taskType, audio_url, title, duration, songId, artist, style, lyrics, botMsgId, prompt);
            } catch(e: unknown){
                console.log(`❌ handleSunoUpdate.js => songSuccess() => ${e instanceof Error ? e.message : e}`);
            }
        }
    }
    
    ////////////////////////////////////////////////////////////////

    public async getTitleEmoji(style: string): Promise <string> { 
        let startEmoji: string = '🔥';
        try {
            const _style: string = style.toLowerCase();

            if(_style.includes("orch")        || _style.includes("classic")){   startEmoji = '🎻'; } 
            if(_style.includes("rap vocal")   || _style.includes("rapper")){    startEmoji = '🎤'; } 
            if(_style.includes("snare")       || _style.includes("drum")){      startEmoji = '🥁'; } 
            if(_style.includes("trumpet")     || _style.includes("brass")){     startEmoji = '🎺'; } 
            if(_style.includes("guitar")      || _style.includes("metal")){     startEmoji = '🎸'; } 
            if(_style.includes("bongo")       || _style.includes("conga")){     startEmoji = '🪘'; } 
            if(_style.includes("futur")       || _style.includes("galax") ){    startEmoji = '🚀'; } 

            if(_style.includes("sax")){         startEmoji = '🎷'; } 
            if(_style.includes("myster")){      startEmoji = '🔮'; } 
            if(_style.includes("gamin")){       startEmoji = '🎮'; } 
            if(_style.includes("flut")){        startEmoji = '🪈'; } 
            if(_style.includes("maraca")){      startEmoji = '🪇'; } 
            if(_style.includes("dystop")){      startEmoji = '🥷'; } 
            if(_style.includes("liquid")){      startEmoji = '🌠'; } 

        } catch {}
        return startEmoji;
    }


    ///////////////////////////////////////////////////////////////////////////////////////////////

    private async getArtistFromLyrics(lyrics: string): Promise <string> {
        let _artist: string = '';
        try {
            const artistName: string = await this.extractArtistFromLyricsEnd(lyrics);
            if(artistName){
                _artist = artistName;
            } else {
                const artistName = await this.extractArtistFromLyricsStart(lyrics);
                if(artistName) _artist = artistName;
            }
            
        } catch {}
        return _artist;
    }

    private async extractArtistFromLyricsEnd(lyrics: string): Promise <string> {

        let artist: string = '';
        let _lyrics: string = '';

        try {

            if(lyrics && lyrics.length > 300){
                _lyrics = _lyrics.replace("\n", ' ').trim();
                _lyrics = _lyrics.replace("+", ' ').trim();
                _lyrics = _lyrics.replace(/\s+/g, ' ').trim();
            }

            if(!_lyrics) _lyrics = lyrics;

            const postOutroStartIndex: number = _lyrics.indexOf('[Post-Outro]');
            if (!postOutroStartIndex || postOutroStartIndex === -1){
                throw Error('[Post-Outro] not found in _lyrics');
            }

            const postOutroEndIndex: number = postOutroStartIndex + '[Post-Outro]'.length;
            const BeatsOfMeowStartIndex: number = _lyrics.indexOf('... PLACEHOLDER', postOutroEndIndex);
            if (!BeatsOfMeowStartIndex || BeatsOfMeowStartIndex === -1){
                throw Error('... PLACEHOLDER not found in _lyrics');
            }

            artist = _lyrics.slice(postOutroEndIndex + 1, BeatsOfMeowStartIndex -1 ).trim() || '';

        } catch {}

        return artist || '';
    }


    ///////////////////////////////////////////////////////////////////////////////////////////////


    private async extractArtistFromLyricsStart(lyrics: string): Promise <string> {

        let artist: string = '';
        let _lyrics: string = '';

        try {

            if(lyrics && lyrics.length >= 301){
                _lyrics = _lyrics.replace("\n", ' ').trim();
                _lyrics = _lyrics.replace("+", ' ').trim();
                _lyrics = _lyrics.replace(/\s+/g, ' ').trim();
            }
            
            if(!_lyrics) _lyrics = lyrics;

            _lyrics.slice(0, 300);
            const preIntroStartIndex: number = _lyrics.indexOf('[Pre-Intro]');
            if (!preIntroStartIndex || preIntroStartIndex === -1){
                throw Error('[Pre-Intro] not found in _lyrics');
            }

            const preIntroEndIndex: number = preIntroStartIndex + '[Post-Outro]'.length;

            const BeatsOfMeowStartIndex: number = _lyrics.indexOf('PLACEHOLDER ...', preIntroEndIndex);
            if (!BeatsOfMeowStartIndex || BeatsOfMeowStartIndex === -1){
                throw Error('... PLACEHOLDER not found in _lyrics');
            }

            const BeatsOfMeowEndIndex: number = BeatsOfMeowStartIndex + 'PLACEHOLDER ...'.length;

            const rightDotsStartsIndex: number = _lyrics.indexOf('PLACEHOLDER ...', BeatsOfMeowEndIndex);
            if (!rightDotsStartsIndex || rightDotsStartsIndex === -1){
                throw Error('... PLACEHOLDER not found in _lyrics');
            }

            artist = _lyrics.slice(BeatsOfMeowEndIndex + 1, rightDotsStartsIndex -1 ).trim() || '';

        } catch {}

        return artist || '';

    }

}

