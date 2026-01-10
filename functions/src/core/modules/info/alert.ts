
import { Context } from 'telegraf';
import { _group } from '../../../context/cache/access';
import { commands } from './commands';

////////////////////////////////////////////////////////////////

export class Alert {
    private ctx: Context;

    constructor(ctx: Context) {
        this.ctx = ctx;
    }

    public async handle() {

        try {

            const group: number = (this.ctx.callbackQuery ? this.ctx.callbackQuery.message?.chat.id : this.ctx.message?.chat.id) || 0;
            if(group !== _group) throw Error(`no group found in ctx of message or callbackquery => callbackquery ? => ${this.ctx.callbackQuery}`);

            const userName: string = (this.ctx.callbackQuery ? this.ctx.callbackQuery.from.username : this.ctx.message?.from.username) || '';
            const userId: number = (this.ctx.callbackQuery ? this.ctx.callbackQuery.from.id : this.ctx.message?.from.id) || 0;
            if(!userName || !userId) throw Error(`no username or userid found in ctx of message or callbackquery => callbackquery ? => ${this.ctx.callbackQuery}`);

            let cbdata: string = this.ctx?.callbackQuery && 'data' in this.ctx?.callbackQuery && this.ctx?.callbackQuery.data ? this.ctx?.callbackQuery.data : '';  
            if(!cbdata) throw Error(`no callbackdata in callback`);

            let alertName: string = "";
            if(cbdata.endsWith("_alert")){
                alertName = cbdata.replace(/_alert/g, "");
            }

            if(alertName.startsWith("/")){
                alertName = alertName.slice(1);
            };

            if(!alertName) throw Error(`callbackdata for alert is empty after cleansing`);
                            
            const alertKeys: string[] = Object.keys(commands) || [];
            if(!alertKeys || alertKeys.length === 0) throw Error(`no keys found in commands dict`);

            if(!alertKeys.includes(alertName)) throw Error(`callbackdata for alert is not contain a valid alertName`);

            const alertMsg: string = commands[alertName] || '';
            if(!alertMsg) throw Error(`alertMsg is empty or could not be fetched from commands dict`);

            this.ctx.answerCbQuery(alertMsg, {
                show_alert: true,
                cache_time: 0
            });

        } catch(e: unknown){
            console.log(`❌ alert.js => ${e instanceof Error ? e.message : e}`);

        }

    }

}