import { _group, _replicate, _image } from '../../../context/cache/access';
import { Context } from 'telegraf';
import Replicate from "replicate";
import type { Prediction } from "replicate";
import { pause } from '../../../utils/misc/pause'
import { GetPrePrompt } from './getPrePrompt';
import { botnames } from '../../../context/cache/botnames';
import { bot } from '../../../context/bot';
import { HandleErrorType } from '../../../utils/misc/handleErrorType';
import { IsAssistantErrorMsg } from '../../../endpoints/openai/isAssistantErrorMsg';
import { openai } from '../../../endpoints/openai/openAi';
import type { Thread, Run, MessagesPage, RunCreateParams } from "openai/resources/beta/threads";
import { groupImageSec } from '../../../ratelimits/group/image/sec';
import { groupImageMin } from '../../../ratelimits/group/image/min';
import { groupImageHour } from '../../../ratelimits/group/image/hour';
import { groupImageDay } from '../../../ratelimits/group/image/day';
import { userImageMin } from '../../../ratelimits/user/image/min';
import { userImageHour } from '../../../ratelimits/user/image/hour';
import { userImageDay } from '../../../ratelimits/user/image/day';

////////////////////////////////////////////////////////////////

const allowedTopics: string[] = ["/image"];

export class Image {
    private ctx: Context;

    constructor(ctx: Context) {
        this.ctx = ctx;
    }

