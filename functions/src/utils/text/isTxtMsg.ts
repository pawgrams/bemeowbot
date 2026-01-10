import { Message } from '@telegraf/types';
export const isTxtMsg = (message: Message): message is Message.TextMessage => {
    return 'text' in message;
};