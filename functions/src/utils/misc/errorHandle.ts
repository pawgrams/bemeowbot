import { AxiosError } from "axios";
import OpenAI from "openai";
import { writeJson } from '../file/writeJson';
import { readJson } from '../file/readJson';

const maxErrorLength: number = 200;

const logError = async (errorMsg: string) => {
    try{
        const errorLogPath: string = `./src/context/stored/errorLog.json`;
        const errorLog: any = await readJson(errorLogPath) || {};
        const timestamp: number = Math.floor(Date.now() / 1000);
        errorLog[timestamp] = errorMsg;
        await writeJson(errorLogPath, errorLog);
    } catch(e: unknown){
        console.log("❌ errorHandle.js => logError() => ", e instanceof Error ? e.message : e);
    }
}

const sliceError = (e: any) => {
    try{
        const parsedError: string = JSON.stringify(e, Object.getOwnPropertyNames(e));
        const slicedError: string = parsedError.slice(0, maxErrorLength);
        return slicedError;
    } catch(_e: unknown) {
        return `❌ ERROR: (sliceError) => ${_e instanceof Error ? _e.message : _e}`;
    }
}

export const errorHandle = async (e: any) => {
    let errorMsg: string = "";
    try{
        if (e instanceof OpenAI.OpenAIError) {
            errorMsg = e?.message || sliceError(e);  
        } else if (e instanceof AxiosError) {
            errorMsg = e.response?.data?.error?.message || e.message || sliceError(e);
        } else if (e instanceof Error) {
            errorMsg = e.message || sliceError(e)
        } else {
            errorMsg = sliceError(e)
        }
        await logError(`❌ ERROR: ${errorMsg}`);
    } catch(_e: unknown){
        await logError(`❌ ERROR: ${errorMsg} => (errorHandle) : ${_e instanceof Error ? _e.message : _e}`);

    }
}

