import { rl, ms } from '../../mapRL';

const limit = rl?.user?.song?.day;
const tf = ms?.day;

class UserSongDay {

    private cache: {[id: number]:  number[]} = {};

    private update(id: number): void {
        const now: number = Date.now();
        if (this.cache[id]) {
            this.cache[id] = this.cache[id].filter(ts => now - ts < tf);
        }
    }

    private check(id: number): boolean {
        return this.cache[id]?.length >= limit;
    }

    private add(id: number): void {   
        if (!this.cache[id]) {
            this.cache[id] = [];
        }
        if(this.cache[id].length < limit){
            const now = Date.now();
            this.cache[id].push(now);
        }
    }

    public expires(id: number): number {
        return this.cache[id] ? Math.min(...this.cache[id]) + tf : 0;
    }

    public RL(id: number): boolean {
        try{
            this.update(id);
            if(this.check(id)){
                return true;
            } else {
                this.add(id);
            }
            return false;
        }catch(e: unknown){
            console.log(`❌ ${__filename.replace(process.cwd(), '')} => ${e}`);
            return true;
        }
    }

}

export const userSongDay: UserSongDay = new UserSongDay();