import { unlinkSync } from 'fs';

export function deleteFile(filePath: string): void {
    try {
        unlinkSync(filePath);
    } catch (e: unknown) {
        console.log("❌ deleteFile.js => ", e instanceof Error ? e.message : e);
    }
}