    public async handle(): Promise<void> {

        let userName: string = '';
        let userId: number = 0;
        let optimizedPrompt: string = '';
        let optimizePromptIx: string = '';
        let optimizedPromptSuccess: boolean = false;
        let prompt: string = '';

        try{

            const group: number = (this.ctx.callbackQuery ? this.ctx.callbackQuery.message?.chat.id : this.ctx.message?.chat.id) || 0;
            if(group !== _group) throw Error(`no group found in ctx of message or callbackquery => callbackquery ? => ${this.ctx.callbackQuery}`);

            userName = (this.ctx.callbackQuery && 'from' in this.ctx.callbackQuery && this.ctx.callbackQuery.from && 'username' in this.ctx.callbackQuery.from && this.ctx.callbackQuery.from.username ? this.ctx.callbackQuery.from.username : this.ctx.message?.from.username) || '';
            userId = (this.ctx.callbackQuery && 'from' in this.ctx.callbackQuery && this.ctx.callbackQuery.from && 'id' in this.ctx.callbackQuery.from && this.ctx.callbackQuery.from.id ? this.ctx.callbackQuery.from.id : this.ctx.message?.from.id) || 0;
            if(!userName || !userId) throw Error(`E-CODE_011: no username or userid found in ctx of message or callbackquery => callbackquery ? => ${this.ctx.callbackQuery}`);
            
            if( groupImageSec.RL(_group)   || 
                groupImageMin.RL(_group)   || 
                userImageMin.RL(userId)    || 
                groupImageHour.RL(_group)  || 
                userImageHour.RL(userId)   ||  
                groupImageDay.RL(_group)   ||
                userImageDay.RL(userId) 
            ){
                throw Error(`E-CODE_009: 🛡 group or user user rate limit hit ${userId} ${userName}`);
            }

            const messageId: number = this.ctx.callbackQuery && 'message' in this.ctx.callbackQuery && this.ctx.callbackQuery.message && 'message_id' in this.ctx.callbackQuery.message ? this.ctx.callbackQuery.message?.message_id : 0;
            let messageText: string = this.ctx && this.ctx.message && 'text' in this.ctx.message && this.ctx.message.text ? this.ctx.message.text : '';
            if(!messageText) throw Error(`E-CODE_000: no text in user message`);

            const startsWithBotname: string = botnames.find(prefix => messageText.startsWith(prefix)) || '';
            if(startsWithBotname) messageText = messageText.split(`${startsWithBotname} `)[1].trim() || '';

            messageText = messageText.toLowerCase().trim() || '';
            if(!messageText) throw Error(`E-CODE_000: no valid text in user message`);

            let userPrompt: string = '';
            const command: string = allowedTopics.find(prefix => messageText.startsWith(prefix)) || '';

            if(command){
                userPrompt = messageText.split(command)[1] || '';
                userPrompt = userPrompt.trim() || '';
            } else {
                throw Error(`E-CODE_000: no valid topic for image found`);
            }

            const userTag: string = `<a href="tg://user?id=${userId}">&#8203;</a>`;
            const premsg: string = `Hey @${userName} 🐾😺 Your Image is processing 🐈🐈‍⬛ ... 💞 ${userTag}`;
            let opt: any = {parse_mode: 'HTML'}

            if(messageId) opt.reply_to_message_id = messageId;
            bot.telegram.sendMessage(_group, premsg, opt);


            if(userPrompt){
                let maxretry: number = 5;
                while(maxretry > 0 && !optimizedPromptSuccess){
                    try{
                        optimizePromptIx += `Here is the user prompt: ${userPrompt}`;
                        const runParams: RunCreateParams = { 
                            assistant_id:               _image, 
                            model:                      "gpt-4o-mini",
                            additional_instructions:    optimizePromptIx, 
                            temperature:                0.7,
                            max_prompt_tokens:          2500,
                            max_completion_tokens:      1000,
                            response_format:            {type: "text"},
                            tool_choice:                "none",
                        };

                        const thread: Thread = await openai.beta.threads.create({messages: []});
                        if(!thread){
                            throw Error('failed to create new thread in openai');
                        }
                        const run: Run = await openai.beta.threads.runs.createAndPoll(thread.id, runParams);
                        if(!run){
                            throw Error(`could not start run => ${run}`);
                        }
                        if ('status' in run && run.status == 'completed') {
                            const threadMsgs: MessagesPage = await openai.beta.threads.messages.list(thread.id);
                            for (const msgs of threadMsgs.data.reverse()) {
                                const final = msgs && 'content' in msgs && msgs.content && msgs.content.length > 0 && msgs.content[0] && 'text' in msgs.content[0] && msgs.content[0].text && 'value' in msgs.content[0].text && msgs.content[0].text.value ||'';
                                if(final){ optimizedPrompt = final; }
                            }
                        } else {
                            console.log(`❌ image.js" => RUN STATUS => ${run && run.status ? run.status : 'ERROR creating run'}`)
                        }
                        if(!optimizedPrompt){
                            throw Error(`Error on generating optimizedPrompt`);
                        }
                        const assmsgerr: IsAssistantErrorMsg = new IsAssistantErrorMsg(optimizedPrompt);
                        if(assmsgerr.isAssistantErrorMsg()){
                            throw Error(`invalid optimizedPrompt result => ${maxretry} retries left`);
                        }
                        optimizedPromptSuccess = true;
                    } catch(e: unknown){
                        console.log("❌ image.js", e instanceof Error ? e.message : e);
                        maxretry--;
                    }
                }
            }

            const topic: string = command.startsWith('/') ? command.slice(1) : '';

            if(optimizedPrompt){
                prompt = optimizedPrompt;
                console.log("optimizedPrompt", optimizedPrompt);
            } else {
                const getpreprompt: GetPrePrompt = new GetPrePrompt(topic, userPrompt);
                prompt = await getpreprompt.getPrePrompt() || '';
            }

            if(!prompt)throw Error(`E-CODE_000: no valid topic for image found`);

            const replicate: Replicate = new Replicate({auth: _replicate});
            const prediction: Prediction = await replicate.predictions.create({model: "black-forest-labs/flux-schnell", 
                input:{
                    prompt: prompt,
                    go_fast: true,
                    megapixels: "1",
                    num_outputs: 1,
                    aspect_ratio: "1:1",
                    output_format: "webp",
                    output_quality: 100,
                    num_inference_steps: 4
                }});

        
            if(!prediction) throw Error(`E-CODE_014: could not fetch prediction from replicate`);

            let imageUrl: any = '';
            let retry: number = 10;
            while(retry > 0 && !imageUrl){
                try{
                    imageUrl = prediction.urls?.stream;
                    break;
                }catch{}
                retry--;
                await pause(0.5);
            }

            if(!imageUrl) throw Error(`E-CODE_014: could not fetch imageUrl finally`);
            const notification: string = `Hey @${userName} 💖😽 Here is your Image ${userTag}`;

            let msgOpt: any = {
                caption: notification, 
                parse_mode: 'HTML', 
            }

            if(messageId) msgOpt.reply_to_message_id = messageId;

            try{
                await bot.telegram.sendPhoto(
                    _group,                     
                    imageUrl,
                    msgOpt
                );
            } catch(e: unknown){
                try{
                    await this.ctx.replyWithPhoto(
                        { url: imageUrl },
                        { caption: notification, parse_mode: 'HTML'}
                    );
                }catch(e: unknown){
                    throw Error(`E-CODE_000: sending photo failed. ${e}`);
                }
            }

        } catch(e: unknown){
            try {
                console.log("❌ image.js", e instanceof Error ? e.message : e);
                new HandleErrorType(e, userId, userName).handleErrorType(); 
            }catch{}
        }
    }

}