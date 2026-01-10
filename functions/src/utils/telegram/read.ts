import { Context } from 'telegraf';
import { Message } from '@telegraf/types';

const isTxtMsg = (message: Message): message is Message.TextMessage => {
    return 'text' in message;
};

export const read = async (context: Context) => {
    let msg: string = '';
    if (context && context.message && isTxtMsg(context.message)) {
        try{
            msg = context.message.text;
            msg = msg.split(' ').slice(1).join(' ');
        }catch(e: unknown){
            console.log("❌ read.js => ", e instanceof Error ? e.message : e);
        }
    }
    return msg || '';
};
