import { seeds } from './seeds';

export class GetSeeds {

    private seed1: string; 
    private seed2: string; 
    private isExotic: boolean;

    constructor(isExotic: boolean) {
        this.seed1 = "home";
        this.seed2 = "universe";
        this.isExotic = isExotic;
    }

    public getSeeds(): { seed1: string; seed2: string } {
        try {
            if (this.isExotic) return { seed1: this.seed1, seed2: this.seed2 }; 
            if (seeds && seeds.length > 1) {
                this.seed1 = seeds[Math.floor(Math.random() * seeds.length)];
                do {
                    this.seed2 = seeds[Math.floor(Math.random() * seeds.length)];
                } while (this.seed2 === this.seed1);
            }
        } catch (e: unknown) {
            console.log("❌ getSeeds.js", e);
        }
        return { seed1: this.seed1, seed2: this.seed2 };
    }

}
