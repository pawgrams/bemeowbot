import { Context } from 'telegraf';
import { _group } from '../../context/cache/access';
import { isTxtMsg } from '../../utils/text/isTxtMsg';
import { Newmember } from './newmember';
import { Commands } from './commands';
import { botnames } from '../../context/cache/botnames';

////////////////////////////////////////////////////////////////

export class Messages {
    private ctx: Context;

    constructor(ctx: Context) {
        this.ctx = ctx;
    }

    public async handle() {

        try{

            if(!this.ctx) throw Error('no ctx');

            const message: any = 'message' in this.ctx && this.ctx.message ? this.ctx.message : null;
            if(!message) throw Error('no msg in ctx')

            const group: number = 'chat' in message && message.chat && 'id' in message.chat && message.chat.id ? message.chat.id : 0;
            if(!group || _group !== group) throw new Error(`no chatid in cb or chatid not allowed`);

            if('is_topic_message' in message) throw Error('topics not allowed for this function');
            if('callbackQuery' in this.ctx && this.ctx.callbackQuery) throw Error("callbackQuery found in message update");
            if('new_chat_members' in message && message.new_chat_members && group === _group){
                new Newmember(this.ctx).handle();
            } else if('text' in message && isTxtMsg(message) && message.text && ( message.text.trim().startsWith("/") || botnames.filter(prefix => message.text.trim().startsWith(prefix))[0] ) ){
                new Commands(this.ctx).handle();
            } else {
                throw Error('update is neither command nor new members');
            }
                
        } catch (e: unknown) {
            console.log("❌ messages.js", e instanceof Error ? e.message : e);
        }

    }

}




