const crypto = require('crypto');
// Context Imports
import { Context } from 'telegraf';
import { Message } from 'telegraf/types';
import { botnames } from '../../../../context/cache/botnames';
import { bot } from '../../../../context/bot';
import { _group } from '../../../../context/cache/access';
import { dev1, dev2 } from '../../../../context/cache/devs';
import { recentMessages } from '../../chatbot/recentMessages';
// Rate Limits
import { groupSongSec } from '../../../../ratelimits/group/song/sec';
import { groupSongMin } from '../../../../ratelimits/group/song/min';
import { groupSongHour } from '../../../../ratelimits/group/song/hour';
import { groupSongDay } from '../../../../ratelimits/group/song/day';
import { userSongMin } from '../../../../ratelimits/user/song/min';
import { userSongHour } from '../../../../ratelimits/user/song/hour';
import { userSongDay } from '../../../../ratelimits/user/song/day';
// Utils
import { HandleErrorType } from '../../../../utils/misc/handleErrorType';
import { ThreeDotsOwnLine } from '../../../../utils/text/threeDotsOwnLine';
// OpenAI
import { IsAssistantErrorMsg } from '../../../../endpoints/openai/isAssistantErrorMsg';
// Language
import { exoticlangs } from '../lyrics/language/exoticlangs';
import { NextLang } from '../lyrics/language/nextLang';
import { langMap } from '../lyrics/language/langMap';
import { GetLanguage } from '../lyrics/language/getLanguage';
// Music
import { genres } from './genres';
import { songTemplates } from './songTemplates';
import { BeatLyrics, beatSectionCaptionWithEmoji } from './beatLyrics';
import { GetTitle } from './getTitle';
import { Suno } from './suno';
import { LyricsHandler } from '../lyrics/lyricsHandler';

///////////////////////////////////////////////////////////////////////////////////////////////


export class Song {

    private ctx: Context;

    constructor(ctx: Context) { this.ctx = ctx; }

