import {Summarise} from './summarise';
import {Shorten} from './shorten';

////////////////////////////////////////////////////////////////

export class ProcessText {

    private text: string;
    private maxSentences: number;
    private maxTextLength: number;

    constructor(text: string, maxSentences: number = 5, maxTextLength: number = 350) {
        this.text = text;
        this.maxSentences = maxSentences;
        this.maxTextLength = maxTextLength;
    }

    public processtext(): string {
        let processed: string = '';
        try {
            if(!this.text.startsWith('/lyrics')){
                if(this.text.length > this.maxTextLength){
                    const summ: Summarise = new Summarise(this.text, this.maxSentences);
                    processed = summ.summarise();
                    if(processed.length > this.maxTextLength){
                        const percentage: number = Math.round( ( this.maxTextLength - 5) / processed.length * 100);
                        const short: Shorten = new Shorten(processed, percentage);
                        processed = short.shorten();
                        if(processed.length > this.maxTextLength){
                            processed.slice(0, this.maxTextLength - 1)
                        }
                    }
                } else {
                    processed = this.text || '';
                }
            } else {
                processed = this.text || '';
            }
        } catch(e: unknown){
            console.log("❌ utils => text => processtext.js => ", e instanceof Error ? e.message : e);
        }
        return processed;
    }
    
}