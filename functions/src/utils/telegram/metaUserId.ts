export const metaUserId = (userId: number): string => {
    const metadata: string = String(userId);
    const zeroWidthSpace: string = "\u200b"; 
    return `${metadata}${zeroWidthSpace}<a href="tg://user?id=${userId}">&#8203;</a>`;
}

export const metaHasUserId = (message: string): string => {
    return message.split("\u200b")[0] || ''
}