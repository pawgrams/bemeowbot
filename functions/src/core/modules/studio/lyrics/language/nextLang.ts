import { Context } from 'telegraf';
import { bot } from '../../../../../context/bot';
import { _group } from '../../../../../context/cache/access';
import { langMap } from './langMap';
import { dbBucket } from '../../../../../context/cache/buckets';

////////////////////////////////////////////////////////////////

export class NextLang {
    ctx: Context | null = null;

    constructor(ctx: Context | null = null) {
        this.ctx = ctx;
    }

    public formatLang(_lang: string = '') {
        try{
            if(!_lang) throw Error("no _lang");
            _lang = _lang.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('-');
        } catch(e: unknown){
            console.log(`❌ nextLang.js => formatLang() => ${e instanceof Error ? e.message : e}`);
        }
        return _lang;
    }

    // - - - - - - - - - - - - - - - - - - - 

    public async sendToChat(userid: number = 0, userName: string = '', lang: string = '') {
        try {
            if(!userid || !userName || !lang) throw Error("no userid or no userName or no lang");
            let langFlag: string = ''
            if(langMap && langMap[lang] && langMap[lang].length >= 1 && langMap[lang][0]){
                langFlag = langMap[lang][0] ? langMap[lang][0] + " " : '';
            }
            lang = this.formatLang(lang);
            const msg: string = `ℹ️ @${userName ? userName : userid || ''}: Next Creation Language:\n${langFlag} <b>${lang}</b> <a href="tg://user?id=${userid}">&#8203;</a>`;
            bot.telegram.sendMessage(
                _group,
                msg,
                {parse_mode: 'HTML'}
            ); 

        } catch (e: unknown){
            console.log(`❌ nextLang.js => sendToChat() => ${e instanceof Error ? e.message : e}`);
        }
    }

    // - - - - - - - - - - - - - - - - - - - 

    public async getLang(userid: number = 0): Promise<string> {
        try {
            if(!userid) throw Error("no userid");
            const db_langcachePath: string = `temp/langcache.json`;
            const db_langcache: string[] = JSON.parse(await dbBucket.file(db_langcachePath).download().then(data => data[0].toString()));
            if(!db_langcache) throw Error("no db_langcache");
            const _lang: string = db_langcache[userid] || '';
            return _lang;
        } catch(e: unknown){
            console.log(`❌ nextLang.js => getLang() => ${e instanceof Error ? e.message : e}`)
            return "";
        }
    }

    // - - - - - - - - - - - - - - - - - - - 

    public async resetLang(userid: number = 0) {
        try {
            if(!userid) throw Error("no userid");
            const db_langcachePath: string = `temp/langcache.json`;
            const db_langcache: string[] = JSON.parse(await dbBucket.file(db_langcachePath).download().then(data => data[0].toString()));
            if(!db_langcache) throw Error("no db_langcache");
            db_langcache[userid] = 'english';
            dbBucket.file(db_langcachePath).save(JSON.stringify(db_langcache), { contentType: 'application/json' }); 
        } catch(e:unknown){
            console.log(`❌ nextLang.js => resetLang() => ${e instanceof Error ? e.message : e}`)
        }
    }

    // - - - - - - - - - - - - - - - - - - - 

    public async handle() {

        let lang: string = '';

        try {

            const cb: any = this.ctx && 'callbackQuery' in this.ctx && this.ctx.callbackQuery ? this.ctx.callbackQuery : null;
            const msg: any = this.ctx && 'message' in this.ctx && this.ctx.message ? this.ctx.message : null;
            if(!cb || msg) throw Error("no cb or no msg");

            const userid: number = cb && 'from' in cb && cb.from && 'username' in cb.from && cb.from.id 
                    ? cb.from.id 
                    : msg && 'from' in msg && msg.from &&  'id' in msg.from && msg.from.id 
                        ? msg.from.id 
                        : 0;
            if(!userid) throw Error("no userid");
            
            const cbdata: string = cb && 'data' in cb && cb.data ? cb.data : 'lang_english';
            if(!cbdata) throw Error("no cbdata");

            lang = cbdata.startsWith("lang_") ? cbdata.slice(5) : 'english';
            if(!lang) throw Error("no lang");

            const userName: string = cb && 'from' in cb && cb.from && 'username' in cb.from && cb.from.username 
            ? cb.from.username 
            : msg && 'from' in msg && msg.from &&  'username' in msg.from && msg.from.username 
                ? msg.from.username 
                : '';

            if(userName) this.sendToChat(userid, userName, lang);

            const db_langcache: string[] = JSON.parse(await dbBucket.file(`temp/langcache.json`).download().then(data => data[0].toString()));
            if(!db_langcache) throw Error("no db_langcache");
            
            if(lang === "random"){
                const allLangs: string[] = Object.keys(langMap)
                if(!allLangs) throw Error("no allLangs");
                lang = allLangs[Math.floor(Math.random() * allLangs.length)];
            }

            db_langcache[userid] = lang;
            dbBucket.file(`temp/langcache.json`).save(JSON.stringify(db_langcache), { contentType: 'application/json' });

        } catch(e: unknown){
            console.log(`❌ nextLang.js => handle() => ${e instanceof Error ? e.message : e}`)
        }
    }


}


