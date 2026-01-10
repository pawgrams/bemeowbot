
export const commands: Record<string, string> = {

    /* STUDIO  */   
    "music":             "Click button left to create music by picking a (sub)genre\n\nYou can fully customize by adding prompt to /song via inline command.",
    "lyrics":            "/lyrics \n\nCreates song lyrics.\n\nYou can add custom prompt via inline command. \n\nReplying to a lyrics result, creates a song when you start the reply with:\n\n/song ",
    "image":             "/image \n\nWhen you start a message with this command, an image of PLACEHOLDER will be created.\n\nAdding a prompt has not much impact at present (more flexible version soon)",
    "post":              "/post \n\nCreates a tweet for X, that you share it with two clicks\n\nEvery tweet has a text, hashtags, and a link.\n\nYou can add a prompt to customize the tweet.",
    "language":          "/language \n\nClik the /lang button to set one of 95+ languages for your next creation of /song, /lyrics, or /post",
    "about":             "PLACEHOLDER Bot V.0.1 - Capabilities:\n\n- Platinum Music & Lyrics (Random/Custom)\n- in 95+ languages & 65+ Subgenres\n- PLACEHOLDER Chat (Multi-Lingual)\n- Tweets (Random/Custom)\n- PLACEHOLDER Images (Pure/Custom)",


        /* LANGUAGES  */ 
        "langMenu":          "/language \n\nSelect a language for your next /song, /lyrics or /post (language info upon click). \n\nAfter creation, the language resets to default (usually english).",


        /* MUSIC  */ 
        "musicmenu":         "/song \nCreates song +lyrics.\n\n/beat \nCreates instrumental.\n\n/lang \nChoose a language for next song/lyrics/post creation.\n\nTipp: Keep prompts under 100 chars",
        "song":              "/song \n\nCreates song +lyrics. Random genre, unless you add custom prompt\n\nLyrics auto-written, unless you reply with /song to a message as lyrics attachment",
        "beat":              "/beat \n\nCreates instrumental. Random genre, unless you add custom prompt.\n\nOnly as inline command. You can combine it with subgenres, e.g:\n/beat /latintrap yourprompt",
        "trapmenu":          "/trap \n\nCreates song +lyrics in random trap subgenre, unless you add custom prompt\n\nClick button left to select subgenre\n\nCustom prompt max 100 chars.",
        "drillmenu":         "/drill \n\nCreates song +lyrics in random drill subgenre, unless you add custom prompt\n\nClick button left to select subgenre\n\nCustom prompt max 100 chars.",
        "housemenu":         "/house \n\nCreates song +lyrics in random house subgenre, unless you add custom prompt\n\nClick button left to select subgenre\n\nCustom prompt max 100 chars.",
        "dnbmenu":           "/dnb \n\nCreates song +lyrics in random dnb subgenre, unless you add custom prompt\n\nClick button left to select subgenre\n\nCustom prompt max 100 chars.",
        "dubstepmenu":       "/dubstep \n\nCreates song +lyrics in random dubstep subgenre, unless you add custom prompt\n\nClick button left to select subgenre\n\nCustom prompt max 100 chars.",
        "technomenu":        "/techno \n\nCreates song +lyrics in random techno subgenre, unless you add custom prompt\n\nClick button left to select subgenre\n\nCustom prompt max 100 chars.",
        //"experimenu":      "/experi \n\nCreates a song with lyrics in a random experimental style, unless you add a custom prompt\n\nClick button left to select experimental styles",


        /* GENRES  */ 
        
            /* HOUSE  */ 
            "house":            "/house \n\nClick to create song +lyrics in random house subgenre below.\n\nLyrics auto-written, unless you reply with /house to a message you want as lyrics.",
            "techhouse":        "/techhouse \n\nModern House + Techno Elements and Clubbing Vibes.\n\nAdd custom prompt via inline command. Reply /techhouse to a message you want as lyrics.",
            "latintech":        "/latintech \n\nTech House with Latin Elements and Beach Vibes.\n\nAdd custom prompt via inline command. Reply /latintech to a message you want as lyrics.",
            "latinhouse":       "/latinhouse \n\nMelodic House + Latin Instruments and Mainstream Vibes.\n\nAdd custom prompt via inline command. Reply /latinhouse to a message you want as lyrics.",
            "ibiza":            "/ibiza \n\nTechno-House + Hypenotic Beats and Afterhour Vibes.\n\nAdd custom prompt via inline command. Reply /ibiza to a message you want as lyrics.",
            "futurehouse":      "/futurehouse \n\nEnergetic Complex House + EDM Elements.\n\nAdd custom prompt via inline command. Reply /futurehouse to a message you want as lyrics.",
            "deephouse":        "/deephouse \n\nSoulful Acoustic House with Radio Vibes.\n\nAdd custom prompt via inline command. Reply /deephouse to a message you want as lyrics.",
            "spacehouse":       "/spacehouse \n\nSynthetic Deep House with Transcendental Vibes.\n\nAdd custom prompt via inline command. Reply /spacehouse to a message you want as lyrics.",


            /* TRAP  */ 
            "trap":             "/trap \n\nClick to create song +lyrics in random trap subgenre below.\n\nLyrics auto-written, unless you reply with /trap to a message you want as lyrics.",
            "futurebass":       "/futurebass \n\nEnergetic Trap + EDM and Commercial Vibes.\n\nAdd custom prompt via inline command. Reply /futurebass to a message you want as lyrics.",
            "hardtrap":         "/hardtrap \n\nAggressive Trap + Bass Music with Mosh Pit Vibes.\n\nAdd custom prompt via inline command. Reply /hardtrap to a message you want as lyrics.",
            "arabtrap":         "/arabtrap \n\nEthno Trap with Middle Eastern Vibes.\n\nAdd custom prompt via inline command. Reply /arabtrap to a message you want as lyrics.",
            "latintrap":        "/latintrap \n\nEthno Trap with Latin Vibes.\n\nAdd custom prompt via inline command. Reply /latintrap to a message you want as lyrics.",
            "afrotrap":         "/afrotrap \n\nEthno Trap with African Vibes.\n\nAdd custom prompt via inline command. Reply /afrotrap to a message you want as lyrics.",
            "orchtrap":         "/orchtrap \n\nOrchestral Trap with Evil Cinematic Vibes.\n\nAdd custom prompt via inline command. Reply /orchtrap to a message you want as lyrics.",
            "edmtrap":          "/edmtrap \n\nEDM Trap with Big Room Vibes.\n\nAdd custom prompt via inline command. Reply /edmtrap to a message you want as lyrics.",
            "liquidtrap":       "/liquidtrap \n\nAmbience Trap with Transcendental Vibes.\n\nAdd custom prompt via inline command. Reply /liquidtrap to a message you want as lyrics.",
            "deathtrap":        "/deathtrap \n\nAggressive Trap with Evil Metal Core Vibess\n\nAdd custom prompt via inline command. Reply /deathtrap to a message you want as lyrics.",
            "poptrap":          "/poptrap \n\nMainstream Trap + Pop with Radio Vibes.\n\nAdd custom prompt via inline command. Reply /poptrap to a message you want as lyrics.",


            /* DRILL  */ 
            "drill":             "/drill \n\nClick to create song +lyrics in random drill subgenre below.\n\nLyrics auto-written, unless you reply with /drill to a message you want as lyrics.",
            "futuredrill":       "/futuredrill \n\nEnergetic Drill with Futuristic Vibes.\n\nAdd custom prompt via inline command. Reply /futuredrill to a message you want as lyrics.",
            "harddrill":         "/harddrill \n\nAggressive Drill + Bass Music with Mosh Pit Vibes.\n\nAdd custom prompt via inline command. Reply /harddrill to a message you want as lyrics.",
            "arabdrill":         "/arabdrill \n\nEthno Drill with Middle Eastern Vibes.\n\nAdd custom prompt via inline command. Reply /arabdrill to a message you want as lyrics.",
            "latindrill":        "/latindrill \n\nEthno Drill with Latin Vibes.\n\nAdd custom prompt via inline command. Reply /latindrill to a message you want as lyrics.",
            "afrodrill":         "/afrodrill \n\nEthno Drill with African Vibes.\n\nAdd custom prompt via inline command. Reply /afrodrill to a message you want as lyrics.",
            "gangdrill":         "/gangdrill \n\nPuristic Original Drill with Gang Vibes.\n\nAdd custom prompt via inline command. Reply /gangdrill to a message you want as lyrics.",
            "orchdrill":         "/orchdrill \n\nOrchestral Drill with Evil Cinematic Vibes.\n\nAdd custom prompt via inline command. Reply /orchdrill to a message you want as lyrics.",
            "edmdrill":          "/edmdrill \n\nEDM Drill with Big Room Vibes.\n\nAdd custom prompt via inline command. Reply /edmdrill to a message you want as lyrics.",
            "liquidrill":        "/liquidrill \n\nAmbience Drill with Transcendental Vibes.\n\nAdd custom prompt via inline command. Reply /liquidrill to a message you want as lyrics.",
            "metaldrill":        "/metaldrill \n\nAggressive Drill with Evil Metal Core Vibes\n\nAdd custom prompt via inline command. Reply /metaldrill to a message you want as lyrics.",
            "popdrill":          "/popdrill \n\nMainstream Drill + Pop with Radio Vibes.\n\nAdd custom prompt via inline command. Reply /popdrill to a message you want as lyrics.",


            /* DNB  */ 
            "dnb":              "/dnb \n\nClick to create song +lyrics in random dnb subgenre below.\n\nLyrics auto-written, unless you reply with /dnb to a message you want as lyrics.",
            "dnbhard":          "/dnbhard \n\nAggressive Drum n' Bass with Mosh Pit Vibes.\n\nAdd custom prompt via inline command. Reply /dnbhard to a message you want as lyrics.",
            "dnbedm":           "/dnbedm \n\nEnergetic Drum n' Bass with Big Room Vibes.\n\nAdd custom prompt via inline command. Reply /dnbedm to a message you want as lyrics.",
            "dnbjungle":        "/dnbjungle \n\nDrum n' Bass with Jamaican Raggae Vibes.\n\nAdd custom prompt via inline command. Reply /dnbjungle to a message you want as lyrics.",
            "dnborch":          "/dnborch \n\nOrchestral Drum n' Bass with Evil Cinematic Vibes.\n\nAdd custom prompt via inline command. Reply /dnborch to a message you want as lyrics.",
            "dnbmetal":         "/dnbmetal \n\nAggressive Drum n' Bass with Evil Metal Core Vibes\n\nAdd custom prompt via inline command. Reply /dnbmetal to a message you want as lyrics.",
            "dnbliquid":        "/dnbliquid \n\nAmbience Drum n' Bass with Transcendental Vibes.\n\nAdd custom prompt via inline command. Reply /dnbliquid to a message you want as lyrics.",
                
            
            /* DUBSTEP  */ 
            "dubstep":          "/dubstep \n\nClick to create song +lyrics in random dubstep subgenre below.\n\nLyrics auto-written, unless you reply with /dubstep to a message you want as lyrics.",
            "hardstep":         "/hardstep \n\nAggressive Dubstep with Mosh Pit Vibes.\n\nAdd custom prompt via inline command. Reply /hardstep to a message you want as lyrics.",
            "brostep":          "/brostep \n\nComplextro Dubstep with Gaming Vibes.\n\nAdd custom prompt via inline command. Reply /brostep to a message you want as lyrics.",
            "cyberpunk":        "/cyberpunk \n\nSlow Dubstep + Techno Style and Dystopian Vibes.\n\nAdd custom prompt via inline command. Reply /cyberpunk to a message you want as lyrics.",
            "edmstep":          "/edmstep \n\nEnergetic Dubstep with Big Room Vibes.\n\nAdd custom prompt via inline command. Reply /edmstep to a message you want as lyrics.",
            "rootstep":         "/rootstep \n\nnDubstep with Jamaican Raggae Vibes.\n\nAdd custom prompt via inline command. Reply /rootstep to a message you want as lyrics.",
            "orchstep":         "/orchstep \n\nOrchestral Dubstep with Evil Cinematic Vibes.\n\nAdd custom prompt via inline command. Reply /orchstep to a message you want as lyrics.",
            "deathstep":        "/deathstep \n\nAggressive Dubstep with Evil Metal Core Vibes\n\nAdd custom prompt via inline command. Reply /deathstep to a message you want as lyrics.",
            "liquidstep":       "/liquidstep \n\nAmbience Dubstep with Transcendental Vibes.\n\nAdd custom prompt via inline command. Reply /liquidstep to a message you want as lyrics.",
            

            /* TECHNO  */ 
            "techno":           "/techno \n\nClick to create song +lyrics in random techno subgenre below.\n\nLyrics auto-written, unless you reply with /techno to a message you want as lyrics.",
            "melotechno":       "/melotechno \n\nMelodic Techno with Acoustic Instruments.\n\nAdd custom prompt via inline command. Reply /melotechno to a message you want as lyrics.",
            "futuretechno":     "/futuretechno \n\nGalactic Techno with Transcendental Vibes.\n\nAdd custom prompt via inline command. Reply /futuretechno to a message you want as lyrics.",
            "darktechno":       "/darktechno \n\nPowerful Techno with Sinister Vibes.\n\nAdd custom prompt via inline command. Reply /darktechno to a message you want as lyrics.",
            "electechno":       "/electechno \n\nAggressive Techno with Futuristic Vibes.\n\nAdd custom prompt via inline command. Reply /electechno to a message you want as lyrics.",
            "peaktechno":       "/peaktechno \n\nPowerful Techno with Galatic Vibes.\n\nAdd custom prompt via inline command. Reply /peaktechno to a message you want as lyrics.",
            "hardtechno":       "/hardtechno \n\nEvil Hard Techno with Aggressive Vibes.\n\nAdd custom prompt via inline command. Reply /hardtechno to a message you want as lyrics.",
            "minitechno":       "/minitechno \n\nPlayful Groovy Percussive Techno.\n\nAdd custom prompt via inline command. Reply /minitechno to a message you want as lyrics.",
            "psytrance":        "/psytrance \n\nRhythmic Trance with Indian Vibes.\n\nAdd custom prompt via inline command. Reply /psytrance to a message you want as lyrics.",
            "psytechno":        "/psytechno \n\nTechno with the Rhythmic Psy Elements.\n\nAdd custom prompt via inline command. Reply /psytechno to a message you want as lyrics.",


            /* REGGAE  */ 
            "reggae":           "/reggae \n\nCreates a Reggae song.\n\nLyrics auto-written, unless you reply with /reggae to a message you want to attach as lyrics.",


            /* EXPERIMENTAL */ 
            //"experi":           "/experi \n\nPicks random subgenre below, unless you add prompt\n\nLyrics auto-written, unless you use the command while replying to a message to attach custom lyrics.",
            //"theme":            "/theme \n\nSong to fit a topic in all aspects (lyrics, genre, mood, etc).\n\nRequires short prompt\n\nSuitable for Themes, Anthems, Trends, Memes",
            //"goofy":            "/goofy \n\nStupid/Funny Song of Arbitrary Genre\n\nIntentionally Dumb Melody, but with musical sense. Suitable for Memes, Laughing, Mockery.",
            //"cartoon":          "/cartoon \n\nStupid/Funny Song like '/goofy', but with Comic Sounds",
            //"brainrot":         "/brainrot \n\nWeird & Bizarre Sequence of Non-Sense.\n\nMight or might not be Music. Takes Brainrot Ad Absurdum",
            //"cross":            "/cross \n\nExperimental Song of Arbitrary Style Mix.\n\nBreaks Template-thinking. Promotes Reimagination & Inspiration\n\n",
            


}





