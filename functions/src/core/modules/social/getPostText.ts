import { marketingBucket } from '../../../context/cache/buckets';
import { GetRandomLink } from './getRandomLink';
import { GetRandomHashtags } from './getRandomHashtags';

////////////////////////////////////////////////////////////////

export class GetPostText {

    public async getPostText(): Promise<string>{

        const fallback: string = "placeholder";

        try {
            const jsonFileNames: string[] = await this.fetchJsonFileNames();
            if (!jsonFileNames.length) throw new Error('No JSON file names found');

            const randJsonFileName: string = jsonFileNames[Math.floor(Math.random() * jsonFileNames.length)];
            const randJsonArray: any = JSON.parse(await marketingBucket.file(randJsonFileName).download().then(data => data[0].toString()));

            if (!randJsonArray.length) throw new Error('No posts found in JSON');

            const postText: string = randJsonArray[Math.floor(Math.random() * randJsonArray.length)];

            const getrandomlink: GetRandomLink = new GetRandomLink();
            const link: string = await getrandomlink.getRandomLink();

            const getrandomhashtags: GetRandomHashtags = new GetRandomHashtags();
            const hashtags: string = getrandomhashtags.getRandomHashtags();

            const textParts: string[] = Math.random() >= 0.5
            ? [`${postText} ${hashtags}`, `${postText} ${link}`]
            : [`${postText} ${link}`, `${postText} ${hashtags}`];

            return textParts[Math.floor(Math.random() * textParts.length)];
          
        } catch (e: unknown) {
            console.log(`❌ getPostText.js => ${e instanceof Error ? e.message : e}`);
            return fallback;
        }

    }


    private async fetchJsonFileNames() {
        try {
            const [files] = await marketingBucket.getFiles({ prefix: 'posts/' });
            return files
                .map(file => file.name)
                .filter(name => name.endsWith('.json')) || [];
        } catch (e: unknown) {
            console.log(`❌ getPostText.js => fetchJsonFileNames() => ${e instanceof Error ? e.message : e}`);
            return [];
        }
    }

}
