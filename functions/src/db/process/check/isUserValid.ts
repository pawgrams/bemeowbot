import { User } from 'telegraf/types';
import { isValidString } from './isValidString';

////////////////////////////////////////////////////////////////

export class IsGroupMember {

    private from: any;

    constructor(from: any) {
        this.from = from;
    }

    public async isUserValid(): Promise<boolean> {

        try{
            
            const user: User = this.from;
            if(    
                user &&
                'id' in user && 
                'username' in user &&
                typeof user.id === 'number' && 
                typeof user.first_name === 'string' &&
                user.username &&
                typeof user.username === 'string' &&
                !user.is_bot
            ){
                const validFirstName = await isValidString(user.first_name, 50); 
                const validUserName = await isValidString(user.username, 30);
                if(validFirstName && validUserName){
                    return true;
                }
            }

            return false; 

        } catch(e: unknown){
            console.log(`❌ ${__filename.replace(process.cwd(), '')} ${e instanceof Error ? e.message : e}`);
            return false;
        }

    }
}