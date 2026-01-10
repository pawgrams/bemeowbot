import { openai } from '../../../../../endpoints/openai/openAi';
import { _group, _intensify } from '../../../../../context/cache/access';
import type { Thread, Run, MessagesPage, RunCreateParams } from "openai/resources/beta/threads";

////////////////////////////////////////////////////////////////

export class Intensify{

    private userPrompt: string;
    private langPlain: string;

    constructor(userPrompt: string = '', langPlain: string = '') {
        this.userPrompt = userPrompt;
        this.langPlain = langPlain;
    }

    public async intensify(): Promise<string>{

        let intensified: string = '';
        let instruction: string = '';

        try{

            if(!this.userPrompt) throw Error("no userPrompt");
            if(!this.langPlain) this.langPlain = "english";

            instruction += `The target language of the song is: "${this.langPlain.toUpperCase()}"\n`
            instruction += `Here is the user prompt: ${this.userPrompt}`

            const runParams: RunCreateParams = { 
                assistant_id:               _intensify, 
                model:                      "gpt-4o",
                additional_instructions:    instruction, 
                temperature:                0.5,
                max_prompt_tokens:          1900,
                max_completion_tokens:      900,
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
                    if(final) intensified = final; 
                }
            } else {
                console.log(`❌ dramaturgy.js" => RUN STATUS => ${run && run.status ? run.status : 'ERROR creating run'}`)
            }

            if(!intensified) throw Error(`Error on generating or sending lyrics => fallback message initiated.`)

        } catch(e: unknown){
            console.log("autolyrics.js", e instanceof Error ? e.message : e);
        }

        return intensified;

    }


}

