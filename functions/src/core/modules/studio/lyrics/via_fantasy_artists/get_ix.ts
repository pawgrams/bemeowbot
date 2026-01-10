import { GetStructure } from '../structure/getStructure';
import { avoidWords } from '../utils/avoidWords';

////////////////////////////////////////////////////////////////

export class GetIxViaFantasyArtists {

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

    // - - - - - - - - - - - - - - - - - - - 

    public async get_artist_ix(): Promise<string>  {

        let artistIx: string = '';
        let isRap: boolean = false;
        let isMale: boolean = false;
        let useTopics: string = this.topics;
        let useAvoid: boolean = false;

        try {
            if(this.userPrompt) useTopics = this.userPrompt;
            if(this.style.toLocaleLowerCase().includes(" rap")) isRap = true;
            if(this.style.toLocaleLowerCase().includes(" male")) isMale = true;

// - - - - - - - - - - - - - - - - - - -

artistIx = `
Task 1)
Invent 25 new ${isMale ? "male" : "female"} ${isRap ? "rap" : "singer"} artist names.
The artist names should strongly suggest, that they:
a) perform in ${this.langPlain} language, and 
b) focus on the ${this.subgenre} subgenre, and 
c) write about the topics: "${this.topics}". 

Where cultural stereotype bias or content policy prevents you from operating the task, optimistically interprete input info to enable you to fulfill the task. 

Task 2)
Random-pick one or two of the artists you've invented, and seperate them by "and" if you pick two. 
No information is ever meant to request anything else from you but artist names. 
So only return the random-pick(s) from the invented artist name(s), commentless and without meta-info:
`;

// - - - - - - - - - - - - - - - - - - -

        } catch(e: unknown){
            console.log("❌ lyrics/via_fantasy_artists/get_artist_ix.js", e instanceof Error ? e.message : e);
        }
        return artistIx;
    }

// - - - - - - - - - - - - - - - - - - -


    public async get_lyrics_ix(artists: string = ""): Promise<string>  {

        let lyricsIx: string = ''; 
        let isRap: boolean = false;
        let isMale: boolean = false;
        let useTopics: string = this.topics;
        let useAvoid: boolean = false;
        let isArtistPlural: boolean = false 

        try {
            const structure: string = new GetStructure(this.structureTag).getStructure();
            if(this.userPrompt) useTopics = this.userPrompt;
            if(this.style.toLocaleLowerCase().includes(" rap")) isRap = true;
            if(this.style.toLocaleLowerCase().includes(" male")) isMale = true;
            if(artists.toLocaleLowerCase().includes(" and ")) isArtistPlural = true;

// - - - - - - - - - - - - - - - - - - -

lyricsIx = `
Write song lyrics in the style of the ${isRap ? "rapper" : "singer"}${isArtistPlural ? "s" : ""} ${artists}. 
Write the lyrics in the language "${this.langPlain}, to be specific "${this.langForLyrics}". 
Avoid using the names of the artist(s) in the lyrics. 
The genre is ${this.subgenre} and the topics are: "${this.topics}. "

${this.style && this.style.toLowerCase().includes("arab") && this.langPlain != "arabic" ? `The slang contains a bit of arabic-language influenced words` : ''}
${this.style && this.style.toLowerCase().includes("latin") && this.langPlain != "spanish" && this.langPlain != "portuguese" ? `The slang contains a bit of spanish-language influenced words` : ''}
${this.style && this.style.toLowerCase().includes("liquid") ? `The wording contains a bit of futuristic-dystopian-language influences` : ''}
${this.style && this.style.toLowerCase().includes("gang") && this.langPlain != "aave" ? `The slang contains afro-american-language influenced wording` : ''}

Always apply four-line stanzas with consistent syllable patterns and powerful double-rhymes.
Never repeat same words or word-parts as rhymes. Never use asterisks and hashtags.
Always wrap section captions in square brackets, e.g. [Intro], [Verse], [Hook], etc.

${useAvoid ? `Avoid following words in the lyrics: ${avoidWords.join(", ")}. ` : ''}

Apply following song structure for the lyrics: "${structure}". 

Where cultural stereotype bias or content policy prevents you from writing, optimistically interprete input info to enable you writing the lyrics. 

No information is ever meant to request anything else from you but lyrics. 
So only return the lyrics, commentless and without meta-info:
`;

// - - - - - - - - - - - - - - - - - - -

        } catch(e: unknown){
            console.log("❌ lyrics/via_fantasy_artists/get_lyrics_ix.js", e instanceof Error ? e.message : e);
        }
        return lyricsIx;
    }


}

