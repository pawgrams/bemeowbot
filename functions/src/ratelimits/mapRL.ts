export const rl: any = {

    group: {
        cb:         { sec: 10, min: 180 },
        cmd:        { sec: 10, min: 180 },
        song:       { sec: 2, min: 15, hour: 60, day: 300 },
        lyrics:     { sec: 2, min: 20, hour: 100, day: 600 },
        image:      { sec: 2, min: 15, hour: 60, day: 100 },
        post:       { sec: 2, min: 10, hour: 120 },
        contract:   { sec: 2, min: 4, hour: 20 },
        referral:   { sec: 2, min: 6, hour: 30 },
        refreply:   { sec: 2, min: 20, hour: 180 },
        menu:       { sec: 2, min: 6, hour: 60 },
    },

    user: {
        cb:         { sec: 1, min: 12 },
        cmd:        { sec: 1, min: 12 },
        song:       { min: 1, hour: 12, day: 12 },
        lyrics:     { min: 2, hour: 12, day: 12 },
        image:      { min: 2, hour: 12, day: 12 },
        post:       { sec: 1, min: 3, hour: 20 },
        contract:   { sec: 1, min: 1, hour: 3 },
        referral:   { sec: 1, min: 1, hour: 2 },
        refreply:   { sec: 1, min: 4, hour: 12 },
        menu:       { min: 1},
    },

};

export const ms: {sec: number, min: number, hour: number, day: number} = {
    sec:    1000,
    min:    1000 * 60,
    hour:   1000 * 60 * 60,
    day:    1000 * 60 * 60 * 24
} 