    public async handle(): Promise<void> {

        let maxstyle = 119; 
        let userName: string = ''; let userId = 0;
        let title: string = "";  let style: string = '';  let languages: string[] = []; let structure: string = ''; let negative: string = ''; let template: any[] = [];
        let lyrics: string = ''; let topic: string = ''; let lyricsIx: string = '';
        let language: string = 'english'; let isExotic: boolean = false; let langPlain: string = ''; let langForLyrics: string = ''; let langForStyle: string = ''; let flag: string = ''
        let langForDramaturgy: string = '';
        let languageCaptions: string[] = [];
        let lyricsForChat: string = '';
        let rhymes: string = ""
        let langNegative: string = "";

        try {

            const nextLang: NextLang = new NextLang();

            ///////////////////////////////////////   BASIC CHECKS   ///////////////////////////////////////////

            let queryType: string = '';
            queryType = this.ctx.callbackQuery ? 'cb' : '';
            queryType = this.ctx.message && 'text' in this.ctx.message && this.ctx.message.text ? 'cmd' : queryType;
    
            const query: string = this.ctx.callbackQuery ? 'cb' : this.ctx.message && 'text' in this.ctx.message && this.ctx.message.text ? 'cmd' : '';
            if(!query) throw Error('query is not valid');

            const group: number = (this.ctx.callbackQuery ? this.ctx.callbackQuery.message?.chat.id : this.ctx.message?.chat.id) || 0;
            if(group !== _group) throw Error(`no group found in this.ctx of message or callbackquery => callbackquery ? => ${this.ctx.callbackQuery}`);

            const _userName: string = (this.ctx.callbackQuery ? this.ctx.callbackQuery.from.username : this.ctx.message?.from.username) || '';
            userId = (this.ctx.callbackQuery ? this.ctx.callbackQuery.from.id : this.ctx.message?.from.id) || 0;
            if(!_userName || !userId) throw Error(`E-CODE_011: no username or userid found in this.ctx of message or callbackquery => callbackquery ? => ${this.ctx.callbackQuery}`);

            userName = _userName;
            const firstName: string = (this.ctx.callbackQuery?.from?.first_name ?? this.ctx.message?.from.first_name) ?? '';
            const lastName: string = (this.ctx.callbackQuery?.from?.last_name ?? this.ctx.message?.from.last_name) ?? '';
            const artist: string = firstName ? firstName : '' + lastName ? lastName : userName || '';
            if(!artist) throw Error('E-CODE_012: no artist name found');

            const userLyrics: string = this.ctx.message && 'reply_to_message' in this.ctx.message && this.ctx.message.reply_to_message
            && 'text' in this.ctx.message.reply_to_message && this.ctx.message.reply_to_message.text ? this.ctx.message.reply_to_message.text : '';

            if( (
                groupSongSec.RL(_group)   || 
                groupSongMin.RL(_group)   ||  userSongMin.RL(userId)    || 
                groupSongHour.RL(_group)  ||  userSongHour.RL(userId)   ||  
                groupSongDay.RL(_group)   ||  userSongDay.RL(userId) 
                ) && userId !== dev1.id && userId !== dev2.id
            ){
                throw Error(`E-CODE_008: 🛡 group or user user rate limit hit ${userId} ${userName}`);
            }

            const messageId: number = this.ctx.message && 'message_id' in this.ctx.message && this.ctx.message.message_id ? this.ctx.message.message_id : 0;
            let inputMsg: string = this.ctx.message && 'text' in this.ctx.message && this.ctx.message.text ? this.ctx.message.text : '';

            if(query === 'cb'){
                inputMsg = this.ctx.callbackQuery && 'data' in this.ctx.callbackQuery && this.ctx.callbackQuery.data ? this.ctx.callbackQuery.data : '';
            } 

            ///////////////////////////////////////   CLASSIFY REQUEST CATEGORY   ///////////////////////////////////////////

            const startsWithBotname: string  = botnames.find(prefix => inputMsg && inputMsg.startsWith(prefix)) || '';
            if(startsWithBotname) inputMsg = inputMsg.split(`${startsWithBotname} `)[1].trim() || '';

            const includesWithBotname: string  = botnames.find(prefix => inputMsg && inputMsg.includes(prefix)) || '';  // falls jemand auf command text in einer msg geklickt hat
            if(includesWithBotname && inputMsg) inputMsg = inputMsg.replace(includesWithBotname, "");

            inputMsg = inputMsg.toLowerCase().trim() || '';
            if(!inputMsg) throw Error(`no valid input in user message`);

            let isSong: boolean = false; 
            if (inputMsg.startsWith("/song")) {
                inputMsg = inputMsg.slice(5).trim() || '';
                isSong = true;
                maxstyle = 119;
            } 

            let isBeat: boolean = false;
            if(!isSong && inputMsg.startsWith("/beat")){
                inputMsg = inputMsg.slice(5).trim() || '';
                isBeat = true;
                maxstyle = 149;
            } else {
                isSong = true;
                maxstyle = 119;
            }

            if(userLyrics){
                isBeat = false;
                isSong = true;
                maxstyle = 119;
            }

            //////////////////////////////////  REQUEST LOGGED MSG TO USER  /////////////////////////////////////////////

            let estimatedProcessingTime: string = '';
            if(isBeat){
                estimatedProcessingTime = `Creation takes up to 5 minutes`;
            } else if(!isBeat && isSong && userLyrics){
                estimatedProcessingTime = `Creation takes up to 6 minutes`;
            } else {
                estimatedProcessingTime = `Creation takes up to 7 minutes`;
            }

            let msgOpt: any = {parse_mode: 'HTML'}
            if(messageId) msgOpt.reply_to_message_id = messageId
            
            const initMsgText: string = `Hey @${userName} 😻🎧 Request logged & Basic checks done 👍 ${estimatedProcessingTime} 🥁🎵 <a href="tg://user?id=${userId}">&#8203;</a>`;
            const sentInitMsg: Message = await bot.telegram.sendMessage(
                _group,
                initMsgText,
                msgOpt
            );
            const initbotMsg: number = sentInitMsg && 'message_id' in sentInitMsg && sentInitMsg.message_id ? sentInitMsg.message_id : 0
            if(!initbotMsg) throw Error('E-CODE_010: failed to send initial song message');

            //////////////////////////////////  CHECK IF SUB OR MAIN IN CMD / CB  /////////////////////////////////////////////

            const maingenres: string[] = Object.keys(genres) || [];
            let maingenre: string = maingenres.find(m => inputMsg.startsWith('/' + m + ' ') || ('/' + m) == inputMsg ) || '';
            
            if(maingenre && maingenre.length > 0){
                inputMsg = inputMsg.slice(maingenre.length + 1).trim() || '';
            }

            let subgenres: string[] = Object.keys(songTemplates) || [];
            let subgenre: string | undefined = subgenres.find(s => inputMsg.startsWith(`/${s}`));
            if(subgenre && subgenre.length > 0){
                inputMsg = inputMsg.slice(subgenre.length + 1).trim() || '';
            }

            //////////////////// ONLY USERPROMPT IF USERPROMPT BUT NO MAIN OR SUB GIVEN  /////////////////////

            // user style prompt if no main and sub given  
            if(query === 'cmd' && (isSong || isBeat) && inputMsg.length > 40 && !maingenre && !subgenre){    
                style = inputMsg;
                if(style && style.length > 0){  
                    // no summarize(), cuz prompt order inhibit + diff amt of dots 
                    if(style.length > 119){ style = style.slice(0, style.lastIndexOf(" ", 119)); } 
                }   

            ////////////////////////////  SELECT MODULAR PROMPTS FOR SUBGENRE   /////////////////////////////

            } else { // fetch data if sub or main given

                const getTemplate = async (sub: string) => { // rand sub variant
                    const templates = songTemplates[sub];
                    if(templates && templates.length > 0){
                        const randindex: number = Math.floor(Math.random() * templates.length) || 0;
                        const randtemplate: any = templates[randindex] || templates[0];
                        return [randtemplate["style"], randtemplate["language"], randtemplate["lyrics"], randtemplate["structure"], randtemplate["negative"] ];
                    }
                    return ['', ['english'], [''], 'mid', ''];
                }

                const getSubgenre = async (main: string = '') => { // rand sub
                    let sub: string = '';
                    if(!main){
                        if(subgenres && subgenres.length > 0){
                            const randindex: number = Math.floor(Math.random() * subgenres.length) || 0;
                            sub = subgenres[randindex];
                        }
                    } else {
                        const subsOfMain: string[] = genres[main] || [];
                        if(subsOfMain && subsOfMain.length > 0){
                            const randindex: number = Math.floor(Math.random() * subsOfMain.length) || 0;
                            sub = subsOfMain[randindex];
                        }
                    }
                    return sub;
                }

                //----------------------------------- // FETCH GENRE TEMPLATES  //--------------------------------- 

                if(!subgenre) subgenre = await getSubgenre(maingenre);
                if(subgenre){ 
                    template = await getTemplate(subgenre);
                } else { 
                    throw Error('E-CODE_010: no subgenre found'); 
                }
                if(subgenre && !maingenre){ // if main not given yet => fetch main via sub 
                    for(let m in maingenres){ if(genres[m].includes(subgenre)){ maingenre = m; break; } }
                }; 
                if(!maingenre) maingenre == subgenre; // if still no main => fallback: main = sub

                style = template[0];
                languages = template[1];
                if(template[2] && template[2].length > 0){
                    const topics: number = Math.max(1, Math.round(template[2].length / 2.8));
                    topic = [...template[2]].sort(() => 0.5 - Math.random()).slice(0, topics).join('; ');
                }
                structure = template[3];
                negative = template[4];

                //--------------------------- // FORMAT LANGUAGE FOR STYLE AND LYRICS  //--------------------------- 

                const _language: string = await new GetLanguage(userId, languages, style).getLanguage();
                if(_language){ 
                    language = _language || 'english'
                }
                const exoticlangsKeys: string[] = Object.keys(exoticlangs) || [];
                if(exoticlangsKeys && exoticlangsKeys.length > 0 && exoticlangsKeys.includes(language)){
                    isExotic = true;
                }

                langPlain = nextLang.formatLang(language).toLowerCase();

                if(langMap && langMap[language]){

                    if(langMap[language].length > 5 && langMap[language][5] && langMap[language][5].length > 0){
                        languageCaptions = langMap[language][5] || [];
                    } 
                    if(langMap[language].length > 3 && langMap[language][3]){
                        langForDramaturgy = langMap[language][3] || '';
                    } 
                    if(langMap[language].length > 2 && langMap[language][2]){
                        langForStyle = langMap[language][2] || langPlain || '';
                        langForDramaturgy = langForDramaturgy ? langForDramaturgy : langForStyle || langPlain || '';
                    } 
                    if(langMap[language].length > 1 && langMap[language][1]){
                        langForLyrics = langMap[language][1] ? langMap[language][1] : langForDramaturgy || langForStyle || langPlain || '';
                    }
                    if(langMap[language].length > 0 && langMap[language][0]){
                        flag = langMap[language][0] || ''
                    }
                    if(langMap[language].length > 4 && langMap[language][4]){
                        langNegative = langMap[language][4] || ''
                    }

                } else {
                    langForStyle = langForStyle || langPlain;
                    langForLyrics = langForLyrics ? langForLyrics : langForStyle || langPlain;
                }

                // if language missing because of userPrompt slicing then attach language again, but at the end
                if(!isBeat && langForStyle && style && !style.includes("{{__LANGUAGE__}}")){ 
                    style = style.slice(0, 118 - "{{__LANGUAGE__}}".length) + "{{__LANGUAGE__}}";
                }
                if(style && style.includes("{{__LANGUAGE__}}")){
                    if(isBeat){
                        style = style.replace("{{__LANGUAGE__}}", "");
                    } else if (langForStyle){
                        style = style.replace("{{__LANGUAGE__}}", langForStyle);
                    }

                    if(style && style.includes("Archaic-")){ 
                        style = style.replace("Archaic-", "");
                    }
                }
                nextLang.resetLang(userId);

                //---------------------------  MERGE IF USERPOMPT AND STYLE  -----------------------------------------

                if(inputMsg && inputMsg.length > 3 && style && style.length > 0){   
                    let userStyle: string = inputMsg;
                    let stylebaselen: number = style.indexOf(".") || 50;
                    const remaining: number = Math.max(maxstyle - (stylebaselen + userStyle.length + 1), 0);
                    if(remaining && remaining > 0){
                        stylebaselen = style.slice(0, stylebaselen + remaining).lastIndexOf(" ") || stylebaselen;
                    }
                    const maxuser: number = Math.max(119 - stylebaselen, 0) || 0; 
                    if(userStyle && userStyle.length > 0 && userStyle.length > maxuser){                                     
                        userStyle = userStyle.slice(0 , userStyle.slice(0, maxuser).lastIndexOf(" ")) || userStyle.slice(0, maxuser) || '';
                    }
                    style = style.slice(0, stylebaselen) + ". " + userStyle;

                    if(!style || style.length < template[1].lastIndexOf(" ")){
                        style = template[1];
                    }

                    if(style && style.length > 119){
                        style = style.slice(0, style.slice(0, 119).lastIndexOf(" ")) || style.slice(0, 119);
                    }

                }

                if(style && style.length > 0 && langForStyle && langForStyle.length > 0 && !style.includes(langForStyle)){
                    if(117 - style.length >= langForStyle.length){
                        style = style + ". " + langForStyle;
                    } else if (117 - style.length < langForStyle.length) {
                        style = style.slice(0, style.slice(0, 117 - langForStyle.length).lastIndexOf(" ")) + ". " + langForStyle;
                    }
                }

                //---------------------------------------------------------------------------------------------------------

            }

            //////////////////////////////////  USER SENT LYRICS  /////////////////////////////////////////////

            if(userLyrics){ // din't generate lyrics, if user sends own lyrics
                console.log("USER SENT LYRICS => no lyrics creation => USE USER LYRICS FOR SONG");
                lyrics = userLyrics ? userLyrics : lyrics || '';

            //////////////////////////////////  GENERATE LYRICS  /////////////////////////////////////////////  

            } else if (!userLyrics && !lyrics){   

                if(isSong && !isBeat){

                    let maxretry: number = 8;
                    
                    lyrics = await new LyricsHandler(
                        topic, langForLyrics, style, structure, isExotic, rhymes, langForStyle, langPlain, "", // no user prompt for lyrics, if song
                        subgenre,
                        maingenre
                    ).handle();

                    if(!lyrics) throw Error(`no lyrics => ${maxretry} retries left`);

                    const assmsgerr: IsAssistantErrorMsg = new IsAssistantErrorMsg(lyrics);
                    if(assmsgerr.isAssistantErrorMsg()) throw Error(`invalid lyrics result => retries left`);

                    lyrics = await new ThreeDotsOwnLine(lyrics).threeDotsOwnLine();

                } else { // if beat, then...
                    const newBeatLyrics: BeatLyrics = new BeatLyrics(structure);
                    const beatLyrics: string = newBeatLyrics.beatLyrics();
                    if(beatLyrics) lyrics = beatLyrics;

                }

            }

            //////////////////////////////////  MANUAL TEXT FORMATTIING  /////////////////////////////////////////////

            if(lyrics) lyrics = lyrics.replace(/\]/g, `: ]`);

            if(lyrics && flag) lyrics = lyrics.replace(/\[/g, `\n[${flag} `);

            if(isSong){
                const shuffledLanguageCaptions: string[] = languageCaptions.slice().sort(() => Math.random() - 0.5);
                if(!isBeat && lyrics && shuffledLanguageCaptions && shuffledLanguageCaptions.length > 0){
                    let i = 0;
                    lyrics = lyrics.replace(/]/g, () => shuffledLanguageCaptions[i++ % shuffledLanguageCaptions.length] + ']');
                }
            } else {
                lyrics = lyrics.replace(/]/g, `${beatSectionCaptionWithEmoji}]`);
            }

