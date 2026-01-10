// Context Imports
import { Context } from 'telegraf';
import { botnames } from '../../../../context/cache/botnames';
import { bot } from '../../../../context/bot';
import { _group } from '../../../../context/cache/access';
import { dev1, dev2 } from '../../../../context/cache/devs';
import { recentMessages } from '../../chatbot/recentMessages';
// Rate Limit Imports
import { groupLyricsSec } from '../../../../ratelimits/group/lyrics/sec';
import { groupLyricsMin } from '../../../../ratelimits/group/lyrics/min';
import { groupLyricsHour } from '../../../../ratelimits/group/lyrics/hour';
import { groupLyricsDay } from '../../../../ratelimits/group/lyrics/day';
import { userLyricsMin } from '../../../../ratelimits/user/lyrics/min';
import { userLyricsHour } from '../../../../ratelimits/user/lyrics/hour';
import { userLyricsDay } from '../../../../ratelimits/user/lyrics/day';
// Utils Imports
import { pause } from '../../../../utils/misc/pause';
import { HandleErrorType } from '../../../../utils/misc/handleErrorType';
import { TxtReplyOrMsg } from '../../../../utils/telegram/txtReplyOrMsg';
import { TxtReplyOrMsgAndReturn } from '../../../../utils/telegram/txtReplyOrMsgAndReturn'
import { ThreeDotsOwnLine } from '../../../../utils/text/threeDotsOwnLine';
import { isTxtMsg } from '../../../../utils/text/isTxtMsg';
// Open Ai Imports
import { openai } from '../../../../endpoints/openai/openAi';
import { IsAssistantErrorMsg } from '../../../../endpoints/openai/isAssistantErrorMsg';
import type { Thread } from "openai/resources/beta/threads";
// Lyrics Language Imports
import { exoticlangs } from './language/exoticlangs';
import { NextLang } from './language/nextLang';
import { langMap } from './language/langMap';
// Music/Lyrics Imports
import { genres } from '../music/genres';
import { songTemplates } from '../music/songTemplates';
import { Intensify } from './utils/intensify';
import { LyricsHandler } from './lyricsHandler';

////////////////////////////////////////////////////////////////

export class Lyrics {

    private ctx: Context;

    constructor(ctx: Context) { this.ctx = ctx; }

