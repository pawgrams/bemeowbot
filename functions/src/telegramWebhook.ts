import * as functions from 'firebase-functions';
import type { Request, Response } from 'express'
import ipRangeCheck from 'ip-range-check';
import { bot } from './context/bot';
import { GetPendingUpdateCount } from './context/getPendingUpdateCount';
import { rateLimit, RateLimitRequestHandler } from 'express-rate-limit';
import { recentUsers } from './context/recentUsers';
import { _group, _chat, _tgauth, _botfather, _allowedIPs } from './context/cache/access';
import type { IncomingHttpHeaders } from 'http'
import type { User } from 'telegraf/types';

////////////////////////////////////////////////////////////////

const pendingThreshold: number = 25;

const rateLimitPerSecond: RateLimitRequestHandler = rateLimit({
    windowMs: 1000,
    max: 5,
    keyGenerator: (req: Request) => req.ip || 'unknown',
    message: 'Access Denied',
});
const rateLimitPerMinute: RateLimitRequestHandler = rateLimit({
    windowMs: 1000 * 60,
    max: 60,
    keyGenerator: (req: Request) => req.ip || 'unknown',
    message: 'Access Denied',
});
const rateLimitPerHour: RateLimitRequestHandler = rateLimit({
    windowMs: 1000 * 60 * 60,
    max: 600,
    keyGenerator: (req: Request) => req.ip || 'unknown',
    message: 'Access Denied',
});
const rateLimitPerDay: RateLimitRequestHandler = rateLimit({
    windowMs: 1000 * 60 * 60 * 24,
    max: 3000,
    keyGenerator: (req: Request) => req.ip || 'unknown',
    message: 'Access Denied',
});

////////////////////////////////////////////////////////////////

export class TelegramRequest {

    res: Response;
    req: Request;

    constructor(res: Response, req: Request) {
        this.res = res;
        this.req = req;
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    public async validateRequest(): Promise <boolean> {

        try{

            if (!this.req || !this.res) throw Error(`Code 203`);
            const body: any = this.req.body;
            if(!body) throw Error('Code 113');

            const message: any = body.callback_query && 'message' in  body.callback_query 
                    ? body.callback_query.message 
                    : body.message 
                            ? 'message' in body && body.message 
                            : 'edited_message' in body && body.edited_message 
                                    ? body.edited_message 
                                    : null;
            if(!message) throw Error('Code 314');
    
            const all: any = await Promise.all([
                this.clearPendingOverload(),
                this.groupCheck(body, message),
                this.checkIpsRange(),
                this.headersCheck(),
                this.checkUrlQueryParams(this.req.url),
                this.checkBotfather(),
                this.applyMiddleware(),
                this.checkDelay(body),
                this.fromCheck(body)
            ]);
            
            if(all.includes(true)){
                for(const a in all){if(all[a]){console.log(`Case of Error => 00${a}`);}}
                throw Error(`Code 121`);
            }

            bot.handleUpdate(body); 
            return true;

        } catch(e: unknown) {
            return false;
        }

    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    private async fromCheck(body: any) {
        try {
            const from: User | undefined = (body.callback_query && 'from' in body.callback_query ? body.callback_query.from : body.message?.from) || undefined; 
            if(!from || !from.id || !from.username || from.is_bot){
                return true;
            } else {
                recentUsers.addUserToQueue(from.id);
                return false; 
            }
        } catch(e: unknown) {
            return true; 
        }
    };

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    private async headersCheck() {
        try {
            const headers: IncomingHttpHeaders = this.req.headers;
            return headers['x-forwarded-proto'] !== 'https' || headers['content-type'] !== 'application/json';
        } catch (e: unknown) {
            return true; 
        }
    };

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    private async groupCheck(body: any, message: any) {
        try {
            return body.callback_query && message.chat?.id !== _group;
        } catch (e: unknown) {
            return true; 
        }
    };

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    private async clearPendingOverload() {
        try {
            const pencnt: GetPendingUpdateCount = new GetPendingUpdateCount();
            const pendingCount: number = await pencnt.getPendingUpdateCount();
            if(pendingCount && Number(pendingCount) > pendingThreshold){
                return true;
            } else {
                return false;
            }
        } catch (e: unknown) {
            return true; 
        }
    };

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    
    private async applyMiddleware() {
        try {
            await Promise.all([
                new Promise((resolve, reject) => rateLimitPerSecond(this.req, this.res, (err: any) => (err ? reject('Code 121') : resolve(null)))),
                new Promise((resolve, reject) => rateLimitPerMinute(this.req, this.res, (err: any) => (err ? reject('Code 403') : resolve(null)))),
                new Promise((resolve, reject) => rateLimitPerHour(this.req, this.res, (err: any) => (err ? reject('Code 104') : resolve(null)))),
                new Promise((resolve, reject) => rateLimitPerDay(this.req, this.res, (err: any) => (err ? reject('Code 404') : resolve(null)))),
            ]);
            return false;
        } catch (e: unknown) {
            return true;
        }
    };

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    private async checkIpsRange(): Promise<boolean> {
        const forwardedForHeader: string | string[] | undefined = this.req.headers['x-forwarded-for'];
        const incomingIP: string = Array.isArray(forwardedForHeader)
            ? forwardedForHeader[0]
            : forwardedForHeader?.split(',')[0].trim() || this.req.socket.remoteAddress || '';
        if (!_allowedIPs.some((range) => ipRangeCheck(incomingIP, range))) {
            return true;
        } else {
            return false;
        }
    };
    
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    private async checkUrlQueryParams(url: string): Promise<boolean> {
        const urlauths: string[] = url.split("authtoken=") || [];
        if(urlauths.length === 2){
            const urlauth: string = urlauths[1] || '';
            if (_tgauth && _tgauth !== "" && urlauth && urlauth !== "" 
                && urlauth === _tgauth && url.endsWith(_tgauth)
            ) {
                return false;
            }
        }
        return true;
    };

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    private async checkBotfather(): Promise<boolean> {
        const slugpaths: string[] = this.req.path.split('authtoken') || [];
        if(slugpaths.length > 0){
            const slugpath: string = slugpaths[0] || '';
            if(slugpath === `/bot${_botfather}` &&this.req.url.startsWith(`/bot${_botfather}`)){
                return false;
            }
        }
        return true;
    };

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    private async checkDelay(body: any): Promise<boolean> {
        if(body.callback_query){
            return false;
        }
        const maxDelayMs: number = 180 * 1000;
        const now: number = Math.floor(Date.now());
        const date: number | undefined = Number(body?.message?.date * 1000) || undefined;
        if(date && typeof(date) === 'number'){
            if (date < now && now - date < maxDelayMs) {
                return false;
            }
        }
        return true;
    };

}

////////////////////////////////////////////////////////////////

export const telegramWebhook = functions.https.onRequest(async (req: Request, res: Response) => {  
    try {
        res.status(200).send('OK');
        new TelegramRequest(res, req).validateRequest();
    } catch(e: unknown){
        console.log("❌ telegramWebhook.js", e instanceof Error ? e.message : e);
    }
});

