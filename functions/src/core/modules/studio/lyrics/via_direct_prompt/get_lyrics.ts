import { openai } from '../../../../../endpoints/openai/openAi';
import { CreateAssistant } from '../../../../../endpoints/openai/createAssistant';
import { DeleteAssistant } from '../../../../../endpoints/openai/deleteAssistant';
import { TranslatePrompt } from '../language/translatePrompt';
import { IsAssistantErrorMsg } from '../../../../../endpoints/openai/isAssistantErrorMsg';
import { pause } from '../../../../../utils/misc/pause';
import { GetIxViaDirectPrompt } from './get_ix';
import { lyricsPrompts } from './lyricsPrompts';
import type { Thread, Run, MessagesPage } from "openai/resources/beta/threads";

////////////////////////////////////////////////////////////////

export class GetLyricsViaDirectPrompt {

    private topics: string; 
    private langForLyrics: string; 
    private style: string;
    private structureTag: string; 
    private langPlain: string; 
    private userPrompt: string;
    private subgenre: string;
    private maingenre: string;

    constructor(
        topics: string = '', 
        langForLyrics: string = '', 
        style: string = '', 
        structureTag: string = '', 
        langPlain: string = '', 
        userPrompt: string = '',
        subgenre: string = '',
        maingenre: string = '',

    ) {
        this.topics = topics; 
        this.langForLyrics = langForLyrics; 
        this.style = style;
        this.structureTag = structureTag; 
        this.langPlain = langPlain.toLowerCase(); 
        this.userPrompt = userPrompt;
        this.subgenre = subgenre;
        this.maingenre = maingenre;
    }

    public async get_lyrics(): Promise<string> {
        
        let lyricsIx: string = "";
        let lyricsResult: string = '';
        let assistant: string = '';
        const isEnglish: boolean = ["english", "american", "british", "australian"].includes(this.langPlain);
        
        try{

            lyricsIx = await new GetIxViaDirectPrompt(this.topics, this.langForLyrics, this.style, this.structureTag, this.langPlain, this.userPrompt, this.subgenre, this.maingenre).getlyricsIx();  

            let mainAssistantPromptKey: string = "";
            const lyricsPromptKeys: string[] = Object.keys(lyricsPrompts) || [];
            if(lyricsPromptKeys && lyricsPromptKeys.length > 0) {
                mainAssistantPromptKey = lyricsPromptKeys[Math.floor(Math.random() * lyricsPromptKeys.length)];
            }
            let mainAssistantPrompt: string = lyricsPrompts[mainAssistantPromptKey];
            let translatedMainPrompt: string = mainAssistantPrompt;
            let translatedLyricsIx: string = lyricsIx;

            const temperatures: number[] = [0.8, 0.9, 1.0, 1.1, 1.2, 1.3];
            const temperature: number = temperatures[Math.floor(Math.random() * temperatures.length)];

            if (isEnglish){
                assistant = await new CreateAssistant(translatedMainPrompt, `lyrics_${this.langPlain}`, "gpt-4.1-2025-04-14", temperature).create();
            } else {
                translatedMainPrompt = await new TranslatePrompt(mainAssistantPrompt, this.langPlain, this.langForLyrics).translate();
                assistant = await new CreateAssistant(translatedMainPrompt, `lyrics_${this.langPlain}`, "gpt-4.1-2025-04-14", temperature).create();
                translatedLyricsIx = await new TranslatePrompt(lyricsIx, this.langPlain, this.langForLyrics).translate();
            }
            
            if(!assistant) throw Error("no assistant id fetched from env");
            
            const runParams: any = { 
                assistant_id:               assistant, 
                model:                      "gpt-4.1-2025-04-14",
                temperatures:               temperatures,
                additional_instructions:    translatedLyricsIx, 
            };

            let retry: number = 8
            let isLyricsResult: boolean = false;
            while(!isLyricsResult && retry > 0){

                try {

                    const thread: Thread = await openai.beta.threads.create({messages: []});
                    if(!thread) throw Error('faileed to create new thread in openai');
                    console.log("thread", thread);

                    const run: Run = await openai.beta.threads.runs.createAndPoll(thread.id, runParams);
                    if(!run) throw Error(`could not start run => ${run}`);
                    console.log("run", run);

                    if ('status' in run && run.status == 'completed') {
                        const threadMsgs: MessagesPage = await openai.beta.threads.messages.list(thread.id);
                        for (const msgs of threadMsgs.data.reverse()) {

                            const final: string = msgs && 'content' in msgs && msgs.content && msgs.content.length > 0 && msgs.content[0] && 'text' in msgs.content[0] && msgs.content[0].text && 'value' in msgs.content[0].text && msgs.content[0].text.value ||'';
                            if(!final) throw Error(`no lyrics result => ${retry} retries left`);

                            const assmsgerr: IsAssistantErrorMsg = new IsAssistantErrorMsg(final);
                            if(assmsgerr.isAssistantErrorMsg()) throw Error(`invalid lyrics result => ${retry} retries left`);
                            
                            lyricsResult = final;
                            isLyricsResult = true;
                            break;

                        }

                    } else {
                        throw Error(`run creation failed => ${run && run.status ? run.status : 'ERROR creating run'}`)
                    }

                } catch(e: unknown){
                    await pause(1)
                    retry--;
                }

            }

            if(!lyricsResult) throw Error(`lyrics creation failed after several retries`);

        } catch(e: unknown){
            console.log("❌ via_direct_prompt/get_lyrics.js", e instanceof Error ? e.message : e);
        }

        new DeleteAssistant(assistant).delete(); 

        return lyricsResult;

    }

}


