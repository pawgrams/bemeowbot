import { Context } from 'telegraf';
import { bot } from '../context/bot';
import { _group } from '../context/cache/access';
import { _welcomegif } from '../context/cache/assets';
import { InlineKeyboardButton  } from 'telegraf/types';
import { userMenuMin } from '../ratelimits/user/menus/min';
import { groupMenuSec } from '../ratelimits/group/menus/sec';
import { groupMenuMin } from '../ratelimits/group/menus/min';
import { groupMenuHour } from '../ratelimits/group/menus/hour';

////////////////////////////////////////////////////////////////

const musicMenu: {inline_keyboard: InlineKeyboardButton[][]} = {

    inline_keyboard: [
        [
            { text: "ℹ️", callback_data: "musicmenu_alert" },
        ],
        [
            { text: "/dnb", callback_data: "dnbmenu" },
            { text: "ℹ️", callback_data: "dnbmenu_alert" },
        ],
        [
            { text: "/drill", callback_data: "drillmenu" },
            { text: "ℹ️", callback_data: "drillmenu_alert" },
        ],
        [
            { text: "/dubstep", callback_data: "dubstepmenu" },
            { text: "ℹ️", callback_data: "dubstepmenu_alert" },
        ],
        [
            { text: "/house", callback_data: "housemenu" },
            { text: "ℹ️", callback_data: "housemenu_alert" },
        ],
        [
            { text: "/reggae", callback_data: "/reggae" },
            { text: "ℹ️", callback_data: "reggae_alert" },
        ],
        [
            { text: "/techno", callback_data: "technomenu" },
            { text: "ℹ️", callback_data: "technomenu_alert" },
        ],
        [
            { text: "/trap", callback_data: "trapmenu" },
            { text: "ℹ️", callback_data: "trapmenu_alert" },
        ],
        [
            { text: "/song", switch_inline_query_current_chat: "/song " },
            { text: "ℹ️", callback_data: "song_alert" },
        ],
        [
            { text: "/beat", switch_inline_query_current_chat: "/beat " },
            { text: "ℹ️", callback_data: "beat_alert" },
        ],
        [
            { text: "/lang", callback_data: "language" },
            { text: "ℹ️", callback_data: "language_alert" },
        ],


        [
            { text: "<< back to studio", callback_data: "studio" },            
        ],
    ],

};

////////////////////////////////////////////////////////////////

export class MusicMenu {
    private ctx: Context;

    constructor(ctx: Context) {
        this.ctx = ctx;
    }

    public async handle(): Promise<void> {

        try {

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
                    throw Error(`🛡 rate limited => musicMenu => user ${userId}`);
                }
            }
            
            const messageIdCallback = this.ctx.callbackQuery && this.ctx.callbackQuery.message && 'message_id' in this.ctx.callbackQuery.message ? this.ctx.callbackQuery.message?.message_id : '';

            let reply = `Hey ${userName} 😽🔆 Here you can generate a Song. Simply select a Genre Template 🪇🎷 or click /song to add your own Prompt for more Customization 🧩🎼. If you reply to a message like this, that message will be used as lyrics for the song.`;
            
            reply = `🎹 <b>GENRES</b>`;
            let msgOpt: any = {
                caption: reply, 
                parse_mode: 'HTML', 
                reply_markup: musicMenu,
            }

            reply = `${reply}<a href="tg://user?id=${userId}">&#8203;</a>`;

            if(messageIdCallback){ 
                this.ctx.telegram.editMessageCaption(
                    _group,
                    messageIdCallback,
                    undefined,
                    reply,
                    { parse_mode: 'HTML', reply_markup: musicMenu }
                );
            } else {
                bot.telegram.sendAnimation(
                    _group,                     
                    _welcomegif || '',
                    msgOpt
                );
            }

        } catch (e: unknown){
            console.log("❌ musicMenu.js", e instanceof Error ? e.message : e);
        }

    }

}