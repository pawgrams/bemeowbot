import { GetStructure } from './getStructure';

export class ApplyStructure {

    private lyrics: string;
    private structureTag: string;
    
    constructor(lyrics: string, structureTag: string) {
        this.lyrics = lyrics;
        this.structureTag = structureTag;
    }

    public async apply(): Promise<string>  {
        let structure: string = ''
        try {
            structure = new GetStructure(this.structureTag).getStructure()
        } catch(e: unknown){
            console.log("❌ lyrics/structure/applyStructure.js", e instanceof Error ? e.message : e);
        }
        return this.lyrics;
    }

}