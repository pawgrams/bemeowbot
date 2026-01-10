import { client } from '../../../../../endpoints/openai/openAi';
import { TranslatePrompt } from '../language/translatePrompt';
import { IsAssistantErrorMsg } from '../../../../../endpoints/openai/isAssistantErrorMsg';
import { GetIxViaExotic } from './get_ix';
import { pause } from '../../../../../utils/misc/pause';
import { ChatCompletion } from "openai/resources/chat/completions"

////////////////////////////////////////////////////////////////

export class GetLyricsViaExotic {

    private topics: string; 
    private langForLyrics: string; 
    private style: string;
    private structureTag: string; 
    private langPlain: string; 
    private userPrompt: string;

    constructor(
        topics: string = '', 
        langForLyrics: string = '', 
        style: string = '', 
        structureTag: string = '', 
        langPlain: string = '', 
        userPrompt: string = '',

    ) {
        this.topics = topics; 
        this.langForLyrics = langForLyrics; 
        this.style = style;
        this.structureTag = structureTag; 
        this.langPlain = langPlain.toLowerCase(); 
        this.userPrompt = userPrompt;
    }
    

    public async get_lyrics(): Promise<string> {
        
        let lyricsIx: string = "";
        let lyrics: string = '';
        
        try{

            lyricsIx = await new GetIxViaExotic(
                this.topics, 
                this.langForLyrics, 
                this.style,
                this.structureTag, 
                this.langPlain, 
                this.userPrompt, 
            ).get_ix();

            lyricsIx = await new TranslatePrompt(lyricsIx, this.langPlain, this.langForLyrics).translate();

            const temperatures: number[] = [0.8, 0.9, 1.0, 1.1, 1.2, 1.3];
            const temperature: number = temperatures[Math.floor(Math.random() * temperatures.length)];

            let retry: number = 15;
            let isSuccess: boolean = false;
            while(!isSuccess && retry > 0){

                try {

                    const completion: ChatCompletion = await client.chat.completions.create({
                        model: "gpt-4.1",
                        temperature: temperature,
                        messages: [{ 
                            role: "user", 
                            content: lyricsIx,
                        }],
                    });

                    const result: string = completion.choices[0].message.content || '';
                    if(!completion || !result) throw Error("no completion result")

                    lyrics = result.trim();

                    const assMsgErr: IsAssistantErrorMsg = new IsAssistantErrorMsg(lyrics);
                    if(assMsgErr.isAssistantErrorMsg()) throw Error(`invalid lyrics result`);
                    break;

                } catch(e: unknown){
                    retry--;
                    await pause(1);
                }
            }

            if(!lyrics) throw Error("no lyrics after several retries");


        } catch(e: unknown){
            console.log("❌ lyrics/via_exotic/get_lyrics.js", e instanceof Error ? e.message : e);
        }

        return lyrics;

    }

}


