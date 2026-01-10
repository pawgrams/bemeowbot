import { Context } from 'telegraf';
import { _group, _chat } from '../../../context/cache/access';
import { openai } from '../../../endpoints/openai/openAi';
import { botnames } from '../../../context/cache/botnames';
import { recentMessages } from './recentMessages';
import { TxtReplyOrMsg } from '../../../utils/telegram/txtReplyOrMsg';;
import { GetFallbackAssistantReply } from './getFallbackAssistantReply';
import type { Thread, Run, MessagesPage, RunCreateParams } from "openai/resources/beta/threads";


////////////////////////////////////////////////////////////////

export class Chatbot {
    private ctx: Context;

    constructor(ctx: Context) {
        this.ctx = ctx;
    }

    public async handle(): Promise<void> {

        try{

            const group: number = (this.ctx.callbackQuery ? this.ctx.callbackQuery.message?.chat.id : this.ctx.message?.chat.id) || 0;
            if(group !== _group){ throw Error(`no group found in ctx of message or callbackquery => callbackquery ? => ${this.ctx.callbackQuery}`); }

            const userName: string = (this.ctx.callbackQuery ? this.ctx.callbackQuery.from.username : this.ctx.message?.from.username) || '';
            const userId: number = (this.ctx.callbackQuery ? this.ctx.callbackQuery.from.id : this.ctx.message?.from.id) || 0;
            if(!userName || !userId){ throw Error(`no username or userid found in ctx of message or callbackquery => callbackquery ? => ${this.ctx.callbackQuery}`);}

            const chatContext: number = 25; 

            let messageText: string = this.ctx && this.ctx.message && 'text' in this.ctx.message && this.ctx.message.text ? this.ctx.message.text : '';
            if(!messageText){ throw Error(`no text in user message`); }

            const startsWithBotname: string = botnames.find(prefix => messageText.startsWith(prefix)) || '';
            if(startsWithBotname){ messageText = messageText.split(`${startsWithBotname} `)[1] || ''; }

            messageText = messageText.toLowerCase().trim() || '';
            if(!messageText){ throw Error(`no valid text in user message`); }

            const parts: string[] = messageText.startsWith("/chatbot") ? messageText.split("/chatbot") : [];
            const input: string = parts.length > 1 ? parts[1].trim() : '';
            if(!input){ throw Error(`user has not provided a text or no text could be extracted`); }

            const inputMsg: string = this.ctx.from?.username && this.ctx.from?.id ? `${this.ctx.from.username}: ${input}`.slice(0, 350) : '';
            recentMessages.addmsg({role: "user", content: inputMsg});
            const messages: any[] = recentMessages.getmsg(chatContext) || [];

            const thread: Thread = await openai.beta.threads.create({messages: messages});
            if(!thread){ throw Error('could not create new thread'); }
            const threadId: string = thread && 'id' in thread && thread.id ? thread.id : '';
            if(!threadId){ throw Error('no thread id'); }

            const runParams: RunCreateParams = { 
                assistant_id: _chat, 
                model: "gpt-4o-mini",
                additional_instructions: `Friendly greet the user ${userName ? "by it's name @" + userName : ''}. `,
                temperature: 0.8,
                max_prompt_tokens: 5000,
                max_completion_tokens: 500,
                truncation_strategy: {type:"last_messages", last_messages: chatContext},
                response_format: {type: "text"},
                tool_choice: "none",
            };
        
            const run: Run = await openai.beta.threads.runs.createAndPoll(threadId, runParams);
            if(!run){ throw Error('could not start run'); }

            let reply: string  = '';
            if ('status' in run && run.status == 'completed') {
                const threadMsgs: MessagesPage = await openai.beta.threads.messages.list(threadId);
                for (const msgs of threadMsgs.data.reverse()) {
                    const final: string = msgs && 'content' in msgs && msgs.content && msgs.content.length > 0 && msgs.content[0] && 'text' in msgs.content[0] && msgs.content[0].text && 'value' in msgs.content[0].text && msgs.content[0].text.value ||'';
                    if(final){ reply = final; }
                }
            } 

            if(!reply){ 
                const getasseply: GetFallbackAssistantReply = new GetFallbackAssistantReply(inputMsg, userName);
                reply = getasseply.getFallbackAssistantReply(); 
            }

            new TxtReplyOrMsg(this.ctx, group, reply, "text", userId).txtReplyOrMsg();
            recentMessages.addmsg({role: "assistant", content: reply});

        }catch(e: unknown){
            console.log("❌ chatbot.js", e instanceof Error ? e.message : e);
        }

    }

}