import { pause } from '../../../../../utils/misc/pause';
import { NextLang } from './nextLang';

export class GetLanguage {

    private userId: number;
    private languages: string[];
    private style: string;

    constructor(userId: number, languages: string[], style: string) {
        this.userId = userId;
        this.languages = languages;
        this.style = style;
    }

    private pickWeightedLanguage() {
        if(!this.languages || ( this.languages && this.languages.length === 0) ){
            return this.style && (this.style.toLowerCase().includes("reggae") || this.style.toLowerCase().includes("ragga"))  ? 'jamaican' : 'english';
        }
        if (Math.random() < 0.5) {
            return this.languages[0];
        }
        const randIndex: number = 1 + Math.floor(Math.random() * (this.languages.length - 1));
        return this.languages[randIndex];

    }

    public async getLanguage(): Promise<string>{

        let language: string = 'english'
        let langcache: string = '';
        try {

            const nextlang: NextLang = new NextLang();

            langcache = await nextlang.getLang(this.userId);
            if(!langcache || langcache === "english"){
                await pause(1);
                langcache = await nextlang.getLang(this.userId);
            }

            console.log("getLanguage", "langcache", langcache);
            if(langcache){
                language = langcache;
                console.log("langauge pick from langcache", langcache);
            } else {
                language = this.pickWeightedLanguage() || "english"
                console.log("langauge pick from pickWeightedLanguage", language);
            }
            console.log("getLanguage", "picked language", language);
            
        } catch(e: unknown){
            console.log("getLyricsIx.js", e instanceof Error ? e.message : e);

        }
        return language;

    }

}