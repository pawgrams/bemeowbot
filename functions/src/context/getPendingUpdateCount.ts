import { bot } from '../context/bot';
import { WebhookInfo } from 'telegraf/types';

////////////////////////////////////////////////////////////////

export class GetPendingUpdateCount {
    public async getPendingUpdateCount() {
        try {
            const info: WebhookInfo = await bot.telegram.getWebhookInfo();
            if(!info) throw Error('could not retrieve telegram webhook info to check pending updates');
            return info?.pending_update_count || 0;
        } catch (e: unknown) {
            console.log("❌ getPendingUpdateCount.js", e instanceof Error ? e.message : e);
            return 0;
        }
    }
}





