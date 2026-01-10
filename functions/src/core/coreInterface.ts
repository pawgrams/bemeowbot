import { Context } from 'telegraf';
import { Messages } from './handlers/messages';
import { Callbacks } from './handlers/callbacks';
import { bot } from '../context/bot';

////////////////////////////////////////////////////////////////

export const registerBotHandlers = (() => {
    try {
        bot.on('callback_query', async (ctx: Context) => {
            new Callbacks(ctx).handle();
        });
        bot.on('message', async (ctx: Context) => {
            new Messages(ctx).handle();
        });
    } catch(e: unknown){
        console.log("❌ coreInterface.js => ", e instanceof Error ? e.message : e);
    }
    return true;
})();