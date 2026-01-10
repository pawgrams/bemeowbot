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

export class DubstepMenu {
    private ctx: Context;

    constructor(ctx: Context) {
        this.ctx = ctx;
    }

    public async handle(): Promise<void> {

        try {

            const dubstepMenu: {inline_keyboard: InlineKeyboardButton[][]} = {

                inline_keyboard: [
                    [
                        { text: "/dubstep", callback_data: "/dubstep " },
                        { text: "ℹ️", callback_data: "dubstep_alert" },
                    ],
                    [
                        { text: "/hardstep", callback_data: "/hardstep " },
                        { text: "ℹ️", callback_data: "hardstep_alert" },
                    ],
                    [
                        { text: "/brostep", callback_data: "/brostep " },
                        { text: "ℹ️", callback_data: "brostep_alert" },
                    ],
                    [
                        { text: "/cyberpunk", callback_data: "/cyberpunk " },
                        { text: "ℹ️", callback_data: "cyberpunk_alert" },
                    ],
                    [
                        { text: "/edmstep", callback_data: "/edmstep " },
                        { text: "ℹ️", callback_data: "edmstep_alert" },
                    ],
                    [
                        { text: "/rootstep", callback_data: "/rootstep " },
                        { text: "ℹ️", callback_data: "rootstep_alert" },
                    ],
                    [
                        { text: "/orchstep", callback_data: "/orchstep " },
                        { text: "ℹ️", callback_data: "orchstep_alert" },
                    ],
                    [
                        { text: "/deathstep", callback_data: "/deathstep " },
                        { text: "ℹ️", callback_data: "deathstep_alert" },
                    ],
                    [
                        { text: "/liquidstep", callback_data: "/liquidstep " },
                        { text: "ℹ️", callback_data: "liquidstep_alert" },
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
                    throw Error(`🛡 rate limited => dubstepMenu => user ${userId}`);
                }
            }
            
            const messageIdCallback = this.ctx.callbackQuery && this.ctx.callbackQuery.message && 'message_id' in this.ctx.callbackQuery.message ? this.ctx.callbackQuery.message?.message_id : '';

            let reply = `Hey ${userName} 😽🔆 Here you can create a Dubstep Song. Simply select a Sub-Genre below 🪇🎷 If you use a /song command on replying to a message, that message will be used as lyrics for the song.`;
            
            reply = `🎹 <b>DUBSTEP</b>`;
            let msgOpt: any = {
                caption: reply, 
                parse_mode: 'HTML', 
                reply_markup: dubstepMenu,
            }

            reply = `${reply}<a href="tg://user?id=${userId}">&#8203;</a>`;

            if(messageIdCallback){ 
                this.ctx.telegram.editMessageCaption(
                    _group,
                    messageIdCallback,
                    undefined,
                    reply,
                    { parse_mode: 'HTML', reply_markup: dubstepMenu }
                );
            } else {
                bot.telegram.sendAnimation(
                    _group,                     
                    _welcomegif || '',
                    msgOpt
                );
            }

        } catch (e: unknown){
            console.log("❌ menu => genres => dubstep.js", e instanceof Error ? e.message : e);
        }

    }

}