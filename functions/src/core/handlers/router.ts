import { Context } from 'telegraf';
import { _group } from '../../context/cache/access';

import { MainMenu } from '../../menu/main';
import { StudioMenu } from '../../menu/studioMenu';
import { LinksMenu } from '../../menu/linksMenu';
import { MusicMenu } from '../../menu/musicMenu';
import { LangMenu } from '../../menu/langMenu';
import { NextLang } from '../modules/studio/lyrics/language/nextLang';

import { HouseMenu } from '../../menu/genres/house';
import { TrapMenu } from '../../menu/genres/trap';
import { DrillMenu } from '../../menu/genres/drill';
import { DnBMenu } from '../../menu/genres/dnb';
import { DubstepMenu } from '../../menu/genres/dubstep';
import { TechnoMenu } from '../../menu/genres/techno';

import { Chatbot } from '../modules/chatbot/chatbot';
import { Alert } from '../modules/info/alert';
import { Image } from '../modules/image/image';
import { Contract } from '../modules/info/contract'
import { Post } from '../modules/social/post'
import { Song } from '../modules/studio/music/song';
import { Lyrics } from '../modules/studio/lyrics/lyrics';

////////////////////////////////////////////////////////////////

export class Router {

    private ctx: Context;
    private target: string;
    private readonly map: { [key: string]: any };

    constructor(ctx: Context, target: string) {
        this.ctx = ctx;
        this.target = target;
        this.map = {

            'chatbot':       Chatbot,
            'studio':       StudioMenu,
            'links':        LinksMenu,
            'menu':         MainMenu,
            'music':        MusicMenu,
            'language':     LangMenu,
            'song':         Song,
            'image':        Image,
            'lyrics':       Lyrics,
        
            'housemenu':    HouseMenu,
            'trapmenu':     TrapMenu,
            'drillmenu':    DrillMenu,
            'dnbmenu':      DnBMenu,
            'dubstepmenu':  DubstepMenu,
            'technomenu':   TechnoMenu,
        
            'ca':           Contract,
            'post':         Post,
            'lang':         NextLang,
            'alert':        Alert, 
        
        };
    }

    ////////////////////////////////////////////////////////////////

    public async route(): Promise<void> {
        try {
            if(!this.ctx) throw Error("no ctx");
            if(!this.target) throw Error("no target");
            const HandlerClass = this.map[this.target];
            if (!HandlerClass) throw new Error(`invalid target => target not in router map: ${this.target}`);
            new HandlerClass(this.ctx).handle();
        } catch(e: unknown) {
            console.log("❌ router.js", e instanceof Error ? e.message : e);
        }
    }


}
