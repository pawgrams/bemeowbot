export const hastags: string[] = [
    "placeholder",
    "placeholder",
    "placeholder",
    // ...
];

////////////////////////////////////////////////////////////////

export class GetRandomHashtags {
    public getRandomHashtags(): string {
        const fallbackHashtags: string = `placeholder`;
        try{
            const numHashTags: number = Math.floor(Math.random() * 3) + 2 || 3;
            const selected: string[] = hastags
                .sort(() => Math.random() - 0.5)
                .slice(0, numHashTags)
                .map((str) => `#${str}`);
            const hashtags: string = selected.join(' ') || fallbackHashtags;
            return hashtags;
        }catch(e: unknown){
            console.log(`❌ getRandomHashtags.js => ${e instanceof Error ? e.message : e}`);
            return fallbackHashtags;
        }
    }
}
  