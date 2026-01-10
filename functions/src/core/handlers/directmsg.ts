import { Context } from 'telegraf';
import { _group } from '../../context/cache/access';
import { isTxtMsg } from '../../utils/text/isTxtMsg';
import { IsGroupMember } from '../../utils/users/isGroupMember';

////////////////////////////////////////////////////////////////

export class DirectMsg {
    private ctx: Context;

    constructor(ctx: Context) {
        this.ctx = ctx;
    }

    public async handle(): Promise<void> {

        try{

            if(!this.ctx) throw Error("no ctx");

            const message: any = this.ctx.message || null;
            if(!message) throw Error('no msg in ctx');
            
            if('is_topic_message' in message) throw Error('topic messages not allowed for this function');

            const isgm = new IsGroupMember(message?.from?.id || 0);
    
            if(
                !message?.chat.id || 
                message?.from?.is_bot || 
                !(await isgm.isGroupMember()) || 
                !('text' in message) || 
                !isTxtMsg(message) || 
                !message?.from?.id!
            ){  
                throw new Error(`basic check for allowed direct msg not passed`);
            }

            if (!(message.chat.type === 'private') || message.chat?.id === _group ) {
                throw new Error(`wrong chat type for direct msg`);
            }

        } catch (e: unknown) {
            console.log("❌ directmsg.js", e instanceof Error ? e.message : e);
        }

    }

}

