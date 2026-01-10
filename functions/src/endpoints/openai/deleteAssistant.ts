import { openai } from './openAi';
import { pause } from '../../utils/misc/pause';
import type { AssistantDeleted } from "openai/resources/beta/assistants";

////////////////////////////////////////////////////////////////

export class DeleteAssistant {

    private assistantId: string;

    constructor(assistantId: string = '',) {
        this.assistantId = assistantId;
    }

    public async delete(): Promise<boolean> {
        let retry: number = 10;
        try {
            while(retry > 0 ){
                try {
                    const response: AssistantDeleted = await openai.beta.assistants.del(this.assistantId);
                    if(response && response.id && response.deleted){
                        return true;
                    } else { throw Error("") }

                } catch (e: unknown){
                    retry--;
                    await pause(1);
                }
            }
        } catch (e: unknown) {
            const allFailed: string = retry == 0 ? "all retries failed" : "";
            if (e instanceof Error) {
                console.error("❌ deleteAssistant.js error:", allFailed, e.message);
            } else {
                console.error("❌ deleteAssistant.js unknown error:", allFailed, e);
            }
        }
        return false;
    }

}
