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

export const mainMenu: {inline_keyboard: InlineKeyboardButton[][]} = {

    inline_keyboard: [
        [
            { text: "🎵  S T U D I O  🎵", callback_data: "studio" },                                      
        ],
        [ 
            { text: "💎 $PLACEHOLDER", url: "https://app.placeholder.com/" },  
            { text: "😻 PLACEHOLDER", switch_inline_query_current_chat: "/placeholder " }, 
        ],
        [
            { text: "🔗 Links", callback_data: "links" },   
            { text: "🚀 Chart", url: "https://dexscreener.com/solana/placeholder" }, 
            { text: "🔎 CA", callback_data: "ca" },                                    
        ],
    ],

};

////////////////////////////////////////////////////////////////

export class MainMenu {
    private ctx: Context;

    constructor(ctx: Context) {
        this.ctx = ctx;
    }

    public async handle(): Promise<void> {

        try{

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
                    throw Error(`🛡 rate limited => mainMenu => user ${userId}`);
                }
            }

            const messageIdCallback = this.ctx.callbackQuery && this.ctx.callbackQuery.message && 'message_id' in this.ctx.callbackQuery.message ? this.ctx.callbackQuery.message?.message_id : '';

            let reply = `🏠 <b>HOME</b>`;
            let msgOpt: any = {
                caption: reply, 
                parse_mode: 'HTML', 
                reply_markup: mainMenu,
            }

            reply += `<a href="tg://user?id=${userId}">&#8203;</a>`;

            if(messageId){  // only if not callback_query
                msgOpt.reply_to_message_id = messageId;
            }

            if(messageIdCallback){ // only if callback

                this.ctx.telegram.editMessageCaption(
                    _group,
                    messageIdCallback,
                    undefined,
                    reply,
                    { parse_mode: 'HTML', reply_markup: mainMenu }
                );
            } else { // only if not callback_query
                bot.telegram.sendAnimation(
                    _group,                     
                    _welcomegif || '',
                    msgOpt
                );
            }

        }catch(e: unknown){
            console.log("❌ main.js", e instanceof Error ? e.message : e);
        }

    }

}
