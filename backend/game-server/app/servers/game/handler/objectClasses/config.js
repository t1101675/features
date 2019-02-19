module.exports = {
  /*world*/
  timeInterval: 2,

  /* room */
  roomRow: 4,
  roomColumn: 3,
  roomWidth: 1500,
  roomHeight: 780,
  doorLength: 100,
  doorHeight: 30,
  doorA: 0.5,

  /* game */
  wallHeight: 30,
  heroWidth: 100,
  heroHeight: 100,
  bloodMax: 100,
  propertyMax: 50,
  transmitTime: 100,
  transmitPrepareTime: 200,
  roomCrashInterval: 12000,
  roomHurtRate: 0.001,
  crashHurtInterval: 400,

  /*center walls*/
  centerWallX: 350,
  centerWallY: 250,
  gridLength: 200,
  centerWalls: [
    [
      { x: 0, y: 0, length: 4, dir: "h" },
      { x: 0, y: 1, length: 4, dir: "h" },
    ],
    [
      { x: 0, y: 0, length: 2, dir: "h"},
      { x: 0, y: 0, length: 2, dir: "v"},
      { x: 0, y: 1, length: 4, dir: "h"},
    ],
    [
      { x: 0, y: 0, length: 3, dir: "h"},
      { x: 1, y: 1, length: 2, dir: "h"},
    ],
    [
      { x: 1, y: 0, length: 2, dir: "v"},
      { x: 0, y: 1, length: 3, dir: "h"},
      { x: 3, y: 0, length: 1, dir: "h"},
    ],
    [
      { x: 1, y: 1, length: 3, dir: "v"},
      { x: 0, y: 2, length: 3, dir: "h"},
    ],
    [
      { x: 2, y: 0, length: 3, dir: "v"},
      { x: 0, y: 2, length: 4, dir: "h"},
    ],
  ],

  /* physical */
  g: 0.0005,

  /* static files*/
  background: "/images/bg.jpg",
  heroImage: "/images/good.png",
  headImage: "/images/head0.jpg",
  wallImage: "/images/wall.png",
  doorImage: "/images/portal1.png",

  /*hero control*/
  leftV: -0.2,
  rightV: 0.2,
  upV: -0.5,
  downV: 0.1,

  /*attack*/
  attacks: [
    {
      type: 0,
      name: "normal",
      addWidth: 40,
      addHeight: 0,
      strength: 10,
      property: 0,
      cdTime: 300,
      prepareTime: 0,
      dizzyTime: 0,
    },
    {
      type: 1,
      name: "strong",
      addWidth: 60,
      addHeight: 0,
      strength: 20,
      property: 0,
      cdTime: 600,
      prepareTime: 80,
      dizzyTime: 0,
    },
    {
      type: 2,
      name: "skill",
      addWidth: 100,
      addHeight: 0,
      strength: 20,
      property: 10,
      cdTime: 1000,
      prepareTime: 0,
      dizzyTime: 0,
    },
    {
      type: 3,
      name: "all",
      addWidth: 10000,
      addHeight: 10000,
      strength: 20,
      property: 20,
      cdTime: 3000,
      prepareTime: 100,
      dizzyTime: 800,
    },
    {
      type: 4,
      name: "big",
      addWidth: 1000,
      addHeight: 1000,
      strength: 40,
      property: 50,
      cdTime: 0,
      prepareTime: 800,
      dizzyTime: 4000,
    }
  ],

  /*props*/
  propPrepareTime: 300,
  propPos: [
    { xMin: 350 + 30,       xMax: 350 + 600,       yMin: 250 + 30,       yMax: 250 + 200 },
    { xMin: 350 + 200 + 30, xMax: 350 + 200 + 600, yMin: 250 + 30,       yMax: 250 + 200 },
    { xMin: 350 + 30,       xMax: 350 + 600,       yMin: 250 + 200 + 30, yMax: 250 + 200 + 200},
    { xMin: 350 + 200 + 30, xMax: 350 + 200 + 600, yMin: 250 + 200 + 30, yMax: 250 + 200 + 200},
  ],
  props: {
    "blood": {
      birthTime: 6000,
      birthP: 0.5,
      width: 30,
      height: 30,
      valueMin: 20, //percent
      valueMax: 50, //percent
      image: "/images/blood.png",
    },
    "property": {
      init:[
        {
          birthP: 1,
          valueMin: 10,
          valueMax: 12,
        },
        {
          birthP: 0.5,
          valueMin: 5,
          valueMax: 8,
        },
      ],
      running: [
        {
          birthP: 1,
          valueMin: 13,
          valueMax: 18,
        },
        {
          birthP: 0.1,
          valueMin: 30,
          valueMax: 35,
        },
      ],
      names: [
        "WA",
        "TLE",
        "RE",
      ],
      width: 40,
      height: 40,
      valueMin: 0.2,
      valueMax: 0.5,
      recoverLimit: 50,
      recover: 0.04,
      birthTime: 6000,
      images: [
        "/images/wa.png",
        "/images/tle.png",
        "/images/re.png",
      ],
    },
    "death": {
      width: 90,
      height: 90,
      value: 2,
      image: "/images/grave.png",
    },
  },

  /*ai*/
  keysAmount: 5,
  targetMax: 100,
  attackingRange: 1,
  xRange: -0.01,
  randomRange: 400,
  aiAmount: 1,
};
