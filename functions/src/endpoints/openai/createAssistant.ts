import { openai } from './openAi';
import { pause } from '../../utils/misc/pause';
import type { Assistant } from "openai/resources/beta/assistants";

////////////////////////////////////////////////////////////////

export class CreateAssistant {

    private instructions: string;
    private name: string;
    private model: string;
    private temperature: number;

    constructor(instructions: string = '', name: string = '', model: string, temperature: number) {
        this.instructions = instructions;
        this.name = name;
        this.model = model;
        this.temperature = temperature;
    }

    public async create(): Promise<string> {

        let retry: number = 5;
        let newAssistant: Assistant | undefined = undefined;
        let newAssistantId: string = "";

        try {
            while(!newAssistant && retry > 0 ){
                try {
                    newAssistant = await openai.beta.assistants.create({
                        instructions:   this.instructions,
                        name:           this.name,
                        model:          this.model,
                        temperature:    this.temperature
                    });
                    if(newAssistant && newAssistant.id){
                        newAssistantId = newAssistant.id
                        break;
                    } else { throw Error("Failed to create Assistant") }

                } catch (e: unknown){
                    retry--;
                    await pause(1);
                }
            }
        } catch(e: unknown){
            const allFailed: string = retry == 0 ? "all retries failed" : "";
            if (e instanceof Error) {
                console.error("❌ createAssistant.js error:", allFailed, e.message);
            } else {
                console.error("❌ createAssistant.js error:", allFailed, e);
            }
        }

        return newAssistantId;
        
    }

}
