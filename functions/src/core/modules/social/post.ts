import { _group, _post } from '../../../context/cache/access';
import { Context } from 'telegraf';
import { Message } from 'telegraf/types';
import { botnames } from '../../../context/cache/botnames';
import { bot } from '../../../context/bot';
import { marketingBucket } from '../../../context/cache/buckets';
import { GetRandomLink } from './getRandomLink';
import { GetRandomHashtags } from './getRandomHashtags';
import { readJson } from '../../../utils/file/readJson';
import * as path from 'path';
import { openai } from '../../../endpoints/openai/openAi';
import { pause } from '../../../utils/misc/pause';
import { IsAssistantErrorMsg } from '../../../endpoints/openai/isAssistantErrorMsg';
import { NextLang } from '../studio/lyrics/language/nextLang';
import { HandleErrorType } from '../../../utils/misc/handleErrorType';
import type { Thread, Run, MessagesPage, RunCreateParams } from "openai/resources/beta/threads";
import { groupPostSec } from '../../../ratelimits/group/post/sec';
import { groupPostMin } from '../../../ratelimits/group/post/min';
import { groupPostHour } from '../../../ratelimits/group/post/hour';
import { userPostSec } from '../../../ratelimits/user/post/sec';
import { userPostMin } from '../../../ratelimits/user/post/min';
import { userPostHour } from '../../../ratelimits/user/post/hour';

////////////////////////////////////////////////////////////////

export class Post {
    private ctx: Context;

    constructor(ctx: Context) {
        this.ctx = ctx;
    }

    private async fetchJsonFileNames(): Promise<string[]> {
        try {
            const [files] = await marketingBucket.getFiles({ prefix: 'posts/' });
            return files
                .map(file => file.name)
                .filter(name => name.endsWith('.json')) || [];
      
        } catch (e: unknown) {
            console.log(`❌ post.js => fetchJsonFileNames() => ${e}`);
            return [];
        }
    };


