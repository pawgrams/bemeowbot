

const tipps: string[] = [


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 


`\n💡😺 <b>Did you know You can ... !?</b>

▪️ Create a tweet from the command: /post
▪️ incl. Hashtags + Link to Content?
▪️ Even add a short prompt to customize it?
▪️ Tweet it in 2 clicks when logged on X?

<b>Try it. It's Pawsome</b> 🐾`,


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 


`\n💡😺 <b>Did you know You can... !?</b>

▪️ Create Brilliant Music with me?
▪️ in over 95 beautiful Languages?
▪️ in 7 Genres & 50+ Subgenres?
▪️ For Free with a few Clicks? 🐾

Don't Believe it ⁉️ 
Just type: <b>/studio</b> or <b>/song</b>

<b>It will Blow Your Mind!</b> 🤯`,


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 


`\n💡😺 <b>Did you know I can ...?!</b>

▪️ Turn Ideas into full Lyrics?
▪️ Or literally from Scratch? 🐾
▪️ In 95 Languages?

Don't Believe it ⁉️ 
Just type: <b>/lyrics</b>

<b>Try it! It's Pawsome</b> 😽`,


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 


`\n💡😺 <b>Did you know I can ...?!</b>

▪️ Create Pawsome Lyrics & Songs?
▪️ Also with Funny or Cute Languages?
▪️ Like Meow, Klingon & Gibberish?

Let's have some Fun 🐾

Just type: <b>/studio</b>
Go to <b>/lang</b> pick your fav.
Create a <b>/song</b> & ROFL 😹`,


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 


`\n💡😺 <b>Did you know You can... </b>

▪️ Create Pawsome Trap here?
▪️ With Powerfurl Subgenres?
▪️ By a click of a button? 🐾

Don't Believe it ⁉️ 
Try one of these:
<b>/trap</b>
<b>/liquidtrap</b>
<b>/latintrap</b>
<b>/futurebass</b>

<b>It will Blow Your Mind!</b> 🤯`,


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 


`\n💡😺 <b>Did you know You can... !?</b>

▪️ Create Pawsome House here?
▪️ Incl. Powerfurl Subgenres?
▪️ With a click of a button? 🐾

Don't Believe it ⁉️ 
Try one of these:
<b>/house</b>
<b>/techhouse</b>
<b>/futurehouse</b>
<b>/deephouse</b>

<b>Life is a Dance. Let's Move it!</b> 😻`,


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 


`\n💡😺 <b>Did you know You can... !?</b>

▪️ Create Pawsome Dubstep here?
▪️ With Powerfurl Subgenres?
▪️ By a click of a button? 🐾

Don't Believe it ⁉️ 
Try one of these:
<b>/dubstep</b>
<b>/cyberpunk</b>
<b>/brostep</b>
<b>/rootstep</b>

<b>Bass Face Guaranteed!</b> 🙀`,


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 


`\n💡😺 <b>Did you know You can... !?</b>

▪️ Create Pawsome Techno here?
▪️ With Powerfurl Subgenres?
▪️ By a click of a button? 🐾

Don't Believe it ⁉️ 
Try one of these:
<b>/techno</b>
<b>/psytrance</b>
<b>/electechno</b>
<b>/darktechno</b>
<b>/minitechno</b>

<b>The Night is Your Oister</b> 😼`,


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 


`\n💡😺 <b>Did you know You can... !?</b>

▪️ Create Outstanding DnB here?
▪️ With Powerfurl Subgenres?
▪️ By a click of a button? 🐾

Don't Believe it ⁉️ 
Try one of these:
<b>/dnb</b>
<b>/dnbhard</b>
<b>/dnbjungle</b>
<b>/dnborch</b>

<b>Let's Drive it Up!</b> ✅ `,


]

////////////////////////////////////////////////////////////////

import { dbBucket } from '../../../context/cache/buckets';
import { bot } from '../../../context/bot';
import { _group } from '../../../context/cache/access';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

export class SendTipp {

    public async sendTipp(): Promise<void>{ 
        try {
            const now: number = Date.now();
            let lasttipp: number = await this.readDB();
            if(lasttipp === 0){
                lasttipp = now - 1000 * 60 * 60 * 7;
                await this.writeDB(lasttipp);
            } else if( now - lasttipp > 1000 * 60 * 60 * 6 ){
                const randindex: number = Math.floor(Math.random() * tipps.length) || 0;
                const randtipp: string = tipps[randindex];
                await this.writeDB(now);
                if(randtipp) bot.telegram.sendMessage(_group, randtipp, {parse_mode: 'HTML'}); 
            }
        } catch(e: unknown){
            console.log("❌ tipps.js", e instanceof Error ? e.message : e);
        }
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

    private async writeDB(lasttipp: number = Date.now()): Promise<void>{
        try{
            const db_lasttippPath: string = `temp/lasttipp.json`;
            const db_langtipp: any = JSON.parse(await dbBucket.file(db_lasttippPath).download().then(data => data[0].toString()));
            db_langtipp["last_tipp"] = lasttipp;
            await dbBucket.file(db_lasttippPath).save(JSON.stringify(db_langtipp), { contentType: 'application/json' });
        } catch(e: unknown){
            console.log('❌ tipps.js => writeDB() =>  writing lasttipp to db_langtipp failed', lasttipp, lasttipp);
        }
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

    private async readDB(): Promise<number>{
        const now = Date.now();
        let lasttipp: number = now;
        try{
            const db_lasttippPath: string = `temp/lasttipp.json`;
            const db_langtipp: any = JSON.parse(await dbBucket.file(db_lasttippPath).download().then(data => data[0].toString()));
            lasttipp = db_langtipp["last_tipp"] || 0;
        } catch(e: unknown){
            console.log(`❌ tipps.js => readDB() => writing lasttipp to db_langtipp failed: ${lasttipp} => ${e instanceof Error ? e.message : e}`);
        }
        return lasttipp;
    }

}










