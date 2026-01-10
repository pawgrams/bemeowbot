const fs = require('fs/promises');

export const readJson = async (filePath: string) => {
    try {
        const data: any = await fs.readFile(filePath, 'utf-8');
        const json: any = JSON.parse(data);
        return json || null;
    } catch (e: unknown) {
        console.log("❌ readJson.js => ", e instanceof Error ? e.message : e);
        return null;
    }
}