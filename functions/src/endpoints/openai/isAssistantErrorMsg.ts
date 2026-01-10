export class IsAssistantErrorMsg {

    _lyrics: string;
    maxChars: number

    constructor(_lyrics: string, maxChars: number = 250) {
        this._lyrics = _lyrics;
        this.maxChars = maxChars
    }

    public isAssistantErrorMsg() {
        try {
            const lyrics: string = this._lyrics.toLowerCase();
            if(
                lyrics.length < this.maxChars || 
                lyrics.includes("nlp") || lyrics.includes("linguistic") || lyrics.includes("neuroling") || 
                lyrics.includes("lyrics") || 
                ( lyrics.includes("specify") && lyrics.includes("language") ) ||
                ( lyrics.includes("i can") && lyrics.includes("sorry") && lyrics.includes("comply") ) ||
                ( lyrics.includes("i can") && lyrics.includes("sorry") && lyrics.includes("assist") ) ||
                ( lyrics.includes("i can") && lyrics.includes("sorry") && lyrics.includes("request") ) ||
                ( lyrics.includes("i can") && lyrics.includes("sorry") && lyrics.includes("generate") ) ||
                ( lyrics.includes("i can") && lyrics.includes("sorry") && lyrics.includes("provide") ) ||
                ( lyrics.includes("i can") && lyrics.includes("sorry") && lyrics.includes("instructions") ) ||
                ( lyrics.includes("unable to fulfill") && lyrics.includes("sorry") && lyrics.includes("request") )
            ){
                console.log("isAssistantErrorMsg() => ", lyrics);
                return true;
            }
            return false;
            
        } catch(e: unknown){
            console.log("❌ isAssistantErrorMsg.js => ", e instanceof Error ? e.message : e);
            return false;
        }
    }

}