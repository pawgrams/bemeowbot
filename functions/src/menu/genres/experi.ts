import { Context } from 'telegraf';
import { bot } from '../../context/bot';
import { _group } from '../../context/cache/access';
import { _welcomegif } from '../../context/cache/assets';
import { InlineKeyboardButton  } from 'telegraf/types';
import { userMenuMin } from '../../ratelimits/user/menus/min';
import { groupMenuSec } from '../../ratelimits/group/menus/sec';
import { groupMenuMin } from '../../ratelimits/group/menus/min';
import { groupMenuHour } from '../../ratelimits/group/menus/hour';

////////////////////////////////////////////////////////////////

export class ExperiMenu {
    private ctx: Context;

    constructor(ctx: Context) {
        this.ctx = ctx;
    }

    public async handle(): Promise<void> {

        try {

            const experiMenu: {inline_keyboard: InlineKeyboardButton[][]} = {

                inline_keyboard: [
                    [
                        { text: "/experi", callback_data: "/experi " },
                        { text: "ℹ️", callback_data: "experi_alert" },
                    ],
                    [
                        { text: "/theme", switch_inline_query_current_chat: "/theme " },
                        { text: "ℹ️", callback_data: "theme_alert" },
                    ],
                    [
                        { text: "/goofy", callback_data: "/goofy " },
                        { text: "ℹ️", callback_data: "goofy_alert" },
                    ],
                    [
                        { text: "/cartoon", callback_data: "/cartoon " },
                        { text: "ℹ️", callback_data: "cartoon_alert" },
                    ],
                    [
                        { text: "/brainrot", callback_data: "/brainrot " },
                        { text: "ℹ️", callback_data: "brainrot_alert" },
                    ],
                    [
                        { text: "/cross", callback_data: "/cross " },
                        { text: "ℹ️", callback_data: "cross_alert" },
                    ],
            
                    [
                        { text: "<< back to genres", callback_data: "music" },            
                    ],
                ],

            };
            

            // get group for callback and message case
            const group: number = (this.ctx.callbackQuery ? this.ctx.callbackQuery.message?.chat.id : this.ctx.message?.chat.id) || 0;
            if(group !== _group){
                throw Error(`no group found in ctx of message or callbackquery => callbackquery ? => ${this.ctx.callbackQuery}`);
            }

            // get userdata for callback and message case
            const userName: string = (this.ctx.callbackQuery ? this.ctx.callbackQuery.from.username : this.ctx.message?.from.username) || '';
            const userId: number = (this.ctx.callbackQuery ? this.ctx.callbackQuery.from.id : this.ctx.message?.from.id) || 0;
            if(!userName || !userId){
                throw Error(`no username or userid found in ctx of message or callbackquery => callbackquery ? => ${this.ctx.callbackQuery}`);
            }

            const messageId: number = this.ctx.message ? this.ctx.message?.message_id : 0;

            if(messageId){ // callback excluded given through checking if message id exists
                if(
                    groupMenuSec.RL(_group)     ||
                    groupMenuMin.RL(_group)     ||
                    userMenuMin.RL(userId)      ||
                    groupMenuHour.RL(_group)
                ){
                    throw Error(`🛡 rate limited => experiMenu => user ${userId}`);
                }
            }
            
            const messageIdCallback: number = this.ctx.callbackQuery && this.ctx.callbackQuery.message && 'message_id' in this.ctx.callbackQuery.message ? this.ctx.callbackQuery.message?.message_id : 0;

            let reply: string = `Hey ${userName} 😽🔆 Here you can create an Experimental Song. Simply select a style below 🪇🎷 If you use a /song command on replying to a message, that message will be used as lyrics for the song.`;
            
            reply = `🎹 <b>EXPERIMENTAL</b>`;
            let msgOpt: any = {
                caption: reply, 
                parse_mode: 'HTML', 
                reply_markup: experiMenu,
            }

            reply = `${reply}<a href="tg://user?id=${userId}">&#8203;</a>`;

            if(messageIdCallback){ 
                this.ctx.telegram.editMessageCaption(
                    _group,
                    messageIdCallback,
                    undefined,
                    reply,
                    { parse_mode: 'HTML', reply_markup: experiMenu }
                );
            } else {
                bot.telegram.sendAnimation(
                    _group,                     
                    _welcomegif || '',
                    msgOpt
                );
            }

        } catch (e: unknown){
            console.log("❌ menu => genres => experi.js", e instanceof Error ? e.message : e);
        }

    }

}