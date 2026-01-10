import { client } from '../../../../../endpoints/openai/openAi';
import { TranslatePrompt } from '../language/translatePrompt';
import { IsAssistantErrorMsg } from '../../../../../endpoints/openai/isAssistantErrorMsg';
import { GetIxViaFantasyArtists } from './get_ix';
import { pause } from '../../../../../utils/misc/pause';
import { ChatCompletion } from "openai/resources/chat/completions"

//////////////////////////////////////////////////////////////// 

export class GetLyricsViaFantasyArtists {

    private topics: string; 
    private langForLyrics: string; 
    private style: string;
    private structure: string; 
    private langPlain: string; 
    private userPrompt: string;
    private subgenre: string;
    private maingenre: string;
    private isEnglish: boolean;
    private artistIx: string;
    private artists: string;
    private lyricsIx: string;
    private lyrics: string;

    constructor(
        topics: string = '', 
        langForLyrics: string = '', 
        style: string = '', 
        structure: string = '', 
        langPlain: string = '', 
        userPrompt: string = '',
        subgenre: string = '',
        maingenre: string = '',

    ) {
        this.topics = topics; 
        this.langForLyrics = langForLyrics; 
        this.style = style;
        this.structure = structure; 
        this.langPlain = langPlain.toLowerCase(); 
        this.userPrompt = userPrompt;
        this.subgenre = subgenre;
        this.maingenre = maingenre;
        this.isEnglish = false;
        this.artistIx = "";
        this.artists = "";
        this.lyricsIx = "";
        this.lyrics = "";
    }

    // - - - - - - - - - - - - - - - - - - - 

    public async get_lyrics(): Promise<string> {
        this.isEnglish = ["english", "american", "british", "australian"].includes(this.langPlain);
        this.get_artists();
        this.get_text();
        return this.lyrics || '';
    }

    // - - - - - - - - - - - - - - - - - - - 

    public async get_artists(): Promise<void> {

        try{

            this.artistIx = await new GetIxViaFantasyArtists(
                this.topics, 
                this.langForLyrics, 
                this.style, 
                this.structure, 
                this.langPlain, 
                this.userPrompt, 
                this.subgenre,
                this.maingenre
            ).get_artist_ix();

            if (!this.isEnglish){
                this.artistIx = await new TranslatePrompt(this.artistIx, this.langPlain, this.langForLyrics).translate();
            }

            const temperatures: number[] = [0.8, 0.9, 1.0, 1.1, 1.2, 1.3];
            const temperature: number = temperatures[Math.floor(Math.random() * temperatures.length)];

            let retry: number = 15;
            let isSuccess: boolean = false;
            while(!isSuccess && retry > 0){

                try {

                    const completion: ChatCompletion = await client.chat.completions.create({
                        model: "gpt-4o-search-preview",
                        temperature: temperature,
                        messages: [{ 
                            role: "user", 
                            content: this.artistIx,
                        }],
                    });

                    const result: string = completion.choices[0].message.content || '';
                    if(!completion || !result) throw Error("no completion result")

                    this.artists = result.trim();

                    const assMsgErr: IsAssistantErrorMsg = new IsAssistantErrorMsg(this.artists);
                    if(assMsgErr.isAssistantErrorMsg()) throw Error(`invalid lyrics result`);
                    break;

                } catch(e: unknown){
                    retry--;
                    await pause(1);
                }
            }

            if(!this.artists) throw Error("no lyrics after several retries");

        } catch(e: unknown){
            console.log("❌ lyrics/via_artists/get_artists.js", e instanceof Error ? e.message : e);
        }

    }

    // - - - - - - - - - - - - - - - - - - - 

    public async get_text(): Promise<void> {

        try{

            this.lyricsIx = await new GetIxViaFantasyArtists(
                this.topics, 
                this.langForLyrics, 
                this.style, 
                this.structure, 
                this.langPlain, 
                this.userPrompt, 
                this.subgenre,
                this.maingenre
            ).get_lyrics_ix();

            if (!this.isEnglish){
                this.lyricsIx = await new TranslatePrompt(this.lyricsIx, this.langPlain, this.langForLyrics).translate();
            }

            const temperatures: number[] = [0.8, 0.9, 1.0, 1.1, 1.2, 1.3];
            const temperature: number = temperatures[Math.floor(Math.random() * temperatures.length)];

            let retry: number = 15;
            let isSuccess: boolean = false;
            while(!isSuccess && retry > 0){

                try {

                    const completion: ChatCompletion = await client.chat.completions.create({
                        model: "gpt-4o",
                        temperature: temperature,
                        messages: [{ 
                            role: "user", 
                            content: this.lyricsIx,
                        }],
                    });

                    const result: string = completion.choices[0].message.content || '';
                    if(!completion || !result) throw Error("no completion result")

                    this.lyrics = result.trim();

                    const assMsgErr: IsAssistantErrorMsg = new IsAssistantErrorMsg(this.lyrics);
                    if(assMsgErr.isAssistantErrorMsg()) throw Error(`invalid lyrics result`);
                    break;

                } catch(e: unknown){
                    retry--;
                    await pause(1);
                }
            }

            if(!this.lyrics) throw Error("no lyrics after several retries");

        } catch(e: unknown){
            console.log("❌ lyrics/via_artists/get_lyrics.js", e instanceof Error ? e.message : e);
        }

    }


}


