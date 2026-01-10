
import { trap } from './genres/trap';
import { drill } from './genres/drill';
import { house } from './genres/house';
import { dnb } from './genres/dnb';
import { dubstep } from './genres/dubstep';
import { techno } from './genres/techno';
import { reggae } from './genres/reggae';
//import { experi } from './genres/experi';

////////////////////////////////////////////////////////////////

type Genres = {[key: string]: string[];};

export const genres: Genres = {

    "trap":         Object.keys(trap),
    "drill":        Object.keys(drill),
    "house":        Object.keys(house),
    "dnb":          Object.keys(dnb),
    "dubstep":      Object.keys(dubstep),
    "techno":       Object.keys(techno),
    "reggae":       Object.keys(reggae)
    //"experi":     Object.keys(experi),

}


