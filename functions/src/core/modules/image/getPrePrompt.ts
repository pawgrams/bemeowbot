export class GetPrePrompt {
    private topic: string;
    private userPrompt: string;

    constructor(topic: string = '', userPrompt: string = '') {
        this.topic = topic;
        this.userPrompt = userPrompt;
    }

    public async getPrePrompt(): Promise<string> {

        let preprompt: string = '';

        try{

            if(!this.topic) throw Error('no topic or userprompt found');
            if(typeof(this.topic) !== 'string' || typeof(this.userPrompt) !== 'string'  ) throw Error('topic or userprompt are not of type string');

            let caption = 'PLACEHOLDER';
            if(this.topic === "image"){
                if(this.userPrompt.toLowerCase().includes("placeholder")){
                    caption = "PLACEHOLDER";
                } else if(this.userPrompt.toLowerCase().includes("$placeholder")){
                    caption = "$PLACEHOLDER";
                } 
            }

            if(this.userPrompt){
                preprompt = `Cartoon Cat. The Cat has Fluffy White Fur, Orange-Yelllow Eyes and Golden Jewelry on Forehead. The Cat looks Beautiful, Pretty, Happy, Lovely, Friendly, Fluffy, Confident, Healthy, Smiling. In the Background there are Elements Music Notes and Green Profitable Trading Charts. The Image has a high color constrast and high color saturation: The Dominant Color Scheme is very import: [yellow: "#FFE419", turqoise: "#0B998B"]. Text \"${caption}\. The Cat is in the following major scenario: "${this.userPrompt}."`
            } else {
                preprompt = `Love, Vivid, Emotional, Confident, Intelligent, Focussed, Characterful, Healthy Shaped, Friendliest, loveliest, Fluffy Cartoon Cat, Best friend, Happy, Loving Friendly, Vivid Human Eyes. Happy Cheerful Smiling Mouth. White Fur Meow Cuddle party fun comic trusting eyes cartoon cute lovely Cat with cute yellow and slightly orange eyes, and golden juwelry on forehead, way more maximum friendly and beloving cuteness, friendly cute impression, Music Notes, Sound, Music Label, Crypto Currency, Defi, Trending Trading Charts Up, Gains, Blockchain, Music Instruments, Music Festival, Party, Celebrate, Best Time of Life. Bright happy background colors and very high constrast with very high color saturation: IMPORTANT COLOR SCHEMA: [yellow: "#FFE419", turqoise: "#0B998B"]. Text \"${caption}\.}`
            }

            if(!preprompt) throw Error('could not fetch preprompt');
            const finalPrompt = preprompt.replace(/\s*\n\s*/g, ' ').trim();
            return finalPrompt;

        } catch(e: unknown) {
            console.log(`❌ getPrePrompt.js => ${e}`);
            return '';
        }

    }

}