import { structures } from './structures';

export class GetStructure {

    private structureTag: string; 
    private structure: string; 

    constructor(structureTag: string) {
        this.structureTag = structureTag;
        this.structure = "";
    }

    public getStructure(): string {
        try {
            const structureTags = Object.keys(structures);
            if(structureTags && structureTags.length > 0 && !this.structureTag){
                const randStructTagIndex: number = Math.floor(Math.random() * structureTags.length);
                this.structureTag = structureTags[randStructTagIndex] ? structureTags[randStructTagIndex] : 'short';
            }

            if( structureTags.includes(this.structureTag) ) {
                const structureTemplates = structures[this.structureTag];
                if(structureTemplates && structureTemplates.length > 0){
                    const randindex: number = Math.floor(Math.random() * structureTemplates.length) || 0;
                    this.structure = structureTemplates[randindex] ? structureTemplates[randindex] : structures["short"][0];
                }
            }
        } catch (e: unknown) {
            console.log("❌ getStructure.js", e instanceof Error ? e.message : e);
        }
        return this.structure;
    }

}


