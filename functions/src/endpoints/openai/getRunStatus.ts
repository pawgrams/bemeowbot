
import { openai } from './openAi';
import type { Run, RunStatus } from "openai/resources/beta/threads/runs";

////////////////////////////////////////////////////////////////

export class GetRunStatus {

    threadId: string;
    runId: string;

    constructor(threadId: string, runId: string) {
        this.threadId = threadId;
        this.runId = runId;
    }

    public async getRunStatus(){
        try {
            const getRun: Run = await openai.beta.threads.runs.retrieve(this.threadId, this.runId);
            const runStatus: RunStatus = getRun.status;
            return runStatus;
        } catch(e: unknown){
            console.log("❌ getRunStatus.js => ", e instanceof Error ? e.message : e);
            return "undefined";
        }
    }

}