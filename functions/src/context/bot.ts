import { Telegraf } from 'telegraf';
import { _botfather } from './cache/access';
const bot: Telegraf = new Telegraf(_botfather);
export { bot };


