export const beatSectionCaption: string = "Only Instrumental, Pure Instrumental Solo";
export const beatSectionCaptionWithEmoji: string = "😶🤐🙊 " + beatSectionCaption;

////////////////////////////////////////////////////////////////

const beatStructures: Record<string, string[]> = {
    "long":  ["[Intro]", "[Verse]",  "[Bridge]",   "[Hook]",   "[Verse]",    "[Bridge]", "[Hook]",     "[C-Part]", "[Hook]", "[Outro]" ],
    "mid":   ["[Intro]", "[Verse]",  "[Hook]",     "[Verse]",  "[Hook]",     "[Bridge]", "[Hook]",     "[Outro]"                       ],
    "short": ["[Intro]", "[Verse]",  "[Hook]",     "[Bridge]", "[Build-Up]", "[Verse]",  "[Hook]",     "[Outro]"                       ],
    "fx":    ["[Intro]", "[Bridge]", "[Build-Up]", "[Verse]",  "[Hook]",     "[Bridge]", "[Build-Up]", "[Verse]",  "[Hook]", "[Outro]" ],
    "tech":  ["[Intro]", "[Bridge]", "[Build-Up]", "[Verse]",  "[Hook]",     "[Bridge]", "[Build-Up]", "[Verse]",  "[Hook]", "[Outro]" ],
}

const lines: Record<string, number> = {
    "[Intro]":      4,
    "[Verse]":      8,
    "[Hook]":       8,
    "[Bridge]":     4,
    "[Build-Up]":   4,
    "[C-Part]":     4,
    "[Outro]":      4
}

////////////////////////////////////////////////////////////////

const double: string[] = ["tech"]

export class BeatLyrics {

    private struct: string;

    constructor(struct: string = "short") {
        this.struct = struct;
    }

    public beatLyrics(): string {
        let lyrics: string = '';
        try {
            const captions: string[] = beatStructures[this.struct];
            const factor: number = double.includes(this.struct) ? 2 : 1;
          
            for (const caption of captions) {
                lyrics += caption + "\n";
                const total: number = lines[caption] * factor;
                for (let i: number = 1; i <= total; i++) {
                    lyrics += "...\n";
                    if (i % 4 === 0 && i !== total) lyrics += "\n";
                }
                lyrics += "\n";
            }
        } catch(e: unknown){
            console.log(`❌ beatLyrics.js => ${e instanceof Error ? e.message : e}`);
        }
        
        return lyrics;

    }
}

