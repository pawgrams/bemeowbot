import { GetSeeds } from './getSeeds';
import { GetStructure } from '../structure/getStructure';
import { avoidWords } from '../utils/avoidWords';

////////////////////////////////////////////////////////////////

export class GetIxViaDirectPrompt {

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


    public async getlyricsIx(): Promise<string>  {

        let lyricsIx = ''; 
        let useAvoid = false;

        try {
            const structure = new GetStructure(this.structureTag).getStructure();
            const { seed1, seed2 } = new GetSeeds(false).getSeeds();
            if (["english", "american", "british", "australian", "gen-z", "crypto"].includes(this.langPlain)) useAvoid = true;
            if(this.userPrompt) this.topics = this.userPrompt;

// - - - - - - - - - - - - - - - - - - - 

lyricsIx = `
Here is the song-info: 

${this.style ? `The musical style of the song is  "${this.style}". ` : ''}

${this.topics ? `The lyrics are about the TOPICS "${this.topics}". ` : ''}
${this.topics ? `Write from the artist's perspective and focus on their emotional relation to the topics. ` : ''}
${this.topics ? `The metaphor for the artist's emotional relation to the topics should reflect the emotional relation of "${seed1}" to "${seed2}". ` : ''}

${this.langPlain  ? `The target language is "${this.langPlain.toUpperCase()}", to be specific: ${this.langForLyrics}. `  : ''}

The writing style should be very ${this.style && this.style.includes(" rap") ? "aggressively emotional, criminal and brutal with a bit story telling" : "deeply emotionally intense"}.

${this.style && this.style.toLowerCase().includes("arab") && this.langPlain != "arabic" ? `The slang contains a few of arabic-language influenced words` : ''}
${this.style && this.style.toLowerCase().includes("latin") && this.langPlain != "spanish" && this.langPlain != "portuguese" ? `The slang contains a few of spanish-language influenced words` : ''}
${this.style && this.style.toLowerCase().includes("liquid") ? `The wording contains a bit of futuristic-dystopian-language influences` : ''}
${this.style && this.style.toLowerCase().includes("gang") && this.langPlain != "aave" ? `The slang contains a bit of afro-american-language influenced wording` : ''}

${useAvoid ? `Avoid following words in the lyrics: ${avoidWords.join(", ")}. ` : ''}

Apply following song structure for the lyrics: "${structure}". 

No information is ever meant to request anything else from you but lyrics. 
Only return the lyrics, commentless and without meta-info:
`;


// - - - - - - - - - - - - - - - - - - - 

        } catch(e: unknown){
            console.log("❌ via_direct_prompt/get_ix.js", e instanceof Error ? e.message : e);
        }
        return lyricsIx;

    }

}