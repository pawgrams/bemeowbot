import { openai } from '../../../../endpoints/openai/openAi';
import { _group, _finetune } from '../../../../context/cache/access';
import type { Thread, Run, MessagesPage, RunCreateParams } from "openai/resources/beta/threads";

////////////////////////////////////////////////////////////////

export class Finetune {

    private lyrics: string;
    private language: string;

    constructor(lyrics: string = '', language: string = '') {
        this.lyrics = lyrics;
        this.language = language;
    }

    public async finetune(): Promise<string>{

        let finetuneResult: string = '';
        let finetuneIx: string = '';

        try{
            finetuneIx += `Here is the song info: \n`;
            finetuneIx += `The main language of the lyrics is: "${this.language}".`;
            finetuneIx += `Finetune the following lyrics according to the guidelines: ${this.lyrics}`;

            const runParams: RunCreateParams = { 
                assistant_id:               _finetune, 
                model:                      "gpt-4o",
                additional_instructions:    finetuneIx, 
                temperature:                0.7,
                max_prompt_tokens:          5000,
                max_completion_tokens:      1900,
                response_format:            {type: "text"},
                tool_choice:                "none",
            };

            const thread: Thread = await openai.beta.threads.create({messages: []});
            if(!thread) throw Error('failed to create new thread in openai');

            const run: Run = await openai.beta.threads.runs.createAndPoll(thread.id, runParams);
            if(!run) throw Error(`could not start run => ${run}`);

            if ('status' in run && run.status == 'completed') {
                const threadMsgs: MessagesPage = await openai.beta.threads.messages.list(thread.id);
                for (const msgs of threadMsgs.data.reverse()) {
                    const final: string = msgs && 'content' in msgs && msgs.content && msgs.content.length > 0 && msgs.content[0] && 'text' in msgs.content[0] && msgs.content[0].text && 'value' in msgs.content[0].text && msgs.content[0].text.value ||'';
                    if(final){ finetuneResult = final; }
                }
            } else {
                console.log(`❌ finetune.js" => RUN STATUS => ${run && run.status ? run.status : 'ERROR creating run'}`)
            }

            if(!finetuneResult){
                finetuneResult = this.lyrics;
                throw Error(`Error on generating or sending lyrics => unfinetuned lyrics are used.`);
            }

        } catch(e: unknown){
            console.log("❌ finetune.js", e instanceof Error ? e.message : e);
        }

        return finetuneResult;

    }


}


