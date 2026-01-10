import * as functions from 'firebase-functions';
import { SunoUpdate } from './core/modules/studio/music/handleSunoUpdate';
import type { Request, Response } from 'express'
import type { IncomingHttpHeaders } from 'http'

//////////////////////////////////////////////////////////////// 

export class SunoRequest {

    res: Response;
    req: Request;

    constructor(res: Response, req: Request) {
        this.res = res;
        this.req = req;
    }

    public async validateSunoRequest(): Promise <boolean> {

        try {

            const headers: IncomingHttpHeaders = this.req.headers;
            if(!headers) throw Error('could not retrieve header on receiving suno request');

            const body: any = this.req.body;
            if(!body) throw Error('could not retriev body on receiving suno request');

            if(body && 'success' in body && body.success && 'data' in body && body.data && body.data.length > 0 && body.data[0] && body.data[0].style){
                console.log("STYLE", body.data[0].style)
            }

            if(body && 'success' in body && body.success && 'data' in body && body.data && body.data.length > 1 && body.data[1] && body.data[1].style){
                console.log("STYLE", body.data[1].style)
            }

            if(body && 'success' in body && body.success && 'data' in body && body.data && body.data.length > 0 && body.data[0] && body.data[0].negative){
                console.log("NEGATIVE", body.data[0].negative)
            }

            if(body && 'success' in body && body.success && 'data' in body && body.data && body.data.length > 1 && body.data[1] && body.data[1].negative){
                console.log("NEGATIVE", body.data[1].negative)
            }

            new SunoUpdate(body).handleSunoUpdate(); 
            return true;

        } catch(e: unknown) {
            console.log("❌ sunoWebhook.js => validateSunoRequest() => ", e instanceof Error ? e.message : e);
            return false;
                
        }
    }

}

////////////////////////////////////////////////////////////////

export const sunoWebhook = functions.https.onRequest(async (req: Request, res: Response) => {
    try{
        res.status(200).send('OK');
        new SunoRequest(res, req).validateSunoRequest();
    } catch(e: unknown) {
        console.log("❌ sunoWebhook.js", e instanceof Error ? e.message : e);
    }
});
