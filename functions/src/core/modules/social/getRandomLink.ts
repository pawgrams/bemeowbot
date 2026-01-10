import { marketingBucket } from '../../../context/cache/buckets';

////////////////////////////////////////////////////////////////

// intentional repetion, to easily influence categorial probablities on random picks
// keys refer to the .json filenames in the 'links' folder.
let linksCategories: string[] = [
    "socials",
    "presslight",
    "socials",
    "albums",
    "videos",
    "presslight",
    "presslight",
    "presslight",
    "songs",
    "socials",
    "videos",
    "presslight",
    "socials",
];

////////////////////////////////////////////////////////////////

export class GetRandomLink {

    public async getRandomLink(): Promise<string>{
        const fallbackLink: string = `https://www.placeholder.com"`;
        try{
            const isDecember: boolean = new Date().getMonth() === 11;
            if (isDecember) {
                while (linksCategories.filter((category) => category === "xmas").length < 10) {
                linksCategories.push("xmas");
                }
            } else {
                linksCategories = linksCategories.filter((category) => category !== "xmas");
            }
        
            const randIndex: number = Math.floor(Math.random() * linksCategories.length);
            const linkFileName: string = `${linksCategories[randIndex]}.json`;
            const randJsonArray: any = JSON.parse(await marketingBucket.file(`links/${linkFileName}`).download().then(data => data[0].toString()));
            const link: string = randJsonArray[Math.floor(Math.random() * randJsonArray.length)];
            return link;

        }catch(e: unknown){
            console.log(`❌ getRandomLink.js => ${e instanceof Error ? e.message : e}`);
            return fallbackLink || '';
        }
    }
  
}