import { bot } from '../../../context/bot';
import { _group } from '../../../context/cache/access';
import type { ChatMember } from 'telegraf/types';

////////////////////////////////////////////////////////////////

export class IsGroupMember {

    private userId: number;

    constructor(userId: number) {
        this.userId = userId;
    }

    public async isGroupMember(): Promise<boolean> {
        try {
            const memberInfo: ChatMember = await bot.telegram.getChatMember(_group, this.userId);
            if (
                memberInfo.status === 'member' || 
                memberInfo.status === 'administrator' || 
                memberInfo.status === 'creator'
            ) {
                return true;
            } else {
                return false;
            }
        } catch (e: unknown) {
            console.log(`❌ ${__filename.replace(process.cwd(), 'db folder version of isGroupMember')} ${e instanceof Error ? e.message : e}`);
            return false;
        }
    }

}
