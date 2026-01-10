const fs = require('fs/promises');

export const writeJson = async (filePath: string, data: object) => {
    try {
        const json: string  = JSON.stringify(data, null, 4);
        await fs.writeFile(filePath, json, 'utf-8');
    } catch (e: unknown) {
        console.log("❌ writeJson.js => ", e instanceof Error ? e.message : e);
    }
};