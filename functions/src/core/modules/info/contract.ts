
import { bot } from '../../../context/bot';
import { Context } from 'telegraf';
import { _group } from '../../../context/cache/access';
import { groupContractSec } from '../../../ratelimits/group/contract/sec';
import { groupContractMin } from '../../../ratelimits/group/contract/min';
import { groupContractHour } from '../../../ratelimits/group/contract/hour';
import { userContractSec } from '../../../ratelimits/user/contract/sec';
import { userContractMin } from '../../../ratelimits/user/contract/min';
import { userContractHour } from '../../../ratelimits/user/contract/hour';

////////////////////////////////////////////////////////////////

export class Contract {
    private ctx: Context;

    constructor(ctx: Context) {
        this.ctx = ctx;
    }

    public async handle() {

        try {

            const ca: string = "placeholder";

            // get group for callback and message case
            const group: number = (this.ctx.callbackQuery ? this.ctx.callbackQuery.message?.chat.id : this.ctx.message?.chat.id) || 0;
            if(group !== _group) throw Error(`no group found in ctx of message or callbackquery => callbackquery ? => ${this.ctx.callbackQuery}`);

            // get userdata for callback and message case
            const userName: string = (this.ctx.callbackQuery ? this.ctx.callbackQuery.from.username : this.ctx.message?.from.username) || '';
            const userId: number = (this.ctx.callbackQuery ? this.ctx.callbackQuery.from.id : this.ctx.message?.from.id) || 0;
            if(!userName || !userId){
                throw Error(`no username or userid found in ctx of message or callbackquery => callbackquery ? => ${this.ctx.callbackQuery}`);
            }

            if( groupContractSec.RL(_group)     || 
                userContractSec.RL(userId)      || 
                groupContractMin.RL(_group)     || 
                userContractMin.RL(userId)      || 
                groupContractHour.RL(_group)    ||  
                userContractHour.RL(userId)
            ){
                throw Error(`🛡 group or user user rate limit hit ${userId} ${userName}`);
            }

            const reply: string = `@${userName} <b>CA: </b><a href="https://solscan.io/token/${ca}" >${ca}</a><a href="tg://user?id=${userId}">&#8203;</a>`
            bot.telegram.sendMessage(group, reply, { parse_mode: 'HTML' });

        } catch(e: unknown) {
            console.log(`❌ contract.js => ${e instanceof Error ? e.message : e}`);
        }

    }

}