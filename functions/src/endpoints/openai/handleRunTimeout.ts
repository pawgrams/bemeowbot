import { openai } from './openAi';
import { pause } from '../../utils/misc/pause';
import { CancelRun } from './cancelRun';
import { isRunActive } from './isRunActive';
import type { Run } from "openai/resources/beta/threads/runs";

////////////////////////////////////////////////////////////////

export class GetRunStatus {

    runObj: any;
    threadId: string;
    pauseInSecs: number;

    constructor(runObj: any, threadId: string, pauseInSecs: number = 0.5) {
        this.runObj = runObj;
        this.threadId = threadId;
        this.pauseInSecs = pauseInSecs;
    }

    public async handleRunTimeout(){
        try{
            if(this.runObj && this.runObj.id){
                await pause(this.pauseInSecs);
                const run: Run = await openai.beta.threads.runs.retrieve(this.threadId, this.runObj.id);
                if(run && isRunActive(run.status)){
                    try {
                        const crun: CancelRun = new CancelRun(this.runObj.id, this.threadId, 0.5);
                        await crun.cancelRun();
                    } catch(e: unknown){}
                    return false;
                } else {return true;}
            } else {return false}
        } catch(e: unknown){
            console.log("❌ handleRunTimeout.js => ", e instanceof Error ? e.message : e);
            return false;
        }
    }

}