    public async handle(): Promise<void>{

        let userName: string = '';
        let userId: number = 0;
        let lyricsResult: string = '';
        let template: any[] = [];
        let style: string = '';
        let topic: string = '';
        let language: string = 'english';
        let structure: string = '';
        let isExotic: boolean = false;
        let lyricsIx: string = '';
        let langForLyrics: string = ''
        let langForStyle: string = ''
        let langPlain: string = '';
        let flag: string = '';
        let langForDramaturgy: string = '';
        let languageCaptions: string[] = [];
        let negative: string = '';
        let rhymes: string = ""
        let intensified: string = ""

        try{

            const nextLang: NextLang = new NextLang();
            const group: number = (this.ctx.callbackQuery ? this.ctx.callbackQuery.message?.chat.id : this.ctx.message?.chat.id) || 0;

            if(group !== _group) throw Error(`no group found in ctx of message or callbackquery => callbackquery ? => ${this.ctx.callbackQuery}`);

            userName = this.ctx.callbackQuery && 'from' in this.ctx.callbackQuery && this.ctx.callbackQuery.from && 'username' in this.ctx.callbackQuery.from && this.ctx.callbackQuery.from.username ? this.ctx.callbackQuery.from.username : this.ctx.message?.from.username || '';
            userId = this.ctx.callbackQuery && 'from' in this.ctx.callbackQuery && this.ctx.callbackQuery.from && 'id' in this.ctx.callbackQuery.from && this.ctx.callbackQuery.from.id ? this.ctx.callbackQuery.from.id : this.ctx.message?.from.id || 0;
            if(!userName || !userId){
                throw Error(`E-CODE_007: no username or userid found in ctx of message or callbackquery => callbackquery ? => ${this.ctx.callbackQuery}`);
            }

            const messageId: any = this.ctx.callbackQuery && 'message' in this.ctx.callbackQuery &&  this.ctx.callbackQuery.message && 'message_id' in this.ctx.callbackQuery.message ? this.ctx.callbackQuery.message?.message_id : '';

            if( (
                groupLyricsSec.RL(_group)   || 
                groupLyricsMin.RL(_group)   || 
                userLyricsMin.RL(userId)    || 
                groupLyricsHour.RL(_group)  || 
                userLyricsHour.RL(userId)   ||  
                groupLyricsDay.RL(_group)   ||
                userLyricsDay.RL(userId) 
                ) && userId !== dev1.id && userId !== dev2.id
            ){
                throw Error(`E-CODE_006: 🛡 group or user user rate limit hit ${userId} ${userName}`);
            }

            try{

                const messageText: string = this.ctx && this.ctx.message && 'text'in this.ctx.message && this.ctx.message.text ? this.ctx.message.text : '';
                if(!messageText)  throw Error('E-CODE_009: no message text found');

                const reply: string = `@${userName}: 😻 <b>Lyrics Creation in Process ... 🎵</b>\nIt can take up to 2 minutes. You will be notified once the results are available 🚀`;
                new TxtReplyOrMsg(this.ctx, group, reply, "text", userId).txtReplyOrMsg(); 

                let userPrompt: string = messageText || '';
                if (this.ctx && this.ctx.message && isTxtMsg(this.ctx.message)) {

                    const startsWithBotname: string = botnames.find(prefix => userPrompt.startsWith(prefix)) || '';
                    if (startsWithBotname) {
                        userPrompt = userPrompt.split(`${startsWithBotname} `)[1]?.trim() || '';
                    }
                    
                    const includesWithBotname: string = botnames.find(prefix => userPrompt.includes(prefix)) || '';
                    if (includesWithBotname) {
                        userPrompt = userPrompt.replace(includesWithBotname, '').trim();
                    }

                    userPrompt = userPrompt.toLowerCase().trim() || '';
                    
                    if (userPrompt.startsWith("/lyrics")) {
                        userPrompt = userPrompt.slice(7).trim();
                    } else {
                        throw Error(`E-CODE_009: no valid command in user message: ${userPrompt}`);
                    }

                    if (this.ctx.message.reply_to_message && isTxtMsg(this.ctx.message.reply_to_message)) {
                        const repliedMessage: string = this.ctx.message.reply_to_message.text;
                    }

                    const maingenres: string[] = Object.keys(genres);
                    let maingenre: string = maingenres.find(m => userPrompt.startsWith('/' + m + ' ') || ('/' + m) == userPrompt ) || '';
                    
                    if(maingenre && maingenre.length > 0){
                        userPrompt = userPrompt.slice(maingenre.length + 1).trim() || '';
                    }

                    let subgenres: string[] = Object.keys(songTemplates);
                    let subgenre: string | undefined = subgenres.find(s => userPrompt.startsWith(`/${s}`));
                    if(subgenre && subgenre.length > 0){
                        userPrompt = userPrompt.slice(subgenre.length + 1).trim() || '';
                    }

                    const getTemplate = async (sub: string) => { // rand sub variant
                        const templates: any = songTemplates[sub];
                        if(templates && templates.length > 0){
                            const randindex: number = Math.floor(Math.random() * templates.length) || 0;
                            const randtemplate: any = templates[randindex];
                            return [randtemplate["style"], randtemplate["language"], randtemplate["lyrics"], randtemplate["structure"], randtemplate["negative"] ];
                        }
                        return ['', ['english'], [''], 'mid', ''];
                    }

                    const getSubgenre = async (main: string) => { // rand sub
                        let sub: string = '';
                        if(!main){
                            if(subgenres && subgenres.length > 0){
                                const randindex: number = Math.floor(Math.random() * subgenres.length) || 0;
                                sub = subgenres[randindex];
                            }
                        } else {
                            const subsOfMain: string[] = genres[main];
                            if(subsOfMain && subsOfMain.length > 0){
                                const randindex: number = Math.floor(Math.random() * subsOfMain.length) || 0;
                                sub = subsOfMain[randindex];
                            }
                        }
                        return sub;
                    }

                    // -   -   -   -   -   -   -   -   -   -   -   -   -   -   -   -   -   -   -   -   -   -   -   -   -   -   

                    // use random topics if no or too short userprompt or if user sets (sub)genre
                    if( !userPrompt || userPrompt.length < 5 || subgenre || maingenre ){

                        if(!subgenre) subgenre = await getSubgenre(maingenre);
                        if(subgenre){ template = await getTemplate(subgenre);
                        } else { throw Error('E-CODE_010: no subgenre found'); }
                        if(subgenre && !maingenre){ // if main not given yet => fetch main via sub 
                            for(let m in maingenres){ if(genres[m].includes(subgenre)){ maingenre = m; break; } }
                        }; if(!maingenre) maingenre == subgenre; // if still no main => fallback: main = sub

                        structure = template[3]
                        if(template){
                            style = template[0];
                            if(template[2] && template[2].length > 0){
                            const topics: number = Math.max(1, Math.round(template[2].length / 2.8));
                            topic = [...template[2]].sort(() => 0.5 - Math.random()).slice(0, topics).join('; ');
                            }
                        }

                        if(topic){
                            userPrompt += topic  // topic concat => user prompt first => higher prio
                        }

                    }

                    //--------------------------- // FORMAT LANGUAGE FOR STYLE AND LYRICS  //--------------------------- 

                    const langcache: string = await nextLang.getLang(userId);
                    language = langcache ? langcache : "";
                    
                    if(Object.keys(exoticlangs).includes(language)){
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
                            negative = langMap[language][4] || ''
                        }

                    } else {
                        langForStyle = langForStyle || langPlain;
                        langForLyrics = langForLyrics ? langForLyrics : langForStyle || langPlain;
                    }

                    nextLang.resetLang(userId); 

                    //--------------------------- //--------------------------- //--------------------------- 

                    const thread: Thread = await openai.beta.threads.create({messages: []});
                    if(!thread) throw Error('E-CODE_009: failed to create new thread in openai');

                    let maxretry: number = 8;
                    // 1) User Prompt Intensifier
                    if(userPrompt){
                        let isIntensifiedValid: boolean = false;
                        while(maxretry > 0 && !isIntensifiedValid){
                            intensified = await new Intensify(userPrompt, langPlain).intensify();
                            const assmsgerr: IsAssistantErrorMsg = new IsAssistantErrorMsg(intensified);
                            if(intensified && !assmsgerr.isAssistantErrorMsg()){
                                isIntensifiedValid = true;
                                userPrompt = intensified;
                                break;
                            }
                            maxretry--;
                            await pause(0.5);
                        }
                    }

                    // 2) WRITE LYRICS
                    lyricsResult = await new LyricsHandler(
                        topic, langForLyrics, style, structure, isExotic, rhymes, langForStyle, langPlain, userPrompt, subgenre, maingenre
                    ).handle();

                    if(!lyricsResult) throw Error(`no lyrics => ${maxretry} retries left`);
                    const assmsgerr: IsAssistantErrorMsg = new IsAssistantErrorMsg(lyricsResult);

                    if(assmsgerr.isAssistantErrorMsg()) throw Error(`invalid lyrics result => ${maxretry} retries left`);

                    //////////////////////////////////////////////////////////////////////////////////////////

                    const threedotsownline: ThreeDotsOwnLine = new ThreeDotsOwnLine(lyricsResult);
                    lyricsResult = await threedotsownline.threeDotsOwnLine();

                    if(lyricsResult){
                        lyricsResult = lyricsResult.replace(/\]/g, `: ]`);
                    }
            
                    if(lyricsResult && flag){
                        lyricsResult = lyricsResult.replace(/\[/g, `\n[${flag} `);
                    }

                    const shuffledLanguageCaptions: string[] = languageCaptions.slice().sort(() => Math.random() - 0.5);
                    if(lyricsResult && shuffledLanguageCaptions){
                        let i = 0;
                        lyricsResult = lyricsResult.replace(/]/g, () => shuffledLanguageCaptions[i++ % shuffledLanguageCaptions.length] + ']');
                    }
            
                    const notification: string = `Hey @${userName} 😼🎵 Your Lyrics are here .. Yayyyyy 💖✒️\nReady to create your Song? Just reply to this message with  /song  and add your prompt.`
                    const txtmsgreturn = new TxtReplyOrMsgAndReturn(this.ctx, group, notification, "text", userId);
                    const notificationResult: any = await txtmsgreturn.txtReplyOrMsgAndReturn();

                    const notificationResultMessageId: any = notificationResult && 'message_id' in notificationResult ? notificationResult.message_id : '';
                    const replyWithLyricsToId: any = notificationResultMessageId ? notificationResultMessageId : messageId || '';

                    let msgOpt: any = {}; 
                    let reply: string = lyricsResult;

                    if(replyWithLyricsToId){
                        msgOpt = {parse_mode: 'HTML', reply_to_message_id: notificationResultMessageId || messageId, }; 

                    } else if(userId && userId !== 0){
                        msgOpt = {parse_mode: 'HTML', };
                        reply += `<a href="tg://user?id=${userId}">&#8203;</a>`;

                    } else {
                        msgOpt = {parse_mode: 'HTML', };
                        reply = lyricsResult;  
                    }

                    bot.telegram.sendMessage(group, lyricsResult, msgOpt); 
                    recentMessages.addmsg({role: "assistant", content: lyricsResult});

                }

            } catch(e: unknown){
                throw Error(`${e}`);
            }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////    

        } catch(e: unknown) {
            console.log("❌ studio/lyrics.js", e instanceof Error ? e.message : e);
            new HandleErrorType(e, userId, userName).handleErrorType(); 

        }

    }

}



