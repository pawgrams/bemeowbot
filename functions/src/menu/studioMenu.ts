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

const studioMenu: {inline_keyboard: InlineKeyboardButton[][]} = {

    inline_keyboard: [
        [
            { text: "ℹ️", callback_data: "about_alert" },                                    
        ],
        [
            { text: "/music", callback_data: "music" },
            { text: "ℹ️", callback_data: "music_alert" },
        ],
        [
            { text: "/lyrics", switch_inline_query_current_chat: "/lyrics " },
            { text: "ℹ️", callback_data: "lyrics_alert" },
        ],
        [
            { text: "/image", switch_inline_query_current_chat: "/image " },
            { text: "ℹ️", callback_data: "image_alert" },
        ],
        [
            { text: "/post", callback_data: "post" },
            { text: "ℹ️", callback_data: "post_alert" },
        ],
        [
            { text: "/lang", callback_data: "language" },
            { text: "ℹ️", callback_data: "language_alert" },
        ],

        [
            { text: "<< back to menu", callback_data: "menu" },
        ],
    ],

};

////////////////////////////////////////////////////////////////

export class StudioMenu {
    private ctx: Context;

    constructor(ctx: Context) {
        this.ctx = ctx;
    }

    public async handle(): Promise<void> {

        try{

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
                    throw Error(`🛡 rate limited => studioMenu => user ${userId}`);
                }
            }
            
            const messageIdCallback = this.ctx.callbackQuery && this.ctx.callbackQuery.message && 'message_id' in this.ctx.callbackQuery.message ? this.ctx.callbackQuery.message?.message_id : '';

            let reply = `Welcome ${userName} 😺💕 to the World's 1st Community AI Musikstudio in Web3 😻 Create, Collaborate and Enjoy the Vibes. We're just beginning 🎵🚀`;
            
            reply = `🎹 <b>STUDIO</b>`;
            let msgOpt: any = {
                caption: reply, 
                parse_mode: 'HTML', 
                reply_markup: studioMenu,
            }

            reply = `${reply}<a href="tg://user?id=${userId}">&#8203;</a>`;

            if(messageIdCallback){ 
                this.ctx.telegram.editMessageCaption(
                    _group,
                    messageIdCallback,
                    undefined,
                    reply,
                    { parse_mode: 'HTML', reply_markup: studioMenu }
                );
            } else {
                bot.telegram.sendAnimation(
                    _group,                    
                    _welcomegif || '',
                    msgOpt
                );
            }

        } catch (e: unknown) {
            console.log("❌ studioMenu.js", e instanceof Error ? e.message : e);
        }

    }

}

