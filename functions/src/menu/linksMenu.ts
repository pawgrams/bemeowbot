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

const linksMenu: {inline_keyboard: InlineKeyboardButton[][]} = {

    inline_keyboard: [
        [
            { text: "Twitter", url: "https://.com/placeholder" },
            { text: "TikTok", url: "https://www.tiktok.com/@placeholder" },
            { text: "Insta", url: "https://www.instagram.com/placeholder/" },
        ],
        [
            { text: "Website", url: "https://placeholder.com/" },
            { text: "Lightpaper", url: "https://drive.google.com/file/d/placeholder/view" },
        ],
        [
            { text: "Beatport", url: "https://www.beatport.com/label/placeholder/125470" },
            { text: "Youtube", url: "https://www.youtube.com/@placeholder" },
            { text: "Soundcloud", url: "https://soundcloud.com/placeholder" },
        ],
        [
            { text: "Linktree", url: "https://linktr.ee/placeholder" },
            { text: "Terms", url: "https://www.placeholder.com/terms" },
        ],
        [
            { text: "<< back to menu", callback_data: "menu" },    
        ],
    ],

};

////////////////////////////////////////////////////////////////

export class LinksMenu {
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
                    throw Error(`🛡 rate limited => linksMenu => user ${userId}`);
                }
            }

            const messageIdCallback = this.ctx.callbackQuery && this.ctx.callbackQuery.message && 'message_id' in this.ctx.callbackQuery.message ? this.ctx.callbackQuery.message?.message_id : '';

            let reply = `<b>Hey ${userName} 😺💕</b> <b>You love PLACEHOLDER?</b>😻\n\nWhether it's about Music or Crypto: Every Repost, Comment and Like brings the Community a step <b>closer to the Pump!</b> 🚀🪐\n`;
            
            reply = `🔗 <b>LINKS</b>`;
            let msgOpt: any = {
                caption: reply, 
                parse_mode: 'HTML', 
                reply_markup: linksMenu,
            }

            reply = `${reply}<a href="tg://user?id=${userId}">&#8203;</a>`;

            if(messageIdCallback){

                this.ctx.telegram.editMessageCaption(
                    _group,
                    messageIdCallback,
                    undefined,
                    reply,
                    { parse_mode: 'HTML', reply_markup: linksMenu }
                );
            } else {
                bot.telegram.sendAnimation(
                    _group,                     
                    _welcomegif || '',
                    msgOpt
                );
            }
            
        } catch(e: unknown){
            console.log("❌ linksMenu.js", e instanceof Error ? e.message : e);
        }

    }

}





