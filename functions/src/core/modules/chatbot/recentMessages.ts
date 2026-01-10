import EventEmitter from 'events';

let maxThreadLength: number = 250;

class RecentMessagesventEmitter extends EventEmitter {
    private events: any[] = [];

    addmsg(message: any) {
        this.events.push(message);
        if (this.events.length > maxThreadLength) {this.events.shift();}
        this.emit('newEvent', message);
    }

    getlen() {
        return this.events.length;
    }

    getmsg(count: number = this.getlen()) {
        return this.events.slice(-count);
    }

}

export const recentMessages: RecentMessagesventEmitter = new RecentMessagesventEmitter();