    public async handle() {
        if(!this.ctx) throw Error("no ctx")
        let platform: string = '';
        let userTag: string = '';
        let hasPrompt: boolean = false;
        let postText: string = '';
        let addInstruction: string = '';
        let userName: string = '';
        let userId: number = 0;
        let language: string = 'english';
        const nonFallback: string[] = ["english", "american", "british"];

        try{

            const platformTags: any = {
                twitter: "@placeholder"
            }
            
            const group : number = (this.ctx.callbackQuery ? this.ctx.callbackQuery.message?.chat.id : this.ctx.message?.chat.id) || 0;
            if(group !== _group) throw Error(`no group found in ctx of message or callbackquery => callbackquery ? => ${this.ctx.callbackQuery}`);

            userName = (this.ctx.callbackQuery  && 'from' in this.ctx.callbackQuery && this.ctx.callbackQuery.from && 'username' in this.ctx.callbackQuery.from && this.ctx.callbackQuery.from.username ? this.ctx.callbackQuery.from.username : this.ctx.message?.from.username) || '';
            userId = (this.ctx.callbackQuery && 'from' in this.ctx.callbackQuery && this.ctx.callbackQuery.from && 'id' in this.ctx.callbackQuery.from && this.ctx.callbackQuery.from.id ? this.ctx.callbackQuery.from.id : this.ctx.message?.from.id) || 0;
            if(!userName || !userId) throw Error(`E-CODE_011: no username or userid found in ctx of message or callbackquery => callbackquery ? => ${this.ctx.callbackQuery}`);

            userTag = `<a href="tg://user?id=${userId}">&#8203;</a>`;

            try{

                const callbackdata: string = this.ctx && this.ctx.callbackQuery && 'data' in this.ctx.callbackQuery && this.ctx.callbackQuery .data ? this.ctx.callbackQuery .data : '';
                let messageText: string = this.ctx && this.ctx.message && 'text'in this.ctx.message && this.ctx.message.text ? this.ctx.message.text : '';
                if(!messageText && !callbackdata) throw Error('E-CODE_000: no message text found');

                if( groupPostSec.RL(_group)     || 
                    userPostSec.RL(userId)      || 
                    groupPostMin.RL(_group)     || 
                    userPostMin.RL(userId)      || 
                    groupPostHour.RL(_group)    ||  
                    userPostHour.RL(userId)
                ){
                    throw Error(`E-CODE_000: 🛡 group or user user rate limit hit ${userId} ${userName}`);
                }

                const messageId: number = this.ctx.message && 'message_id' in this.ctx.message && this.ctx.message.message_id ? this.ctx.message.message_id : 0;
                const fisrstMsgOpt: any = {parse_mode: 'HTML'}
                if(messageId) fisrstMsgOpt.reply_to_message_id = messageId
                
                const initMsgText: string = `Hey @${userName} 😺 Tweet Creation in Process 🖍️ <a href="tg://user?id=${userId}">&#8203;</a>`;
                const sentInitMsg: Message = await bot.telegram.sendMessage(
                    _group,
                    initMsgText,
                    fisrstMsgOpt
                );
                const initbotMsg: number = sentInitMsg && 'message_id' in sentInitMsg && sentInitMsg.message_id ? sentInitMsg.message_id : 0
                if(!initbotMsg) throw Error('E-CODE_000: could not send initial post creation notification');

                const nextLang: NextLang = new NextLang(this.ctx);
                language = await nextLang.getLang(userId);
                language = nextLang.formatLang(language);
                nextLang.resetLang(userId);

                if(callbackdata && callbackdata === 'post'){
                    platform = platformTags["twitter"];

                } else if(messageText){
            
                    const startsWithBotname: string = botnames.find(prefix => messageText.startsWith(prefix)) || '';
                    if(startsWithBotname){
                        messageText = messageText.split(`${startsWithBotname} `)[1].trim() || '';
                    }

                    messageText = messageText.toLowerCase().trim() || '';
                    if(!messageText) throw Error(`E-CODE_000: no valid text in user message`);

                    if(!messageText.startsWith('/post') ) throw Error(`E-CODE_000: /post command not found`);

                    messageText = messageText.slice(5).trim() || '';
                    if(messageText && messageText.length > 5){
                        hasPrompt = true;
                    }

                    platform = platformTags["twitter"];

                } else {
                    throw Error('E-CODE_000: neither callbackdata nor messagetext found');
                }

                if(hasPrompt || nonFallback.includes(language)){
                    
                    addInstruction += language ? `The target language of the post is: "${language}". ` : language;
                    addInstruction += messageText ? `Here is the info for what the user wants to post about: "${messageText.slice(0, 500)}"` : 'Please write a twitter post about PLACEHOLDER: ';

                    const runParams: RunCreateParams = { 
                        assistant_id:               _post, 
                        model:                      "gpt-4o-mini",
                        additional_instructions:    addInstruction, 
                        temperature:                0.7,
                        max_prompt_tokens:          5000,
                        max_completion_tokens:      500,
                        response_format:            {type: "text"},
                        tool_choice:                "none",
                    };

                    let maxretry: number = 5;
                    let getPostSuccess: boolean = false;
                    while (maxretry > 0 && !getPostSuccess){

                        try {

                            const thread: Thread = await openai.beta.threads.create({messages: []});
                            if(!thread) throw Error('failed to create new thread in openai');
            
                            const run: Run = await openai.beta.threads.runs.createAndPoll(thread.id, runParams);
                            if(!run) throw Error(`could not start run => ${run}`);
            
                            if ('status' in run && run.status == 'completed') {
                                const threadMsgs: MessagesPage = await openai.beta.threads.messages.list(thread.id);
                                for (const msgs of threadMsgs.data.reverse()) {
                                    const final: string = msgs && 'content' in msgs && msgs.content && msgs.content.length > 0 && msgs.content[0] && 'text' in msgs.content[0] && msgs.content[0].text && 'value' in msgs.content[0].text && msgs.content[0].text.value ||'';
                                    if(final){ 
                                        postText = final; 
                                        getPostSuccess = true;
                                    }
                                }
                            }
                            if(!postText) throw Error(`Error on generating or sending lyrics => fallback message initiated.`)

                            if(new IsAssistantErrorMsg(postText).isAssistantErrorMsg()) throw Error(`invalid postText result => ${maxretry} retries left`);

                        } catch(e: unknown){
                            maxretry--;
                            await pause(2);
                        }
                    }
                }

                if (!hasPrompt || !postText) { // hardcoded post text only if no user prompt or if openai failed

                    const jsonFileNames: string[] = await this.fetchJsonFileNames();
                    if (!jsonFileNames.length) throw new Error('No JSON file names found');

                    const randJsonFileName: string = jsonFileNames[Math.floor(Math.random() * jsonFileNames.length)];
                    if (!randJsonFileName) throw new Error('No posts found in JSON');

                    const randJsonArray: any = JSON.parse(await marketingBucket.file(randJsonFileName).download().then(data => data[0].toString()));
                    if (!randJsonArray.length) throw new Error('json with posts could not be fetched');

                    postText = randJsonArray[Math.floor(Math.random() * randJsonArray.length)];
                    if (!postText.length) throw new Error('post text could not be fetched from json');

                }

                const getrandomlink: GetRandomLink = new GetRandomLink();
                const link: string = await getrandomlink.getRandomLink();
    
                if (!link) throw new Error('E-CODE_000: no link could be fetched for post');
                if (!link.length) throw new Error('E-CODE_000: no link could be fetched for post');

                const getrandomhashtags: GetRandomHashtags = new GetRandomHashtags();
                const hashtags: string = getrandomhashtags.getRandomHashtags();
                if (!hashtags.length) throw new Error('E-CODE_000: no hashtag could be fetched for post');

                postText = `${postText} ${platform} ${hashtags}`
                const tweetText: string = encodeURIComponent(`${postText} `);
                if (!postText.length) throw new Error('E-CODE_000: could not encodeURIComponent postText');

                const tweetUrl: string = encodeURIComponent(link);
                if (!link.length) throw new Error('E-CODE_000: could not encodeURIComponent link');

                const inlineButtons: any = {
                    inline_keyboard: [
                        [
                            {text: "Share on X", url: `https://twitter.com/intent/tweet?text=${tweetText}&url=${tweetUrl}`},
                        ],
                    ],
                };
                if (!inlineButtons || !inlineButtons.inline_keyboard ) throw new Error('no or errorous inline keyboard');
        
                let msgOpt: any = {
                    parse_mode: 'HTML', 
                    reply_markup: inlineButtons,
                }
                
                let finalMsgTry1: Message | boolean = false;
                let finalMsgTry2: Message;
                try {
                    if(initbotMsg){
                        finalMsgTry1 = await bot.telegram.editMessageText(
                            _group,
                            initbotMsg,
                            undefined,
                            `${postText} ${link} ${userTag}`,
                            msgOpt
                        );
                    }
                } catch(e: unknown){
                    if(!finalMsgTry1){
                        if(messageId){ 
                            msgOpt.reply_to_message_id = messageId;
                        }
                        finalMsgTry2 = await bot.telegram.sendMessage(_group, `${postText} ${link} ${userTag}`, msgOpt)
                        if(!finalMsgTry2){
                            throw Error("E-CODE_000: Could not send post after it was created.")
                        }
                    }
                }


            } catch(e: unknown){
                throw Error(`${e instanceof Error ? e.message : e}`)
            }

        } catch(e: unknown){

            try{
                const __dirname: string = path.dirname(__filename);
                const tempFolderPath: string = path.join(__dirname, 'posts');
                const postData1FromProjectFolder: any = await readJson(`${tempFolderPath}/1.json`); // fallback read post texts from project folder
                const fallbackPostText: string = postData1FromProjectFolder[Math.floor(Math.random() * postData1FromProjectFolder.length)];
                const fallbackLink: string = "https://www.placeholder.com/";
                const fallbackHashtags: string = `#placeholder #placeholder #placeholder`;

                const fallBackTweetText: string = encodeURIComponent(`${fallbackPostText} ${fallbackHashtags} `);
                if (!fallbackPostText.length) throw new Error('E-CODE_000: could not encodeURIComponent postText');

                const fallbackTweetUrl: string = encodeURIComponent(fallbackLink);
                if (!fallbackLink.length) throw new Error('E-CODE_000: could not encodeURIComponent link');

                const inlineButtons: any = {
                    inline_keyboard: [
                        [
                            {text: "Share on X", url: `https://twitter.com/intent/tweet?text=${fallBackTweetText}&url=${fallbackTweetUrl}`},
                        ],
                    ],
                };
                if (!inlineButtons || !inlineButtons.inline_keyboard ) throw new Error('E-CODE_000: no or errorous inline keyboard');
        
                let msgOpt: any = {
                    parse_mode: 'HTML', 
                    reply_markup: inlineButtons,
                }
                
                bot.telegram.sendMessage(_group, `${fallBackTweetText} ${fallbackHashtags} ${fallbackLink}${userTag}`, msgOpt);

            } catch(e: unknown){
                try {
                    console.log("❌ post.js", e instanceof Error ? e.message : e);
                    new HandleErrorType(e, userId, userName).handleErrorType(); 
                }catch(_e: unknown){
                    console.log("❌ post.js", _e instanceof Error ? _e.message : _e);
                }
            }

        }

    }

}

