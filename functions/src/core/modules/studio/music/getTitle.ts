import { openai } from '../../../../endpoints/openai/openAi';
import { ProcessText } from '../../../../utils/text/processtext';
import { pause } from '../../../../utils/misc/pause';
import { beatSectionCaption } from './beatLyrics';
import { IsAssistantErrorMsg } from '../../../../endpoints/openai/isAssistantErrorMsg';
import { ChatCompletion } from "openai/resources/chat/completions"

////////////////////////////////////////////////////////////////

export class GetTitle {

    private style: string;
    private lyrics: string;
    private language: string;
    private title: string;

    constructor(style: string = '', lyrics: string = '', language: string = '') {
        this.style = style;
        this.lyrics = lyrics;
        this.language = language;
        this.title = '';
    }

    public async getTitle(): Promise<string> {

        const maxtitle: number = 40;
        try {
            this.title = await this.getViaOpenAi();

            if(!this.title){
                await pause(2, false);
                this.title = await this.getViaOpenAi();

                if(!this.title && !this.lyrics.includes(beatSectionCaption)){
                    const ptxt1: ProcessText = new ProcessText(this.lyrics, 5);
                    this.title = ptxt1.processtext();
                    const ptxt2: ProcessText = new ProcessText(this.title, 1);
                    this.title = ptxt2.processtext();

                } else if (!this.title && this.lyrics.includes(beatSectionCaption) && this.style) {
                    const ptxt1: ProcessText = new ProcessText(this.style, 5);
                    this.title = ptxt1.processtext();
                    const ptxt2: ProcessText = new ProcessText(this.title, 1);
                    this.title = ptxt2.processtext();
                }
            }

            if(this.title){
                const countSpaces: number = (this.title.match(/ /g) || []).length;
                if(countSpaces > 2){
                    this.title = this.title.slice(0, this.title.slice(0, maxtitle).lastIndexOf(" "));
                } 
            }

        } catch(e: unknown){
            console.log("❌ getTitle", "getTitle()", e instanceof Error ? e.message : e);
        }
        
        return this.title;

    }

    ////////////////////////////////////////////////////////////////

    public async getViaOpenAi(): Promise<string> {

        try {
                
let prompt: string = `
Return a suitable song title for the ${this.lyrics && !this.lyrics.includes(beatSectionCaption) ? 'lyrics' : 'song style'}. 
${this.lyrics && this.lyrics.includes(beatSectionCaption) ? 'Choose a very creative song title (meaning you have an idea and then you waive it because you know it was AI crap and then you totally rethink it all to find a REAL CREATIVE UNIQUE COOL song title) maybe indirectly related to the song style, but do NEVER EVER be stereotypical or biased about cultural aspects!!! ' : ''}
${this.lyrics && !this.lyrics.includes(beatSectionCaption) ? "Identify the language of the lyrics and set the title in this language. The style of the song may not decide about the language you set for the title." : ''}
${this.lyrics && !this.lyrics.includes(beatSectionCaption) ? `The title MUST represent the song topic. ${this.lyrics ? 'The title must be found the Chorus' : ''}. The title may NOT contain onomatopeia` : ''}
The title MUST have at least two words but no more than 3 words. 
The title may NOT be not longer than 20 chars (including spaces). 
${this.lyrics && !this.lyrics.includes(beatSectionCaption) ? "The title must be in the language of the lyrics. If its not an actual language then act like it was a real language. If lyrics contain english then language is english. " : ''}
${this.language ? `The target language for the title is "${this.language}". ` : !this.lyrics.includes(beatSectionCaption) ? 'Analyse the lyrics to apply the according language of the lyrics for the title. Only the language of the lyrics may decide about the language of the title. ' : ''}
Return the song title accordingly and commentless. 
${this.lyrics && !this.lyrics.includes(beatSectionCaption) ? `Here are the song lyrics: "${this.lyrics}"` : ''}
${ (!this.lyrics || this.lyrics.includes(beatSectionCaption) ) && this.style ? `Here is the song style: "${this.style}"` : ''}
`;
        
            const temperature: number = this.lyrics && this.lyrics.includes(beatSectionCaption) ? 1.5 : 1;

            let maxretry: number = 5;
            let isTitle: boolean = false;
            while(maxretry > 0 && !isTitle){
                try {
                    const result: ChatCompletion = await openai.chat.completions.create({
                        model: "gpt-4o",
                        temperature: temperature,
                        messages: [
                            {
                                role: "user",
                                content: prompt,
                            },
                        ],
                    });
                    
                    let message: string = result?.choices[0]?.message?.content || '';
                    message = message.trim();
                    if(!message) throw Error("no title found")

                    const assmsgerr: IsAssistantErrorMsg = new IsAssistantErrorMsg(message, 8);
                    if(assmsgerr.isAssistantErrorMsg()) throw Error(`invalid title result => ${maxretry} retries left`);

                    this.title = String(message);
                    isTitle = true;
                    
                } catch {
                    maxretry--;
                    await pause(0.5);
                }
            }

        } catch(e: unknown){
            console.log(" ❌getTitle", "getViaOpenAi()", e instanceof Error ? e.message : e);
        }
        return this.title;
    }

}

