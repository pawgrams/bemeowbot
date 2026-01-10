const nlp = require('compromise');

export class Summarise {

    private text: string;
    private maxSentences: number;

    constructor(text: string, maxSentences: number) {
        this.text = text;
        this.maxSentences = maxSentences;
    }

    public summarise(): string {
        let shortenedResult: string = '';
        try {
            shortenedResult = this.summarizeText(this.text, this.maxSentences);
        } catch(e: unknown){
            console.log("❌ utils => text => summarise.js => ", e instanceof Error ? e.message : e);
        }
        return shortenedResult || '';
    }

    public summarizeText(text: string, sentenceCount: number): any {
        const doc: any = nlp(text);
        const sentences: string[] = doc.sentences().out('array');
        if (sentences.length === 0) {
            return '';
        }
        const firstSentence: string = sentences[0];
        const sentenceScores: any | number = sentences.map((sentence:string, i:number) => {
            const score: number = sentences.reduce((sum:number, otherSentence:string, j:number) => {
                if (i !== j) {
                    sum += this.sentenceSimilarity(sentence, otherSentence);
                }
                return sum;
            }, 0);
            return { sentence, score };
        });
        let topSentences2: any = sentenceScores
            .sort((a:any, b:any) => b.score - a.score)
            .slice(0, sentenceCount)
            .map((s:any) => s.sentence);
        if (!topSentences2.includes(firstSentence)) {
            topSentences2.unshift(firstSentence);
        }
        return topSentences2.join(' ') || '';
    }

    public sentenceSimilarity(sentence1: string, sentence2: string, positionWeight: number = 0.1): number {
        const words1: Set<string> = new Set(sentence1.toLowerCase().split(/\s+/));
        const words2: Set<string> = new Set(sentence2.toLowerCase().split(/\s+/));
        const intersection: string[] = [...words1].filter((word: string) => words2.has(word));
        const baseScore: number = intersection.length / Math.sqrt(words1.size * words2.size);
        return baseScore + positionWeight;
    }


}