            if(!isBeat && lyrics) lyricsForChat = lyrics; 
            if(!lyrics && !isBeat) throw Error(`E-CODE_005: error on generating lyrics`);

            //////////////////////////////////  SENT MSG WITH LYRICS  /////////////////////////////////////////////

            if(lyrics && isSong && !userLyrics && !isBeat){
                const notification: string = `Meow @${userName} 😼 Lyrics are ready 💖\nUp to 5 minutes left until your result 🎵 <a href="tg://user?id=${userId}">&#8203;</a>`
                bot.telegram.editMessageText(
                    _group,
                    initbotMsg,
                    undefined,
                    notification,
                    {parse_mode: 'HTML'}
                );

                let msgOpt: any = {}; 
                let reply: string = lyrics;
                if(initbotMsg){
                    msgOpt = {parse_mode: 'HTML', reply_to_message_id: initbotMsg || messageId, };
                } else if(userId && userId !== 0){
                    msgOpt = {parse_mode: 'HTML', };
                    reply += `<a href="tg://user?id=${userId}">&#8203;</a>`;
                } else {
                    msgOpt = {parse_mode: 'HTML', };
                    reply = lyrics;  
                }

                if(lyricsForChat && group && msgOpt){
                    bot.telegram.sendMessage(group, lyricsForChat, msgOpt);
                    recentMessages.addmsg({role: "assistant", content: lyricsForChat});
                }

            }

