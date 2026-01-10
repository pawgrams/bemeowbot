import { bot } from '../../context/bot';
import { Context } from 'telegraf';
import { MsgType } from '../../utils/types/customTypes';

export class TxtReplyOrMsg {

    private ctx: Context;
    private group: number;
    private replyMsg: string;
    private replyType: MsgType;
    private userId: number;

    constructor(ctx: Context, group: number, replyMsg: string, replyType: MsgType, userId: number) {
        this.ctx = ctx;
        this.group = group;
        this.replyMsg = replyMsg;
        this.replyType = replyType;
        this.userId = userId;
    }

    public async txtReplyOrMsg(): Promise<void> {
        try {
            let msgOpt: any = {};
            let reply: string = this.replyMsg;
            const messageId = this.ctx.message?.message_id;

            if (messageId) {
                msgOpt = { parse_mode: 'HTML', reply_to_message_id: messageId };
                reply += `<a href="tg://user?id=${this.userId}">&#8203;</a>`;
            } else if (this.userId) {
                msgOpt = { parse_mode: 'HTML' };
                reply += `<a href="tg://user?id=${this.userId}">&#8203;</a>`;
            } else {
                msgOpt = { parse_mode: 'HTML' };
            }

            await this.sendTextMessage(this.group, reply, msgOpt);

        } catch (e1: unknown) {
            try {
                await this.sendFallbackMessage();
            } catch (e2: unknown) {
                console.log("❌ TxtReplyOrMsg fallback failed:", e2 instanceof Error ? e2.message : e2);
            }
        }

    }

    private async sendTextMessage(group: number, replyMsg: string, opt?: any): Promise<void> {
        await bot.telegram.sendMessage(group, replyMsg, opt);
    }

    private async sendFallbackMessage(): Promise<void> {
        await bot.telegram.sendMessage(
            this.group,
            this.replyMsg + `[\u200C](tg://user?id=${this.userId})`,
            { parse_mode: 'MarkdownV2' }
        );
    }

}
