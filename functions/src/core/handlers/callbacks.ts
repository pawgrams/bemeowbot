import { dev1, dev2 } from '../../context/cache/devs';
import { Context } from 'telegraf';
import { _group } from '../../context/cache/access';
import { groupCallbackSec } from '../../ratelimits/group/callback/sec';
import { groupCallbackMin } from '../../ratelimits/group/callback/min';
import { userCallbackSec } from '../../ratelimits/user/callback/sec';
import { userCallbackMin } from '../../ratelimits/user/callback/min';
import { songTemplates } from '../modules/studio/music/songTemplates';
import { genres } from '../modules/studio/music/genres';
import { Router } from './router';

////////////////////////////////////////////////////////////////

export class Callbacks {
    private ctx: Context;

    constructor(ctx: Context) {
        this.ctx = ctx;
    }

    public async handle(): Promise<void> {

        try {

            if(!this.ctx) throw Error("no ctx");

            const cb: any = this.ctx?.callbackQuery || null; 
            let cbdata: string = cb && 'data' in cb && cb.data ? cb.data : ''; 

            if(cbdata && !cbdata.endsWith("_alert")){ 
                await this.ctx.answerCbQuery(); 
            }

            const userId: number = 'from' in cb && cb.from && 'id' in cb.from && cb.from.id ? cb.from.id : 0; 

            if( (
                !cb || !cbdata || 'is_topic_message' in cb?.message || !userId ||
                groupCallbackSec.RL(_group) ||
                userCallbackSec.RL(userId)  ||
                groupCallbackMin.RL(_group) ||
                userCallbackMin.RL(userId)
                ) && userId !== dev1.id && userId !== dev2.id
            ){
                throw Error(`misc error or rate limited => group or user ${userId} ${cb?.from?.username} => callback`);
            }

            cbdata = 
            cbdata.endsWith('_alert') ? 'alert' : 
            cbdata.startsWith('backto_') ? cbdata.slice(7) : 
            cbdata.startsWith('lang_') ? 'lang' : 
            (cbdata.startsWith('/song') || songTemplates[cbdata.slice(1).trim()] || genres[cbdata.slice(1).trim()]) ? 'song' : 
            cbdata;
          
            new Router(this.ctx, cbdata).route(); 

        } catch (e: unknown) {
            console.log("❌ callbacks.js", e instanceof Error ? e.message : e);
        }
        
    }

}

