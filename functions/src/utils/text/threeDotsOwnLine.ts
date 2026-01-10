export class ThreeDotsOwnLine {

    private text: string;

    constructor(text: string) {
        this.text = text;
    }

    public async threeDotsOwnLine(): Promise<string> {
        try {
            let lines: string[] = this.text.split('\n');
            let result: string[] = [];
            for (let line of lines) {
                while (line.includes('...')) {
                    const index: number = line.indexOf('...');
                    const before: string = line.slice(0, index).trim();
                    const after: string = line.slice(index + 3).trim();
                    if (before.length > 0) result.push(before);
                    result.push('...');
                    line = after;
                }
                result.push(line);
            }
            return result.join('\n');

        } catch (e: unknown) {
            console.log("❌ utils => text => threeDotsOwnLine.js", e instanceof Error ? e.message : e);
            return this.text;
        }

    }

}
