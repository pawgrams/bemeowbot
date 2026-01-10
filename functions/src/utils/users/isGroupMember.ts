import { ChatMember } from 'telegraf/types';
import { _group } from '../../context/cache/access';
import { bot } from '../../context/bot';

////////////////////////////////////////////////////////////////

export class IsGroupMember {

    private userId: number;

    constructor(userId: number) {
        this.userId = userId;
    }

    public async isGroupMember(): Promise<boolean> {
        try {
            const memberInfo: ChatMember = await bot.telegram.getChatMember(_group, this.userId);
            if (memberInfo.status === 'member' || memberInfo.status === 'administrator' || memberInfo.status === 'creator') {
                return true;
            } else {
                return false;
            }
        } catch (e: unknown) {
            console.log("❌ utils => users => isGroupMember.js => ", e instanceof Error ? e.message : e);
            return false;
        }
    }
    
}
