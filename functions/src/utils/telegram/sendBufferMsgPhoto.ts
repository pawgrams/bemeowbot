import FormData from 'form-data';
import fetch from 'node-fetch';
import { _botfather } from '../../context/cache/access';

////////////////////////////////////////////////////////////////

export class SendBufferMsgPhoto {
    private group: number;
    private userId: number;
    private msgId: string;
    private photoBuffer: Buffer;
    private caption: string;

    constructor(group: number, userId: number, msgId: string, photoBuffer: Buffer, caption: string) {
        this.group = group;
        this.userId = userId;
        this.msgId = msgId;
        this.photoBuffer = photoBuffer;
        this.caption = caption;
    }

    public async handle(): Promise<boolean> {

        try {

            if(!this.msgId) this.msgId = '';
            const userTag: string = `<a href="tg://user?id=${this.userId}">&#8203;</a>`;
            const form: FormData = new FormData();

            form.append('chat_id', this.group.toString());
            if(this.msgId) form.append('reply_to_message_id', this.msgId.toString());

            form.append('photo', this.photoBuffer, {
                filename: 'photo.png',
                contentType: 'image/png',
            });

            form.append('caption', `${this.caption}${userTag}`);
            form.append('parse_mode', 'HTML');
            if(!form) throw Error(`could not prepare image buffer form data for telegram`);

            try {
                const response: fetch.Response = await fetch(`https://api.telegram.org/bot${_botfather}/sendPhoto`, {
                    method: 'POST',
                    body: form,
                });
                const result: any = await response.json();
                if(!response || !result) throw Error('fetching result from uploading buffered image to telegram failed');
                return true;
            } catch(e: unknown){
                return false;
            }

        } catch (e: unknown) {
            console.log("❌ utils => telegram => sendBufferMsgPhoto.js => ", e instanceof Error ? e.message : e);
            return false;
        }

    }


}

