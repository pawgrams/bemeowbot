export class GetFallbackAssistantReply {
    private _userMsg: string;
    private _userName: string;

    constructor(_userMsg: string = "", _userName: string = "") {
        this._userMsg = _userMsg;
        this._userName = _userName;
    }

    public getFallbackAssistantReply(): string  {

        const userName: string = this._userName ? ` @${this._userName}` : "";
        const userMsg: string = this._userMsg || "";

        try{

            const generalReplies: string[] = [
                `Greeting ${userName}, placeholder fallbackmessage.`,
                `Greeting ${userName}, placeholder fallbackmessage.`,
                `Greeting ${userName}, placeholder fallbackmessage.`,
                `Greeting ${userName}, placeholder fallbackmessage.`,
                `Greeting ${userName}, placeholder fallbackmessage.`,
                // ...
            ];
            const randomIndex: number = Math.floor(Math.random() * generalReplies.length);
            return generalReplies[randomIndex];

        } catch(e: unknown){
            console.log("❌ getFallbackAssistantReply.js", e instanceof Error ? e.message : e);
            return '';
        }

    }

}