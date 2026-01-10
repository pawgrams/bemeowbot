export function pause(seconds:number, print: boolean = false) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}