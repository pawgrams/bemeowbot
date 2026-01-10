import { Context } from 'telegraf';
import { InlineKeyboardButton  } from 'telegraf/types';
import { bot } from '../context/bot';
import { _group } from '../context/cache/access';
import { _welcomegif } from '../context/cache/assets';
import { userMenuMin } from '../ratelimits/user/menus/min';
import { groupMenuSec } from '../ratelimits/group/menus/sec';
import { groupMenuMin } from '../ratelimits/group/menus/min';
import { groupMenuHour } from '../ratelimits/group/menus/hour';

////////////////////////////////////////////////////////////////

const langMenu: {inline_keyboard: InlineKeyboardButton[][]} = {

    inline_keyboard: [

        [
            { text: "ℹ️", callback_data: "langMenu_alert" },
        ],

        [ 
            { text: "🎲", callback_data: "lang_random" },
            { text: "😺", callback_data: "lang_meow" },
            { text: "😻", callback_data: "lang_meow-meow" },
            { text: "🌍", callback_data: "lang_esperanto" },      
        ],

        [
            { text: "🤖", callback_data: "lang_robot" },
            { text: "🙄", callback_data: "lang_gen-z" }, 
            { text: "🚀", callback_data: "lang_crypto" },
            { text: "🤪", callback_data: "lang_gibberish" }, 
            { text: "🖖", callback_data: "lang_klingon" }, 
        ],

        [ 
            { text: "📀", callback_data: "lang_english" },
            { text: "🇺🇸", callback_data: "lang_american" },
            { text: "✊🏿", callback_data: "lang_aave" },
            { text: "🇬🇧", callback_data: "lang_british" }, 
            { text: "🇯🇲", callback_data: "lang_jamaican" }, 
        ],

        [ 
            { text: "🇪🇸", callback_data: "lang_spanish" }, 
            { text: "🇵🇹", callback_data: "lang_portuguese" },
            { text: "🇫🇷", callback_data: "lang_french" }, 
            { text: "🇮🇹", callback_data: "lang_italian" },
            { text: "🇩🇪", callback_data: "lang_german" }, 
            { text: "🇬🇷", callback_data: "lang_greek" },
        ],

        [
            { text: "🇰🇷", callback_data: "lang_korean" },
            { text: "🇯🇵", callback_data: "lang_japanese" },
            { text: "🇷🇺", callback_data: "lang_russian" }, 
            { text: "🇨🇳", callback_data: "lang_chinese" }, 
            { text: "🛕", callback_data: "lang_tibetan" }, 
            { text: "🇮🇳", callback_data: "lang_indian" }, 
        ],

        [ 
            { text: "🇰🇪", callback_data: "lang_kiswahili" }, 
            { text: "🇿🇦", callback_data: "lang_zulu" }, 
            { text: "🇳🇬", callback_data: "lang_fulani" },   
            { text: "🇪🇹", callback_data: "lang_amharic" },
            { text: "🇦🇴", callback_data: "lang_angolan" },   
            { text: "🇨🇮", callback_data: "lang_baoulé" }, 
            { text: "🇬🇭", callback_data: "lang_akan-twi" },
        ],

        [
            { text: "🇸🇦", callback_data: "lang_arabic" }, 
            { text: "🇲🇦", callback_data: "lang_amazigh" }, 
            { text: "🇩🇿", callback_data: "lang_berber" },
            { text: "🇪🇬", callback_data: "lang_coptic" },
            { text: "🇮🇱", callback_data: "lang_hebrew" }, 
        ],

        [ 
            { text: "🇹🇷", callback_data: "lang_turkish" },    
            { text: "🇸🇾", callback_data: "lang_aramaic" }, 
            { text: "🇮🇶", callback_data: "lang_sumerian" },
            { text: "🇱🇧", callback_data: "lang_phoenician" }, 
            { text: "🇮🇷", callback_data: "lang_persian" },
        ],

        [
            { text: "🇳🇱", callback_data: "lang_dutch" },
            { text: "🇦🇹", callback_data: "lang_austrian" },
            { text: "🇨🇭", callback_data: "lang_swiss" }, 
            { text: "🇧🇪", callback_data: "lang_flemish" },     
        ],

        [
            { text: "🇵🇱", callback_data: "lang_polish" }, 
            { text: "🇨🇿", callback_data: "lang_czech" },  
            { text: "🇧🇾", callback_data: "lang_belarussian" },  
            { text: "🇺🇦", callback_data: "lang_ukrainian" },
            { text: "🇸🇰", callback_data: "lang_slovakian" },
            { text: "🇸🇮", callback_data: "lang_slovenian" },
        ],

        [
            { text: "🇭🇺", callback_data: "lang_hungarian" },
            { text: "🇭🇷", callback_data: "lang_croatian" }, 
            { text: "🇷🇸", callback_data: "lang_serbian" },
            { text: "🇧🇦", callback_data: "lang_bosnian" },
            { text: "🇷🇴", callback_data: "lang_romanian" },
            { text: "🇧🇬", callback_data: "lang_bulgarian" },
            { text: "🇦🇱", callback_data: "lang_albanian" }, 
        ],

        [ 
            { text: "🇸🇪", callback_data: "lang_swedish" },
            { text: "🇳🇴", callback_data: "lang_norwegian" },
            { text: "🇩🇰", callback_data: "lang_denish" },
            { text: "🇫🇮", callback_data: "lang_finnish" },
            { text: "🇮🇸", callback_data: "lang_icelandic" },    
            { text: "🇨🇦", callback_data: "lang_inuktitut" },
            { text: "🇬🇱", callback_data: "lang_kalaallisut" }, 
        ],

        [
            { text: "🇹🇭", callback_data: "lang_thai" }, 
            { text: "🇵🇭", callback_data: "lang_filipino" }, 
            { text: "🇮🇩", callback_data: "lang_indonesian" },  
            { text: "🇲🇾", callback_data: "lang_malay" },  
            { text: "🇻🇳", callback_data: "lang_vietnamesian" },   
        ],

        [ 
            { text: "🏝️", callback_data: "lang_hawaian" }, 
            { text: "🇵🇫", callback_data: "lang_tahitian" },
            { text: "🇳🇺", callback_data: "lang_niuean" }, 
            { text: "🇫🇯", callback_data: "lang_fijian" },
            { text: "🇹🇰", callback_data: "lang_tokelauan" },
        ],

        [
            { text: "🇦🇺", callback_data: "lang_australian" },
            { text: "🇹🇴", callback_data: "lang_tongan" },
            { text: "🇳🇿", callback_data: "lang_māori" },
            { text: "🇻🇺", callback_data: "lang_bislama" },
            { text: "🇼🇸", callback_data: "lang_samoan" },
        ],

        [
            { text: "🇵🇪", callback_data: "lang_quechua" }, 
            { text: "🇵🇾", callback_data: "lang_guarani" },
            { text: "🇲🇽", callback_data: "lang_nahuatl" },
            { text: "🇧🇷", callback_data: "lang_huni-kuin" },
            { text: "🦅", callback_data: "lang_cherokee" },
            { text: "🐺", callback_data: "lang_lakota" },
            { text: "🦬", callback_data: "lang_navajo" },
        ],

        [
            { text: "🇮🇪", callback_data: "lang_irish" },
            { text: "🏰", callback_data: "lang_old-english" },
            { text: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", callback_data: "lang_welsh" }, 
            { text: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", callback_data: "lang_scottish" },
        ],

        [ 
            { text: "🏛️", callback_data: "lang_archaic-latin" }, 
            { text: "😈", callback_data: "lang_reverse-archaic-latin" }, 
            { text: "⛪", callback_data: "lang_gregorian" },
            { text: "🔆", callback_data: "lang_ancient-egyptian" }, 
        ],
            
        [
            { text: "<< back to studio", callback_data: "studio" },            
        ],

    ],

};

////////////////////////////////////////////////////////////////

export class LangMenu {
    private ctx: Context;

    constructor(ctx: Context) {
        this.ctx = ctx;
    }

    public async handle(): Promise<void> {

        try {

            // get group for callback and message case
            const group: number = (this.ctx.callbackQuery ? this.ctx.callbackQuery.message?.chat.id : this.ctx.message?.chat.id) || 0;
            if(group !== _group){
                throw Error(`no group found in ctx of message or callbackquery => callbackquery ? => ${this.ctx.callbackQuery}`);
            }

            // get userdata for callback and message case
            const userName: string = (this.ctx.callbackQuery ? this.ctx.callbackQuery.from.username : this.ctx.message?.from.username) || '';
            const userId: number = this.ctx.callbackQuery ? this.ctx.callbackQuery.from.id : this.ctx.message?.from.id || 0;
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
                    throw Error(`🛡 rate limited => langMenu => user ${userId}`);
                }
            }
            
            const messageIdCallback: number = this.ctx.callbackQuery && this.ctx.callbackQuery.message && 'message_id' in this.ctx.callbackQuery.message ? this.ctx.callbackQuery.message?.message_id : 0;

            let reply: string = `Hey ${userName} 😽🔆 Here you can generate a Song. Simply select a Genre Template 🪇🎷 or click /song to add your own Prompt for more Customization 🧩🎼. If you reply to a message like this, that message will be used as lyrics for the song.`;
            
            reply = `🌍 <b>LANGUAGES</b>\n\nSet a language for your next lyrics or song generation`;
            let msgOpt: any = {
                caption: reply, 
                parse_mode: 'HTML', 
                reply_markup: langMenu,
            }

            reply = `${reply}<a href="tg://user?id=${userId}">&#8203;</a>`;

            if(messageIdCallback){ 
                this.ctx.telegram.editMessageCaption(
                    _group,
                    messageIdCallback,
                    undefined,
                    reply,
                    { parse_mode: 'HTML', reply_markup: langMenu }
                );
            } else {
                bot.telegram.sendAnimation(
                    _group,                     
                    _welcomegif || '',
                    msgOpt
                );
            }

        } catch (e: unknown){
            console.log("❌ langMenu.js", e instanceof Error ? e.message : e);
        }

    }

}