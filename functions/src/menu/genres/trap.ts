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

export class TrapMenu {
    private ctx: Context;

    constructor(ctx: Context) {
        this.ctx = ctx;
    }

    public async handle(): Promise<void> {

        try {

            const trapMenu: {inline_keyboard: InlineKeyboardButton[][]} = {

                inline_keyboard: [
                    [
                        { text: "/trap", callback_data: "/trap " },
                        { text: "ℹ️", callback_data: "trap_alert" },
                    ],
                    [
                        { text: "/futurebass", callback_data: "/futurebass " },
                        { text: "ℹ️", callback_data: "futurebass_alert" },
                    ],
                    [
                        { text: "/hardtrap", callback_data: "/hardtrap " },
                        { text: "ℹ️", callback_data: "hardtrap_alert" },
                    ],
                    [
                        { text: "/arabtrap", callback_data: "/arabtrap " },
                        { text: "ℹ️", callback_data: "arabtrap_alert" },
                    ],
                    [
                        { text: "/latintrap", callback_data: "/latintrap " },
                        { text: "ℹ️", callback_data: "latintrap_alert" },
                    ],
                    [
                        { text: "/afrotrap", callback_data: "/afrotrap " },
                        { text: "ℹ️", callback_data: "afrotrap_alert" },
                    ],
                    [
                        { text: "/edmtrap", callback_data: "/edmtrap " },
                        { text: "ℹ️", callback_data: "edmtrap_alert" },
                    ],
                    [
                        { text: "/poptrap", callback_data: "/poptrap " },
                        { text: "ℹ️", callback_data: "poptrap_alert" },
                    ],
                    [
                        { text: "/liquidtrap", callback_data: "/liquidtrap " },
                        { text: "ℹ️", callback_data: "liquidtrap_alert" },
                    ],
                    [
                        { text: "/orchtrap", callback_data: "/orchtrap " },
                        { text: "ℹ️", callback_data: "orchtrap_alert" },
                    ],
                    [
                        { text: "/deathtrap", callback_data: "/deathtrap " },
                        { text: "ℹ️", callback_data: "deathtrap_alert" },
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
                    throw Error(`🛡 rate limited => trapMenu => user ${userId}`);
                }
            }
            
            const messageIdCallback = this.ctx.callbackQuery && this.ctx.callbackQuery.message && 'message_id' in this.ctx.callbackQuery.message ? this.ctx.callbackQuery.message?.message_id : '';

            let reply = `Hey ${userName} 😽🔆 Here you can create a Trap Song. Simply select a Sub-Genre below 🪇🎷 If you use a /song command on replying to a message, that message will be used as lyrics for the song.`;
            
            reply = `🎹 <b>TRAP</b>`;
            let msgOpt: any = {
                caption: reply, 
                parse_mode: 'HTML', 
                reply_markup: trapMenu,
            }

            reply = `${reply}<a href="tg://user?id=${userId}">&#8203;</a>`;

            if(messageIdCallback){ 
                this.ctx.telegram.editMessageCaption(
                    _group,
                    messageIdCallback,
                    undefined,
                    reply,
                    { parse_mode: 'HTML', reply_markup: trapMenu }
                );
            } else {
                bot.telegram.sendAnimation(
                    _group,                     
                    _welcomegif || '',
                    msgOpt
                );
            }

        } catch (e: unknown){
            console.log("❌ menu => genres => trap.js", e instanceof Error ? e.message : e);
        }

    }

}