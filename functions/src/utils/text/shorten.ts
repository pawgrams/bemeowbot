const nlp = require('compromise');

export class Shorten {

    private text: any;
    private percentage: number;

    constructor(text: string, percentage: number) {
        this.text = text;
        this.percentage = percentage;
    }

    public shorten(): string {
        try{
            const doc: any = nlp(this.text);
            const sentences: any = doc.sentences().data();
            const targetCount: number = Math.ceil((this.percentage / 100) * sentences.length);
            const final: string = sentences.slice(0, targetCount).map((s: any) => s.text).join(' ') || '';
            return final || '';
        } catch(e: unknown){
            console.log("❌ utils => text => shorten.js => ", e instanceof Error ? e.message : e);
            return this.text;
        }
    }
    
}