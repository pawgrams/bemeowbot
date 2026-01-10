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

export class TechnoMenu {
    private ctx: Context;

    constructor(ctx: Context) {
        this.ctx = ctx;
    }

    public async handle(): Promise<void> {

        try {

            const technoMenu: {inline_keyboard: InlineKeyboardButton[][]} = {

                inline_keyboard: [
                    [
                        { text: "/techno", callback_data: "/techno " },
                        { text: "ℹ️", callback_data: "techno_alert" },
                    ],
                    [
                        { text: "/melotechno", callback_data: "/melotechno " },
                        { text: "ℹ️", callback_data: "melotechno_alert" },
                    ],
                    [
                        { text: "/futuretechno", callback_data: "/futuretechno " },
                        { text: "ℹ️", callback_data: "futuretechno_alert" },
                    ],
                    [
                        { text: "/darktechno", callback_data: "/darktechno " },
                        { text: "ℹ️", callback_data: "darktechno_alert" },
                    ],
                    [
                        { text: "/electechno", callback_data: "/electechno " },
                        { text: "ℹ️", callback_data: "electechno_alert" },
                    ],
                    [
                        { text: "/peaktechno", callback_data: "/peaktechno " },
                        { text: "ℹ️", callback_data: "peaktechno_alert" },
                    ],
                    [
                        { text: "/hardtechno", callback_data: "/hardtechno " },
                        { text: "ℹ️", callback_data: "hardtechno_alert" },
                    ],
                    [
                        { text: "/minitechno", callback_data: "/minitechno " },
                        { text: "ℹ️", callback_data: "minitechno_alert" },
                    ],
                    [
                        { text: "/psytrance", callback_data: "/psytrance " },
                        { text: "ℹ️", callback_data: "psytrance_alert" },
                    ],
                    [
                        { text: "/psytechno", callback_data: "/psytechno " },
                        { text: "ℹ️", callback_data: "psytechno_alert" },
                    ],
                    [
                        { text: "<< back to genres", callback_data: "music" },            
                    ],
                ],

            };


            // get group for callback and message case
            const group = this.ctx.callbackQuery ? this.ctx.callbackQuery.message?.chat.id : this.ctx.message?.chat.id || 0;
            if(group !== _group){
                throw Error(`no group found in ctx of message or callbackquery => callbackquery ? => ${this.ctx.callbackQuery}`);
            }

            // get userdata for callback and message case
            const userName = this.ctx.callbackQuery ? this.ctx.callbackQuery.from.username : this.ctx.message?.from.username || '';
            const userId = this.ctx.callbackQuery ? this.ctx.callbackQuery.from.id : this.ctx.message?.from.id || 0;
            if(!userName || !userId){
                throw Error(`no username or userid found in ctx of message or callbackquery => callbackquery ? => ${this.ctx.callbackQuery}`);
            }

            const messageId = this.ctx.message ? this.ctx.message?.message_id : '';

            if(messageId){ // callback excluded given through checking if message id exists
                if(
                    groupMenuSec.RL(_group)     ||
                    groupMenuMin.RL(_group)     ||
                    userMenuMin.RL(userId)      ||
                    groupMenuHour.RL(_group)
                ){
                    throw Error(`🛡 rate limited => technoMenu => user ${userId}`);
                }
            }
            
            const messageIdCallback = this.ctx.callbackQuery && this.ctx.callbackQuery.message && 'message_id' in this.ctx.callbackQuery.message ? this.ctx.callbackQuery.message?.message_id : '';

            let reply = `Hey ${userName} 😽🔆 Here you can create a Techno Song. Simply select a Sub-Genre below 🪇🎷 If you use a /song command on replying to a message, that message will be used as lyrics for the song.`;
            
            reply = `🎹 <b>TECHNO</b>`;
            let msgOpt: any = {
                caption: reply, 
                parse_mode: 'HTML', 
                reply_markup: technoMenu,
            }

            reply = `${reply}<a href="tg://user?id=${userId}">&#8203;</a>`;

            if(messageIdCallback){ 
                this.ctx.telegram.editMessageCaption(
                    _group,
                    messageIdCallback,
                    undefined,
                    reply,
                    { parse_mode: 'HTML', reply_markup: technoMenu }
                );
            } else {
                bot.telegram.sendAnimation(
                    _group,                     
                    _welcomegif || '',
                    msgOpt
                );
            }

        } catch (e: unknown){
            console.log("❌ menu => genres => techno.js", e instanceof Error ? e.message : e);
        }

    }

}