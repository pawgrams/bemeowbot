import { IsGroupMember} from './isGroupMember';
import { dbBucket } from '../../../context/cache/buckets';

////////////////////////////////////////////////////////////////

type NewUserData = {
    id: string,
    is_member: boolean,
    joined: number,
    username: string,
    first_name: string,
    last_name: string,
    artistnames: string[],
    credits: number,
    wallet: string,
    plan: string,
    topup: string,
}

////////////////////////////////////////////////////////////////

export const isUserWrite = async (body: any, userId: number): Promise<boolean> => {

    try {

        if(!body || !userId) throw Error('context or userId missing in request');
        const userInCache: boolean = false;
        if (userInCache) return false;
        const userFilePath: string = `/users/user/${userId}.json`;
        let existingUserData: Partial<NewUserData> | null;
        try {
            existingUserData = JSON.parse(
            await dbBucket.file(userFilePath).download().then((data) => data[0].toString())
            );
        } catch (e: unknown) {
            existingUserData = null;
        }
    
        // set request data for updateable fields
        const username: string = body.from?.username || '';
        const userFirstName: string = body.from?.first_name || '';
        const userLastName: string = body.from?.last_name || '';
        const gmem = new IsGroupMember(userId);
        const isMember: boolean = await gmem.isGroupMember();
    
        if (existingUserData) {

            let dataChanged: boolean = false;
    
            if ((existingUserData.username || '') !== username) {
                existingUserData.username = username;
                dataChanged = true;
            }
    
            if ((existingUserData.first_name || '') !== userFirstName) {
                existingUserData.first_name = userFirstName;
                dataChanged = true;
            }
    
            if ((existingUserData.last_name || '') !== userLastName) {
                existingUserData.last_name = userLastName;
                dataChanged = true;
            }
    
            if ((existingUserData.is_member || false) !== isMember) {
                existingUserData.is_member = isMember;
                dataChanged = true;
            }
    
            if (dataChanged) { // rewrite existing json including changes in updateable data
                await dbBucket
                    .file(userFilePath)
                    .save(JSON.stringify(existingUserData), { contentType: 'application/json' });
                return true;

            } else {
                return false; // no write as userdata exists but has not changed
            }

        } else {  // set data for all init fields if user does not exist

            const newUserData: NewUserData = {
                id: `${userId}`,
                is_member: isMember,
                joined: Date.now(),
                username: username,
                first_name: userFirstName,
                last_name: userLastName,
                artistnames: [],
                credits: 0,
                wallet: '',
                plan: 'none',
                topup: '',
            };
  
            // init write json if user does not exist
            await dbBucket.file(userFilePath).save(JSON.stringify(newUserData), { contentType: 'application/json' });
            return true;

        }

    } catch (e: unknown){
        console.log(`❌ ${__filename.replace(process.cwd(), '')} ${e instanceof Error ? e.message : e}`);
        return false;
    }

};
  