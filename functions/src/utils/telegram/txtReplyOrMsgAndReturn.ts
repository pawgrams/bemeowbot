import { bot } from '../../context/bot';
import { Context } from 'telegraf';
import { MsgType } from '../../utils/types/customTypes';

export class TxtReplyOrMsgAndReturn {

    private ctx: Context;
    private group: number;
    private replyMsg: string;
    private replyType: MsgType;
    private userId: number;

    constructor(ctx: Context, group: number, replyMsg: string, replyType: MsgType, userId: number) {
        this.ctx = ctx;
        this.group = group;
        this.replyMsg = replyMsg;
        this.replyType = replyType;
        this.userId = userId;
    }

    public async txtReplyOrMsgAndReturn(): Promise<any> {

        try{

            let msgOpt: any = {}; 
            let reply: string = this.replyMsg;
            const messageId: number = this.ctx.message && 'message_id' in this.ctx.message ? this.ctx.message.message_id : 0;
            let result: any = '';

            try{

                if(messageId){
                    msgOpt = {parse_mode: 'HTML', reply_to_message_id: messageId};

                } else if(this.userId && this.userId !== 0){
                    msgOpt = {parse_mode: 'HTML'};
                    reply += `<a href="tg://user?id=${this.userId}">&#8203;</a>`;

                } else {
                    msgOpt = {parse_mode: 'HTML'};
                    reply = this.replyMsg;  
                }

                result = await bot.telegram.sendMessage(this.group, this.replyMsg, msgOpt)
                return result;

            }catch(e: unknown){
                try{
                    result = bot.telegram.sendMessage(this.group, this.replyMsg + `[\u200C](tg://user?id=${this.userId})`, {parse_mode: 'MarkdownV2'});
                    return result;
                } catch(e: unknown){
                    throw Error(`txtReplyOrMsg => markupv2 fallback failed`);
                }
            }

        } catch(e: unknown){
            console.log("❌ utils => telegram => txtReplyOrMsgAndReturn.js => ", e instanceof Error ? e.message : e);
            return '';
        }
        
    }

}