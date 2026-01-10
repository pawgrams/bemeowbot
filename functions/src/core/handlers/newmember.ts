import { Context } from 'telegraf';
import { _group } from '../../context/cache/access';
import { IsGroupMember } from '../../utils/users/isGroupMember';
import { Welcome } from '../modules/community/welcome';

////////////////////////////////////////////////////////////////

export class Newmember {
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

            const isgm: IsGroupMember = new IsGroupMember(message?.from?.id || 0);
            
            if(
                !message?.chat || 
                !message?.chat.id || 
                message?.from?.is_bot || 
                !(await isgm.isGroupMember()) || 
                !('id' in message?.chat) || 
                !message?.from?.id! || 
                message?.chat?.id !== _group 
            ){  
                throw new Error(`message is cannot be a valid new member msg`);
            }

            if (!('new_chat_members' in message)|| !message.new_chat_members || message.chat?.id !== _group){
                throw new Error(`message is not new member msg or new member is not member of group`);
            }

            new Welcome(_group, message.new_chat_members).welcome();

        } catch (e: unknown) {
            console.log("❌ commands.js", e instanceof Error ? e.message : e);
        }

    }

}



