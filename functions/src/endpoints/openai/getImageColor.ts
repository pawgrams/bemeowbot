import { client } from "./openAi"
import { ChatCompletion } from "openai/resources/chat/completions"

////////////////////////////////////////////////////////////////

const extractHexColor = async (inputString: string) => {
    try {
        const hexColorRegex: RegExp = /#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})\b/g;
        const matches: RegExpMatchArray | null = inputString.match(hexColorRegex);
        return matches || [];
    } catch (e: unknown){
        console.log("❌ getImageColor.js => extractHexColor() => ", e);
        return [];
    }
};

////////////////////////////////////////////////////////////////

export class GetImageColor {

    imageUrl: string;

    constructor(imageUrl: string) {
        this.imageUrl = imageUrl;
    }

    public async getImageColor(): Promise<string> {
        try{
            const response: ChatCompletion = await client.chat.completions.create({
              model: "gpt-4o-mini",
              messages: [
                {
                  role: "user",
                  content: 
                  [
                    { type: "text", text: "Return the color code of that color in the image which is the most present and saturated. In other words 'The color that brings life to the image'. If there is no color or almost no color then pick #FFFFFF. Ensure to only return the color code without any comments." },
                    { type: "image_url", image_url: {"url": this.imageUrl,}}
                  ],
                },
              ],
            });
            const result: string = response.choices[0].message?.content || "#FFFFFF";
            const hexColors: string[] = await extractHexColor(result);
        
            if(hexColors.length > 0){
                return hexColors[0];
            } else {
                return "#FFFFFF"
            }

        } catch (e: unknown) {
            console.error("❌ getImageColor.js => getImageColor() =>", e instanceof Error ? e.message : e);
            return "#FFFFFF";
        }

    }
}