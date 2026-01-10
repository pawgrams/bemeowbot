import { openai } from './openAi';
import { isRunActive } from './isRunActive';
import type { Run } from "openai/resources/beta/threads/runs";

////////////////////////////////////////////////////////////////

export class IsAnyRunActive {

    threadId: string;

    constructor(threadId: string) {
        this.threadId = threadId;
    }

    public async isAnyRunActive(): Promise<boolean> {
        try {
            const { data: runs }: { data: Run[] } = await openai.beta.threads.runs.list(this.threadId);
            if (!runs || runs.length === 0) {
                return false;
            }
            const activeRuns: Run[] = runs.filter(run => isRunActive(run.status));
            if (activeRuns.length > 0) {
                return true;
            }
            return false;
        } catch (e: unknown) {
            console.log("❌ isAnyRunActive.js => ", e instanceof Error ? e.message : e);
            return true;
        }
    }

}
