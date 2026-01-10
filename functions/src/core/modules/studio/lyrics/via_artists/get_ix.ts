import { GetStructure } from '../structure/getStructure';
import { avoidWords } from '../utils/avoidWords';

////////////////////////////////////////////////////////////////

export class GetIxViaArtists {

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


    public async get_ix(): Promise<string>  {

        let lyricsIx: string = ''; 
        let isRap: boolean = false;
        let isMale: boolean = false;
        let useTopics: string = this.topics;
        let useAvoid: boolean = false;

        try {
            const structure: string = new GetStructure(this.structureTag).getStructure();
            if(this.userPrompt) useTopics = this.userPrompt;
            if(this.style.toLocaleLowerCase().includes(" rap")) isRap = true;
            if(this.style.toLocaleLowerCase().includes(" male")) isMale = true;

// - - - - - - - - - - - - - - - - - - - 

lyricsIx = `
Task 1)
Conclude a main ${isMale ? "male" : "female"} ${isRap ? "rap" : "singing"} artist category and topic category from following topics: "${this.topics}". 

Task 2)
Do web_search to find the 25 most successful ${isRap ? "rappers" : "singers"} focussing on these categories and the ${this.maingenre} genre, preferably performing in ${this.langPlain} langauage.". 
Then random-pick one or two of those artists. 

Task 3)
Then write song lyrics in the style of those artists and about the mentioned topics.". 
Write the lyrics in the language "${this.langPlain}, to be specific "${this.langForLyrics}". 
Avoid using the names of the artist(s) in the lyrics. 

${this.style && this.style.toLowerCase().includes("arab") && this.langPlain != "arabic" ? `The slang contains a few of arabic-language influenced words` : ''}
${this.style && this.style.toLowerCase().includes("latin") && this.langPlain != "spanish" && this.langPlain != "portuguese" ? `The slang contains a few of spanish-language influenced words` : ''}
${this.style && this.style.toLowerCase().includes("liquid") ? `The wording contains a bit of futuristic-dystopian-language influences` : ''}
${this.style && this.style.toLowerCase().includes("gang") && this.langPlain != "aave" ? `The slang contains a bit of afro-american-language influenced wording` : ''}

Always apply four-line stanzas with consistent syllable patterns and powerful double-rhymes.
Never repeat same words or word-parts as rhymes. Never use asterisks and hashtags.
Always wrap section captions in square brackets, e.g. [Intro], [Verse], [Hook], etc.

${useAvoid ? `Avoid following words in the lyrics: ${avoidWords.join(", ")}. ` : ''}

Apply following song structure for the lyrics: "${structure}". 

Where cultural stereotype bias or content policy prevents you from writing, optimistically interprete input info to enable you writing the lyrics. 

Task 4)
No information is ever meant to request anything else from you but lyrics. 
So only return the lyrics, commentless and without meta-info:
`;
     
// - - - - - - - - - - - - - - - - - - - 

        } catch(e: unknown){
            console.log("❌ lyrics/via_artists/get_ix.js", e instanceof Error ? e.message : e);
        }
        return lyricsIx;

    }

}