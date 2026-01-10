import EventEmitter from 'events';

////////////////////////////////////////////////////////////////

const MAX_ENTRIES: number = 100;

class RecentUsersEventEmitter extends EventEmitter {
    private events: number[] = [];

    addUserToQueue(userid: number) {
        try{
            if (!this.events.includes(userid)){
                this.events.push(userid);
                if (this.events.length > MAX_ENTRIES) {
                    this.events.shift();
                }
            this.emit('newEvent', userid);
            }
        } catch(e: unknown){
            console.log(`❌ recentUser.js => addUserToQueue => ${e instanceof Error ? e.message : e}`);
        }
    }

    addArrayToQueue(userids: number[]) {
        try {
            const uniqueUsers: number[] = userids.filter(userid => !this.events.includes(userid)); 
            this.events.push(...uniqueUsers);
            if (this.events.length > MAX_ENTRIES) {
                this.events.splice(0, this.events.length - MAX_ENTRIES);
            }
            uniqueUsers.forEach(userid => this.emit('newEvent', userid));
        } catch (e: unknown) {
            console.log(`❌ recentUser.js => addArrayToQueue => ${e instanceof Error ? e.message : e}`);
        }
    }

    getUserFromQueue(count: number) {
        return this.events.slice(0, count) || [];
    }

    getRecentUsers() {
        return [...this.events];
    }


}

export const recentUsers: RecentUsersEventEmitter = new RecentUsersEventEmitter();
