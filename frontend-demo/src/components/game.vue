<template>
  <div class="main">
    <div id="testdiv">
      <div class="bottom-bar">
        <div id="hp-display">
          <div style="width: 100px; background: red; position: absolute; bottom: 0"
               :style="{height: my_status.hp + 'px'}">
          </div>
          <span id="hp-num">
            {{ Math.floor(my_status.hp) }}
          </span>
        </div>
        <div class="property-display" id="wa-display">
          <span id="wa-num">
            {{ this.my_status.property[0] }}
          </span>
        </div>
        <div class="property-display" id="tle-display">
          <span id="tle-num">
            {{ this.my_status.property[1] }}
          </span>
        </div>
        <div class="property-display" id="re-display">
          <span id="re-num">
            {{ this.my_status.property[2] }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  export default {
    props: {
      isTest: false
    },
    components: {},
    data() {
      return {
        parent: undefined,
        sendVal: false,
        my_status: {
          hp: 100,
          property: [0, 0, 0],
        }
      };
    },
    beforeMount() {
      if (!this.isTest) {
        this.parent = this.$parent;
      } else {
        this.parent = this.$store.state.parent;
      }
      window.gameLoadCallback = () => {
        window.onresize();
        this.$emit('mounted');
      };
      this.loadDependencies()
          .then(() => this.loadWP())
          .then(() => this.loadGameMain())
          .then(() => {
            console.log('all scripts loaded');
            let start_script = document.createElement('script');
            console.log('loading start script');
            start_script.setAttribute('src', '/start.js');
            start_script.setAttribute('type', 'module');
            document.head.appendChild(start_script);
            start_script.onload = (() => {
              console.log('start script loaded');
              pomelo.on('onGameMsg', ({name, data}) => {
                if (name === 'gameInfo') {
                  let me = data.heroes.find(h => h.name === this.$store.state.username);
                  if (!me) {
                    return;
                  }
                  this.my_status = me;
                } else if (name === 'gameStart') {
                  this.onGameStart();
                } else if (name === 'someoneLose') {
                  this.$store.dispatch('gameEnd', data);
                }
              });
            });
            if (this.isTest)
              start_script.onload()
          }).catch(console.log);
    },
    mounted() {
      console.log('game mounted');
    },
    methods: {
      onGameStart() {
        window.onresize();
      },
      loadMain() {
        return new Promise((resolve, reject) => {
          let main_script = document.createElement('script');
          console.log('loading main script');
          main_script.setAttribute('src', '/js/main.js');
          main_script.setAttribute('type', 'module');
          document.head.appendChild(main_script);
          main_script.onload = () => {
            console.log('main script loaded');
            resolve();
          };
          if (this.isTest)
            main_script.onload()
        });
      },
      loadJS() {
        return new Promise((resolve, reject) => {
          let sio_script = document.createElement('script');
          console.log('loading sio script');
          sio_script.setAttribute('src', '/js/lib/socket.io.js');
          document.head.appendChild(sio_script);
          sio_script.onload = () => {
            console.log('sio script loaded');
            resolve();
          };
          if (this.isTest)
            sio_script.onload()
        }).then(() => {
          return new Promise((resolve, reject) => {
            let pomelo_script = document.createElement('script');
            console.log('loading pomelo script');
            pomelo_script.setAttribute('src', '/js/lib/pomeloclient.js');
            document.head.appendChild(pomelo_script);
            pomelo_script.onload = () => {
              console.log('pomelo script loaded');
              resolve();
            };
            if (this.isTest)
              pomelo_script.onload()
          });
        });
      },
      loadGameMain() {
        return new Promise((resolve, reject) => {
          let gameMain_script = document.createElement('script');
          console.log('loading gameMain script');
          gameMain_script.setAttribute('src', '/game/gameMain.js');
          gameMain_script.setAttribute('type', 'module');
          document.head.appendChild(gameMain_script);
          gameMain_script.onload = (() => {
            console.log('gameMain script loaded');
            resolve();
          });
          if (this.isTest)
            gameMain_script.onload()
        });
      },
      loadDependencies() {
        let pixi_script_promise = new Promise(resolve => {
          let pixi_script = document.createElement('script');
          console.log('loading pixi script');
          pixi_script.setAttribute('src', '/scripts/pixi.min.js');
          pixi_script.setAttribute('language', 'javascript');
          document.head.appendChild(pixi_script);
          pixi_script.onload = () => {
            console.log('pixi script loaded');
            resolve();
          };
          if (this.isTest)
            pixi_script.onload()
        });
        let core_script_promise = new Promise(resolve => {
          let core_script = document.createElement('script');
          console.log('loading core script');
          core_script.setAttribute('src', '/scripts/core.js');
          core_script.setAttribute('language', 'javascript');
          document.head.appendChild(core_script);
          core_script.onload = () => {
            console.log('core script loaded');
            resolve();
          };
          if (this.isTest)
            core_script.onload()
        });
        let modules_script_promise = new Promise(resolve => {
          let modules_script = document.createElement('script');
          console.log('loading modules script');
          modules_script.setAttribute('src', '/scripts/modules.js');
          modules_script.setAttribute('language', 'javascript');
          document.head.appendChild(modules_script);
          modules_script.onload = () => {
            console.log('modules script loaded');
            resolve();
          };
          if (this.isTest)
            modules_script.onload()
        });

        return Promise.all([pixi_script_promise, core_script_promise, modules_script_promise]);
      },
      loadWP() {
        return new Promise(resolve => {
          let wp_script = document.createElement('script');
          console.log('loading wp script');
          wp_script.setAttribute('src', '/scripts/wonderpainter.js');
          wp_script.setAttribute('language', 'javascript');
          document.head.appendChild(wp_script);
          wp_script.onload = () => {
            console.log('wp script loaded');
            resolve();
          };
          if (this.isTest) {
            wp_script.onload()
          }
        });
      }
    }
  };
</script>
<style scoped>
  .bottom-bar {
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 100px;
    background: black;
  }

  #hp-display {
    height: 100px;
    width: 100px;
    background: #e1908f;
    position: relative;
    float: left;
  }

  #hp-num, #wa-num, #tle-num, #re-num {
    position: absolute;
    top: 50%;
    left: 50%;
    -webkit-transform: translate(-50%, -50%);
    -moz-transform: translate(-50%, -50%);
    -ms-transform: translate(-50%, -50%);
    -o-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
    font-size: 30px;
  }

  #hp-num {
    color: #3b0000;
  }

  #wa-num {
    color: #cd3800;
  }

  #tle-num {
    color: #0056e1;
  }

  #re-num {
    color: #a99d00;
  }

  .property-display {
    height: 100px;
    width: 100px;
    position: relative;
    float: left;
    margin-left: 10px;
  }

  #wa-display {
    background: rgb(255, 167, 141);
  }

  #tle-display {
    background: rgb(160, 182, 225);
  }

  #re-display {
    background: rgb(225, 218, 119);
  }

</style>

