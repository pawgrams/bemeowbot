import { openai } from '../../../../../endpoints/openai/openAi';
import { _group, _translate } from '../../../../../context/cache/access';
import type { Thread, Run, MessagesPage, RunCreateParams } from "openai/resources/beta/threads";

////////////////////////////////////////////////////////////////

export class TranslatePrompt{

    private promptEnglish: string; 
    private langPlain: string; 
    private langForLyrics: string;

    constructor(promptEnglish: string = '', langPlain: string = '', langForLyrics: string = '') {
        this.promptEnglish = promptEnglish; 
        this.langPlain = langPlain; 
        this.langForLyrics = langForLyrics;
    }

    public async translate(): Promise<string>{
        let translated: string = ''; 
        let instruction: string = '';

        try{

            if(!this.promptEnglish) throw Error("no promptEnglish");
            if(!this.langPlain) throw Error("no langPlain");
            if(!this.langForLyrics) throw Error("no langForLyrics");

            instruction += `The prompt to be translated is "${this.promptEnglish}". `
            instruction += `Translate the prompt into the target language: "${this.langPlain.toUpperCase()}". `
            instruction += `The the followng method and style for target language: "${this.langForLyrics}". `
            instruction += `Only return the translation, commentless:`

            const runParams: RunCreateParams = { 
                assistant_id:               _translate, 
                model:                      "gpt-4o",
                additional_instructions:    instruction, 
                temperature:                0.5,
                max_prompt_tokens:          5000,
                max_completion_tokens:      2300,
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
                    const final = msgs && 'content' in msgs && msgs.content && msgs.content.length > 0 && msgs.content[0] && 'text' in msgs.content[0] && msgs.content[0].text && 'value' in msgs.content[0].text && msgs.content[0].text.value ||'';
                    if(final){ 
                        translated = final; 
                    }
                }
            } else {
                console.log(`❌ translatePrompt.js" => RUN STATUS => ${run && run.status ? run.status : 'ERROR creating run'}`)
            }

            if(!translated) throw Error(`Error on generating translation.`)

        } catch(e: unknown){
            console.log("❌ translatePrompt.js", e instanceof Error ? e.message : e);
        }
        return translated;

    }

}



