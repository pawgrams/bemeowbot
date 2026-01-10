import { isRunActive } from './isRunActive';
import { openai } from './openAi';
import { pause } from '../../utils/misc/pause';
import type { Run } from "openai/resources/beta/threads";

////////////////////////////////////////////////////////////////

export class CancelRun {

    runId: any;
    threadId: string;
    pauseInSecs: number;
    maxRetries: number;

    constructor(runId: any, threadId: string, pauseInSecs: number = 20, maxRetries: number = 5) {
        this.runId = runId;
        this.threadId = threadId;
        this.pauseInSecs = pauseInSecs;
        this.maxRetries = maxRetries;
    }

    public async cancelRun() {
        try{
            let isRunCancelled: boolean = false
            while(!isRunCancelled && this.maxRetries > 0){
                try{
                    await pause(this.pauseInSecs);
                    const updatedRun: Run  = await openai.beta.threads.runs.cancel(this.threadId, this.runId);
                    if(updatedRun && !isRunActive(updatedRun.status)){
                        break;
                    } 
                } catch(e: unknown){
                    this.maxRetries--;
                }
            }
        } catch(e: unknown){
            const allFailed: string = this.maxRetries == 0 ? "all retries failed" : "";
            if (e instanceof Error) {
                console.error("❌ createAssistant.js error:", allFailed, e.message);
            } else {
                console.error("❌ createAssistant.js error:", allFailed, e);
            }
        }
    }

}