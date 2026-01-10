import { GetLyricsViaExotic } from './via_exotic/get_lyrics';
import { GetLyricsViaArtistsTexts } from './via_artists_texts/get_lyrics';
import { GetLyricsViaArtists } from './via_artists/get_lyrics';
import { GetLyricsViaFantasyArtists } from './via_fantasy_artists/get_lyrics';
import { GetLyricsViaDirectPrompt } from './via_direct_prompt/get_lyrics';
import { Finetune } from './finetune';
import { IsAssistantErrorMsg } from '../../../../endpoints/openai/isAssistantErrorMsg';
import { pause } from '../../../../utils/misc/pause';
import { openai } from '../../../../endpoints/openai/openAi';
import type { Thread, Run, MessagesPage, RunCreateParams } from "openai/resources/beta/threads";
import { _curation } from '../../../../context/cache/access';

////////////////////////////////////////////////////////////////

export class LyricsHandler {

    private topics: string; 
    private langForLyrics: string; 
    private style: string;
    private structureTag: string; 
    private isExotic: boolean; 
    private rhymes: string;
    private langForStyle: string; 
    private langPlain: string; 
    private userPrompt: string;
    private subgenre: string;
    private maingenre: string;

    constructor(
        topics: string = '', 
        langForLyrics: string = '', 
        style: string = '', 
        structure: string = '', 
        isExotic: boolean = false, 
        rhymes: string = '',
        langForStyle: string = '', 
        langPlain: string = '', 
        userPrompt: string = '',
        subgenre: string = '',
        maingenre: string = '',

    ) {
        this.topics = topics; 
        this.langForLyrics = langForLyrics; 
        this.style = style;
        this.structureTag = structure; 
        this.isExotic = isExotic;  
        this.rhymes = rhymes;
        this.langForStyle = langForStyle; 
        this.langPlain = langPlain.toLowerCase(); 
        this.userPrompt = userPrompt;
        this.subgenre = subgenre;
        this.maingenre = maingenre;
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

    public async handle(): Promise<string>  {

        let lyrics: string = '';
        let retry: number = 5;

        try {
           
            if(this.isExotic){
                lyrics = await new GetLyricsViaExotic(this.topics, this.langForLyrics, this.style, this.structureTag, this.langPlain, this.userPrompt).get_lyrics();

            } else {

                const allLyrics: string[] = await Promise.all([
                    new GetLyricsViaArtistsTexts(this.topics, this.langForLyrics, this.style, this.structureTag, this.langPlain, this.userPrompt, this.subgenre).get_lyrics(),
                    new GetLyricsViaArtists(this.topics, this.langForLyrics, this.style, this.structureTag, this.langPlain, this.userPrompt, this.subgenre, this.maingenre).get_lyrics(),
                    new GetLyricsViaFantasyArtists(this.topics, this.langForLyrics, this.style, this.structureTag, this.langPlain, this.userPrompt, this.subgenre, this.maingenre).get_lyrics(),
                    new GetLyricsViaDirectPrompt(this.topics, this.langForLyrics, this.style, this.structureTag, this.langPlain, this.userPrompt, this.subgenre, this.maingenre).get_lyrics(),
                ]);

                if(allLyrics.every(l => !l)) throw Error("All lyrics promises returned falsy");

                const additionalInstructions: string = allLyrics
                    .map((lyr, idx) => {
                        const val: string = lyr ?? "EMPTY due to error => not a choice";
                        return `Index ${idx}: ${val === "" ? "__EMPTY__" : JSON.stringify(val)}`;
                    })
                    .join("\n\n");

                const preprompt: string = `Here the meta-info about the song as additional evalutaion criteria: "maingenre: ${this.maingenre}, subhenre: ${this.subgenre}, topics: ${this.topics}, language-style: ${this.langForLyrics}, userprompt for the lyrics: ${this.userPrompt}". `;

                const runParams: RunCreateParams = { 
                    assistant_id:               _curation, 
                    model:                      "gpt-4.1-2025-04-14", 
                    additional_instructions:    preprompt + additionalInstructions, 
                };

                retry = 20
                let isLyricsResult: boolean = false;
                let lyricsIndex: number = 0;
                while(!isLyricsResult && retry > 0){

                    try {
                        const thread: Thread = await openai.beta.threads.create({messages: []});
                        if(!thread) throw Error('failed to create new thread in openai');

                        const run: Run = await openai.beta.threads.runs.createAndPoll(thread.id, runParams);
                        if(!run) throw Error(`could not start run => ${run}`);

                        if ('status' in run && run.status == 'completed') {
                            const threadMsgs: MessagesPage = await openai.beta.threads.messages.list(thread.id);
                            for (const msgs of threadMsgs.data.reverse()) {
                                let final: string = (msgs && 'content' in msgs && msgs.content && msgs.content.length > 0 && msgs.content[0] && 'text' in msgs.content[0] && msgs.content[0].text && 'value' in msgs.content[0].text && msgs.content[0].text.value) ||'';
                                final = final.trim()
                                lyricsIndex = Number(final);
                                if(!final) throw Error(`no lyrics result => ${retry} retries left`);
                                if (isNaN(lyricsIndex) || !allLyrics[lyricsIndex]) throw Error("Invalid lyrics index");
                                lyrics = allLyrics[lyricsIndex];
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

                if(!lyrics) lyrics = allLyrics.find(l => l) || ''
                if(!lyrics) throw Error(`lyrics creation failed after several retries`);

            }

            // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

            if(!this.isExotic && lyrics){
                retry = 8;
                let isFineTunedValid: boolean = false;
                while(retry > 0 && !isFineTunedValid){
                    const fineTune: Finetune = new Finetune(lyrics, this.langForLyrics);
                    const finetunedLyrics: string = await fineTune.finetune();
                    const assmsgerr: IsAssistantErrorMsg = new IsAssistantErrorMsg(finetunedLyrics);
                    if(finetunedLyrics && !assmsgerr.isAssistantErrorMsg()){
                        isFineTunedValid = true;
                        lyrics = finetunedLyrics;
                        break;
                    }
                    retry--;
                    await pause(0.5);
                }
            }

            // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

        } catch(e: unknown) {
            console.log("❌ lyrics/lyricsHandler.js", e instanceof Error ? e.message : e);
            return ""
        }

        return lyrics;

    }


}