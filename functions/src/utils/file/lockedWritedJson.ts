import fs from 'fs';
import fsExt from 'fs-ext';

export const lockedWritedJson = async (filePath: string, newData: any) => {

    const fd: number = fs.openSync(filePath, 'r+');
    try {
        fsExt.flockSync(fd, 'ex');
        const fileContent: string  = fs.readFileSync(filePath, 'utf8');
        const jsonData: any = fileContent ? JSON.parse(fileContent) : [];
        jsonData.push(newData);
        fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), 'utf8');

    } catch (e: unknown) {
        console.log("❌ lockedWritedJson.js => ", e instanceof Error ? e.message : e);

    } finally {
        fsExt.flockSync(fd, 'un');
        fs.closeSync(fd);
    }
    
};
