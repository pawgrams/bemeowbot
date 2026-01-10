import { bot } from '../../../context/bot';
import { Message } from 'telegraf/types';
import { recentUsers } from '../../../context/recentUsers';
import { mainMenu } from '../../../menu/main';
import { _group } from '../../../context/cache/access';
import { _welcomegif } from '../../../context/cache/assets';

////////////////////////////////////////////////////////////////

export class Welcome {

    private group: number;
    private newMembers: any;

    constructor(group: number = 0, newMembers: any = null) {
        this.group = group;
        this.newMembers = newMembers;
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    
    public async welcome(): Promise<void> {
        try{
            const replyToId: number = await this.welcomeUser(_group, this.newMembers); 
            const usersToTag: number[] = recentUsers.getRecentUsers();
            this.welcomeSupport(this.newMembers, replyToId, usersToTag);
            recentUsers.addArrayToQueue(this.newMembers);
        } catch(e: unknown){
            console.log(`❌ welcome.js => welcome() => ${e instanceof Error ? e.message : e}`);
        }
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    public async welcomeUser(_group: number, newMembers: any): Promise<number> {

        try {

            let userNames: string = ""; 
            let userMentions: string = "";
            const userNamesArray: string[] = [];
            const userMentionsArray: string[] = [];

            try{
                for(const newMember of newMembers){
                    if (newMember.username) {
                        userNamesArray.push(`@${newMember.username}`);
                    }
                    if (newMember.id) {
                        userMentionsArray.push(`<a href="tg://user?id=${String(newMember.id)}">&#8203;</a>`);
                    }
                }

                userNames = userNamesArray.join(' ') || '';
                userMentions = userMentionsArray.join('') || '';

            } catch(e: unknown){
                userNames = "there";
            }

const message: string = `<b>Meow ${userNames}</b> 😺 Welcome to PLACEHOLDER, where the magic of music 💫🎶 meets the thrill of Web3 🚀\n
🐾 I'm <b>PLACEHOLDER</b> the fluffy PLACEHOLDER Cat 💞 You can always talk to me by starting a message with: <b>/PLACEHOLDER </b>
- - - - - - - - - - - - - - - - - - - - - - - - - - - -\n<i>By proceeding you agree to our pawsome <a href="https://placeholder.com/terms">terms</a></i>.`

            try { 
                const sent: Message = await bot.telegram.sendAnimation(
                    _group, 
                    _welcomegif, 
                    {caption: message, parse_mode: 'HTML', reply_markup: mainMenu});

                    
                if(!sent || !('message_id' in sent) || !sent.message_id){
                    throw Error('welcome msg with gif could not be sent. trying fallback now ...');
                }

                return sent.message_id || 0;

            }catch(e: unknown){
                const sent: Message = await bot.telegram.sendMessage(
                    _group, 
                    message, 
                    {parse_mode: 'HTML'}
                );
                if(!sent || !('message_id' in sent) || !sent.message_id){
                    throw Error('welcome msg with gif could not be sent. trying fallback now ...');
                }
                return sent.message_id || 0;
            }

        } catch(e: unknown){
            console.log(`❌ welcome.js => welcomeUser() => ${e instanceof Error ? e.message : e}`);
            return 0;
        }

    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    public async welcomeSupport(newMembers: any, replyToId: number, usersToTag: number[]): Promise<void> {

        try {

            let invite: string = "";
            let subjectUser: string = ''; 
            let invites: string = '';

            try{
                if(newMembers?.length === 1){
                    subjectUser = `<b>@${newMembers[0]?.username}</b>`  || `<b>our New Member</b>` ;
                } else {
                    subjectUser = `<b>our New Members</b>` 
                }

            } catch(e: unknown){
                subjectUser = `<b>our New Members</b>`
            }
                try{
                    if (usersToTag.length > 0) { 
                        invites += usersToTag.map(userId => `<a href="tg://user?id=${userId}">&#8203;</a>`).join('') || '';
                    }
                } catch {} 

                
            let opt: any = {parse_mode: 'HTML'};

            if(replyToId){
                opt.reply_to_message_id = replyToId;
                invite += `🥁 <b>Everyone please welcome ${subjectUser} </b>🎉❤️ Let's have a pawsome time together 🫶 It's One 4 All & All 4 One! Just like paws make a cat walk 🐾🐈🐾 ${invites}`
            } else {
                invite += `🥁 <b>Everyone please welcome ${subjectUser} </b> 🎉❤️</b> Let's have a pawsome time 🐾 and grow together 🫶 ${invites}`;
            }

            try {
                bot.telegram.sendMessage(_group, invite, opt); // as reply to the chatbot could be added later
            } catch {
                console.log(`❌ welcome.ts: welcomeSupport: sendMessage`);
            }
        
        } catch(e: unknown){
            console.log(`❌ welcome.js => welcomeSupport() => ${e instanceof Error ? e.message : e}`);
        }

    }

}