export const isValidString = async (str: string, maxLength: number): Promise<boolean> => {
    const isAllowed: boolean = /^[a-zA-Z0-9_.\- ]*$/.test(str);
    const isWithinLength: boolean = str.length <= maxLength;
    return isAllowed && isWithinLength || false;
};
  