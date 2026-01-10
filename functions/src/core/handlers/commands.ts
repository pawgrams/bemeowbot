import { Context } from 'telegraf';
import { _group } from '../../context/cache/access';
import { botnames } from '../../context/cache/botnames';
import { IsGroupMember } from '../../utils/users/isGroupMember';
import { isTxtMsg } from '../../utils/text/isTxtMsg';
import { dev1, dev2 } from '../../context/cache/devs';

import { SendTipp } from '../modules/info/tipps';
import { songTemplates } from '../modules/studio/music/songTemplates';
import { genres } from '../modules/studio/music/genres';

import { groupCommandSec } from '../../ratelimits/group/command/sec';
import { groupCommandMin } from '../../ratelimits/group/command/min';
import { userCommandSec } from '../../ratelimits/user/command/sec';
import { userCommandMin } from '../../ratelimits/user/command/min';

import { Router } from './router';

////////////////////////////////////////////////////////////////

export class Commands {
    private ctx: Context;

    constructor(ctx: Context) {
        this.ctx = ctx;
    }

    public async handle() {

        try{

            if(!this.ctx) throw Error("no ctx");
            if(this.ctx.callbackQuery) throw Error("cmd cannot be cb");

            const message: any = this.ctx.message || null;
            if(!message) throw Error("no msg in ctx");

            const msgTxt: string = 'text' in message && isTxtMsg(message) && message.text ? message.text.trim() : '';
            if(!msgTxt) throw Error("msg is not a text");
               
            if('is_topic_message' in message) throw Error('topic messages not allowed for this function');

            const user: any = 'from' in message && message.from ? message.from : null;
            if(!user) throw Error("no user in msg");
            
            if(!(await new IsGroupMember(message?.from?.id || 0).isGroupMember())) throw Error("user is not a group member");

            const userId: number = 'id' in user && user.id ? user.id : 0;
            if(!userId) throw Error("no user id")

            const group: number = 'from' in message && message.chat && 'id' in message.chat && message.chat.id ? message.chat.id : 0;
            if(!group) throw Error("no chat id in msg");
            if(group !== _group) throw Error("group not allowed")

            const isBot: boolean = 'is_bot' in user && user.is_bot ? true : false;
            if(isBot) throw Error("bot users not allowed");

            if( (
                groupCommandSec.RL(_group) ||
                userCommandSec.RL(userId)  ||
                groupCommandMin.RL(_group) ||
                userCommandMin.RL(userId)
                ) && userId !== dev1.id && userId !== dev2.id
            ){
                throw Error(`🛡 rate limited => group or user ${message?.from?.id} ${message?.from?.username} => callback`);
            }

            new SendTipp().sendTipp(); 
            let inputMsg = msgTxt|| '';

            const startsWithBotname: string = botnames.filter(prefix => inputMsg.startsWith(prefix))[0];
            if(startsWithBotname) inputMsg = inputMsg.split(`${startsWithBotname} `)[1].trim() || '';

            const includesWithBotname: string = botnames.find(prefix => inputMsg.includes(prefix)) || ''; // falls jemand auf command text in einer msg klickt
            if(includesWithBotname) inputMsg = inputMsg.replace(includesWithBotname, "").trim();

            inputMsg = inputMsg.toLowerCase();
            let command = inputMsg.split(' ')[0].trim();

            if(  
                ( Object.keys(songTemplates).includes(command.slice(1).trim()) || Object.keys(genres).includes(command.slice(1).trim()) ) 
            ){
                command = '/song';

            } else if(command === "/music" || msgTxt.startsWith("/music")){ 
                command = "/song";

            } else if(command === "/menu" || msgTxt.startsWith("/menu")){ 
                command = "/menu";

            } else if(command === "/studio" || msgTxt.startsWith("/studio")){ 
                command = "/studio";

            } else if( message.text && (msgTxt.startsWith("/beat") || msgTxt.startsWith("/beat "))){
                command = '/song';

            } else if( command && (command.startsWith("/beat") || command.startsWith("/beat "))){
                command = '/song';

            } else if(command === "/lyrics" || inputMsg.startsWith("/lyrics")){
                command = "/lyrics";
            }

            new Router(this.ctx, command.slice(1)).route(); 

        } catch (e: unknown) {
            console.log("❌ commands.js", e instanceof Error ? e.message : e);
        }

    }

}