            if(isBeat && style) {
                style = style.replace(/\([^)]*\)/g, ""); // if beat => delete voice prompt from style incl. brackets() 
            } else if(isSong && style) {
                style = style.replace(/[()]/g, '');      // if song => delete brackets only, because voice prompt is filled 
            }
             
            ///////////////////////////////////////  GET SONG TITLE  ///////////////////////////////////////////

            const gettitle: GetTitle = new GetTitle(style, lyrics, langPlain);
            title = await gettitle.getTitle();
            if(artist) title = artist + " -- " + title

            ///////////////////////////////////  PREPARE BRANDING SUNO  ////////////////////////////////////////

            if(lyrics && !lyrics.includes("[Pre-Intro]")) lyrics = `[Pre-Intro]\nPLACEHOLDER ... ${artist || userName} ...\n\n` + lyrics
            if(lyrics && !lyrics.includes("[Post-Outro]")) lyrics = lyrics + `\n\n[Post-Outro]\n${artist || userName} ... PLACEHOLDER ...`
      
            ///////////////////////////////  INITIATE SUNO PROCESS SCRIPT //////////////////////////////////////

            if(!style) throw Error("E-CODE_010: style missing");

            if(artist){ 
                new Suno(userId, userName, "generate", "chirp-v4", lyrics, isBeat, title, style, negative, artist, true, initbotMsg, maxstyle).suno();
                new Suno(userId, userName, "generate", "chirp-v5",   lyrics, isBeat, title, style, negative, artist, true, initbotMsg, maxstyle).suno();
            } else {
                throw Error("E-CODE_013: artist name missing");
            }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////

        } catch(e: unknown) {
            console.log("❌ studio/song.js", e instanceof Error ? e.message : e);
            new HandleErrorType(e, userId, userName).handleErrorType(); 
        }

    }

}