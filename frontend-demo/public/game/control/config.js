let sceneLocalConfig = {
    main: {
        width: 1600,
        height: 900,
    },
    
    battle: {
        x: 0,
        y: 0,
        width: 1600,
        height: 900
    }
}

let battleConfig = {
    AOEimage : "/images/fire.png",
    wallHeight: 30,
    wallWidth: 30,
}

let uiConfig = {
    ranklist: {
        x: 17,
        y: 200,
        width: 170,
        height: 360, //50*5+10*4+50+10
        shape: 'rectangle',
        color: '#CEFFCE',
    },
    giveInBtn: {
        color: 'yellow',
        x: 50,
        y: 540,
        width: 100,
        height: 50,
        text: 'surrender'
    },
    soundBtn: {
        onImage: "/images/bgmOn.png",
        offImage: "/images/bgmOff.png",
        x: sceneLocalConfig.main.width-70,
        y: 10,
        width: 60,
        height: 60,
        music: "/music/bounce.mp3",
        bgm_loop: true,
    },
    clock: {
        image: {
            image: "/images/clock.png",
            x: 160,
            y: 13,
            width: 50,
            height: 50,
        },
        text: {
            textFont: "35px",
            x: 220,
            y: 20,
            textColor: "white",
        }
    },
    playerNumber: {
        textFont: "35px",
        x: 160,
        y: 70,
        textColor: "white",
    }
};

let ranklistConfig = {
    text: {
        x: 50,
        y: 10,
        text: "ranklist",
        shape: 'text',
        textFont: '20px',
        textColor: 'purple',
    },
    item: {
        x: 10,
        yStart: 50,
        height: 50,
        width: 150,
        margin: 10,
        myColor: 'pink',
        otherColor: '#66B3FF',
    }
}

let rankItemConfig = {
    head: {
        width: 40,
        height: 40,
        x: 5,
        y: 5,
    },
    name: {
        x: 55,
        y: 5,
        textFont: '15px',
        textColor: 'black',
    },
    score: {
        x: 55,
        y: 25,
        textFont: '15px',
        textColor: 'black',
    }
}


let heroLocalConfig = {
    bloodHeight: 5,
    bloodWidth: 100,
    bloodY: -4,
    bloodMax: 100,
    nameY: -25,
    heroX: 50,
    heroY: 60,
    heroWpID: "5bfc21d104377b2c337dd203",
    stars: ["/images/star_red.png",
            "/images/star_blue.png",
            "/images/star_yellow.png"],
    fuzzy: {
        x: -15,
        y: -10,
        width: 100,
        height: 70,
        image: "/images/fuzzy.png",
        imageWidth: 57,
        imageHeight: 63,
    },
    property: {
        total: 3,
        color: ['red', 'blue', 'yellow'],
    },
    background: [
        '/images/red_back.png',
        '/images/blue_back.png',
        '/images/yellow_back.png',
    ],
    round: [
        { image: '/images/red_round.png', scale: 3},
        { image: '/images/blue_round.png', scale: 3},
        { image: '/images/yellow_round.png', scale: 2},
    ]
}

let minimapPlayerOnlyConfig = {
    backColor: 'white',
    playerColor: 'blue',
    playerDiameter: 50,
    x: 13,
    y: 13,
    height: 100,
    width: 140,
    pixelHeight: 100,
    pixelWidth: 100,
    lineWidth: 4,
    alpha: 0.5,
    roomColor: ['white', 'yellow', 'red', 'gray'],
}

let propConfig = {
    text: {
        x: 0,
        y: -35,
        textColor: '#DCDCDC',
        textFont: '30px',
    }
}


let attackName = ['attack2', 'attack',  'raw_copy', 'AOE', 'rd'];

export {heroLocalConfig, attackName, sceneLocalConfig, rankItemConfig, uiConfig, ranklistConfig, minimapPlayerOnlyConfig, battleConfig, propConfig};