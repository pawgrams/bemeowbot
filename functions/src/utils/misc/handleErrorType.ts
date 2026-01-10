import { bot } from '../../context/bot';
import { _group } from '../../context/cache/access';
import { ecodes } from './ecodes';

export class HandleErrorType {

    private e: any;
    private userId: number;
    private userName: string;

    constructor(e: any = null, userId: number = 0, userName: string = '') {
        this.e = e;
        this.userId = userId;
        this.userName = userName;
    }

    public async handleErrorType(): Promise<void> {
        try {
            let addErrorMsg = 'Please try again';
            if(this.e && 'message' in this.e && this.e.message){
                const matchKey: string = Object.keys(ecodes).find(ecode => this.e.message.startsWith(ecode)) || "E-CODE_000";
                if(matchKey){
                    addErrorMsg = ecodes[matchKey];
                } else {
                    addErrorMsg = ecodes["E-CODE_000"];
                }
                this.sendUserError(addErrorMsg);
            }
        } catch(e: unknown){
            console.log("❌ handleErrorType.js", e instanceof Error ? e.message : e);
        }
    }

    private async sendUserError(addInfo: string = ''): Promise<void> {
        const userTag: string = this.userId ? `<a href="tg://user?id=${this.userId}">&#8203;</a>` : '';
        let invalidMessage: string = `Meowch ${this.userName ? '@' + this.userName : ''}... 😿 smth went wrong. ${addInfo} ${userTag}`;
        if(this.userId)invalidMessage += userTag;
        let msgOpt: any = {
            caption: invalidMessage, 
            parse_mode: 'HTML', 
        }
        bot.telegram.sendMessage(_group, invalidMessage, msgOpt);
    }

}

