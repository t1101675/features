<template>
  <div class="main" id="main">
    <overlay-layer ref="overlay"></overlay-layer>
    <drop-down ref="drop_down" v-on:loginComplete="loginComplete"></drop-down>

    <div style="width: 100%; height: 100%" :class="{
    'center-helper': true,
    'transition-in': component_transition === 'in',
    'transition-out': component_transition === 'out',
    'transition-none': component_transition === 'none',
    'component-out': component_display_status === 'out',
    'component-in': component_display_status === 'in',
    'component-active': component_display_status === 'active',
    }">
      <div :is="current_component" v-on:mounted="onChildComponentMounted"></div>
    </div>
  </div>
</template>

<script>
  let wait = async function (duration) {
    return new Promise(resolve => {
      setTimeout(() => resolve(), duration);
    })
  };
  import Hall from "./pre-game/hall.vue";
  import Lobby from "./pre-game/lobby.vue";
  import Overlay from "./overlay.vue";
  import Game from './game.vue';
  import DropDown from './drop-down/drop-down.vue';
  import Victory from './post-game/victory.vue';
  import axios from '../axios';

  export default {
    name: "test",
    props: {
      isTest: false,
      isTest2: false
    },
    data() {
      return {
        pomelo: undefined,
        
        //当前显示的组件
        current_component: undefined,

        //用于组件切换动画
        component_display_status: 'in',
        component_transition: 'in',

        loginComplete: () => {
        },
      };
    },
    created() {
      document.body.style.margin = "0";
    },
    beforeMount() {
      this.pomelo = this.$store.state.pomelo;
    },
    mounted() {
      let login_promise = true;

      //尝试从cookies中加载保存的用户名和密码并登陆
      /*
      理论上讲，这样做是不安全的，cookies不应该在js里面操作，而是应当服务器的http response来修改
      但是我们登录连接的服务器和浏览页面的服务器不是一个地址，没法用自动的http cookies
      所以只能用此下策，js来读写cookies
      cookies存明文密码真刺激XD
       */
      let username = document.cookie.replace(/(?:(?:^|.*;\s*)featuresuid\s*=\s*([^;]*).*$)|^.*$/, "$1");
      let password = document.cookie.replace(/(?:(?:^|.*;\s*)featurespass\s*=\s*([^;]*).*$)|^.*$/, "$1");
      if(this.isTest2){
        username = "123"
        password = "11234"
      }
      if (username !== '' && password !== '') {
        console.log('检测到cookies，尝试自动登录');
        this.$refs.overlay.showMessage('自动登录中，请稍后…', false, false);
        login_promise = axios.userLogin({username, password}).then(({data}) => {
          return new Promise(resolve => {
            if (data.info_code === 0) {
              this.$store.dispatch("UserLogin", data.token);
              this.$store.dispatch("UserName", data.username);
              this.$store.commit('NICKNAME', data.nickname);
              this.$refs.drop_down.show_hint = true;
              this.$refs.drop_down.loginComplete();
              this.$refs.overlay.showMessage('登陆成功，加载中…', false, false);
              resolve();
            } else {
              //登录失败，清除cookies
              console.log('自动登录失败，清除cookies');
              document.cookie = "featuresuid=;path=/";
              document.cookie = "featurespass=;path=/";
              this.$refs.overlay.showTimeoutMessage('登陆失败\n请重新输入密码', 2000);
              //展开登录菜单
              this.$refs.drop_down.requireLogin();
              this.loginComplete = () => {
                this.loginComplete = () => {
                };
                this.$refs.drop_down.show_hint = true;
                wait(700).then(() => resolve());
              };
              if(this.isTest)
              {
                this.loginComplete()
                resolve()
              }
            }
          });
        });
      } else {
        //展开登录菜单
        wait(10).then(() => this.$refs.drop_down.requireLogin());
        //登录作为一个pending promise
        login_promise = new Promise(resolve => {
          //登录之后
          this.loginComplete = () => {
            this.loginComplete = () => {
            };
            this.$refs.drop_down.show_hint = true;
            wait(700).then(() => resolve());
          };
          if(this.isTest)
          {
            this.loginComplete()
            resolve()
          }
        });
      }

      //当登陆完成并且加载了依赖的js文件之后
      Promise.all([login_promise, this.loadScripts()])
          .then(() => {
            //注意这里！！！
            //pomelo是在上面这个loadScripts()中才被添加到head里面的
            if (!this.isTest) {
              this.$store.commit('setPomelo', pomelo);
              this.pomelo = pomelo;
            }
          })
          //连接至game-server
          .then(() => this.initConnection())
          .then(() => {
            //初始化各种设置
            this.pomelo.on('onGameEnd', data => {
              this.$store.commit('victory');
              this.changeComponent('victory', 'reverse');
            });
            this.pomelo.on('disconnect', () => {
              this.$refs.overlay.showMessage('连接中断，正在尝试重新连接…', false, false);
              this.onReconnect = () => location.reload();
            });
            this.$refs.drop_down.hide();
            this.$refs.overlay.hide();
            this.changeComponent('hall');
          });

    },
    methods: {
      /**
       * 在加载页面时调用，为页面添加pomelo和socketIO两个js文件
       */
      loadScripts() {
        let pomelo_script_promise = new Promise(resolve => {
          let pomeloScript = document.createElement('script');
          console.log('loading pomelo script');
          pomeloScript.setAttribute('src', '/js/lib/pomeloclient.js');
          document.head.appendChild(pomeloScript);
          pomeloScript.onload = () => {
            console.log('pomelo script loaded');
            resolve();
          };
          if(this.isTest)
            pomeloScript.onload()
        });
        let sio_script_promise = new Promise(resolve => {
          let sioScript = document.createElement('script');
          console.log('loading sio script');
          sioScript.setAttribute('src', '/js/lib/socket.io.js');
          document.head.appendChild(sioScript);
          sioScript.onload = () => {
            console.log('sio script loaded');
            resolve();
          };
          if(this.isTest)
            sioScript.onload()
        });
        return Promise.all([pomelo_script_promise, sio_script_promise]);
      },
      /**
       * 初始化和game-server的长连接
       */
      initConnection() {
        return new Promise(resolve => {
          let route = 'gate.gateHandler.queryEntry';
          this.pomelo.init({
            host: "featuresgame.tk",
            port: "3014",
            log: true,
          }, () => {
            this.pomelo.request(route, {username: this.$store.state.username}, data => {
              this.pomelo.disconnect();
              this.pomelo.init({
                host: "featuresgame.tk",
                port: data.port,
                log: true
              }, () => {
                let route = "connector.entryHandler.login";
                this.pomelo.request(route, {
                  username: this.$store.state.username,
                }, () => {
                  console.log("login succeed");
                  this.serverConnected = true;
                  resolve();
                });
                if (typeof this.onReconnect !== 'undefined') {
                  this.onReconnect();
                }
              });
            });
          });
        });
      },
      /**
       * 切换当前的component
       * @param name 新的component的名字
       * @param reverse_animation 是否反向动画（反向动画一般表示退出某一界面）
       */
      changeComponent(name, reverse_animation) {
        //将上一个组件所注册的pomelo监听清除掉
        if (this.current_component) {
          this.$store.commit('clearOnReceive', this.current_component);
        }
        //这两个页面不显示下拉
        if (name === 'victory' || name === 'game') {
          this.$refs.drop_down.show_hint = false;
          this.$refs.drop_down.hide();
        }

        if (name === 'game') {
          this.$refs.overlay.showMessage('游戏加载中…', false, false);
        }

        //具体实现动画在此
        if (reverse_animation === 'reverse') {
          this.component_transition = 'out';
          this.component_display_status = 'in';
          wait(480).then(() => {
            this.onChildComponentMounted = () => {
              if (name === 'game') {
                this.$refs.overlay.hide();
              }
              wait(10).then(() => {
                this.component_transition = 'in';
                this.component_display_status = 'active';
              });
            };
            this.component_transition = 'none';
            wait(10).then(() => {
              this.current_component = name;
              this.component_display_status = 'out';
            });
          });
        } else {
          this.component_transition = 'out';
          this.component_display_status = 'out';
          wait(480).then(() => {
            this.onChildComponentMounted = () => {
              if (name === 'game') {
                this.$refs.overlay.hide();
              }
              wait(10).then(() => {
                this.component_transition = 'in';
                this.component_display_status = 'active';
              });
            };
            this.component_transition = 'none';
            wait(10).then(() => {
              this.current_component = name;
              this.component_display_status = 'in';
            });
          });
        }
      },
      /**
       * 当component加载完成后会调用
       * 如果要设置回调，就为此元素赋值即可
       */
      onChildComponentMounted: () => {
      },
      /**
       * 显示服务器返回的错误信息
       * @param ret 由服务器返回，code !== 200
       */
      showErrorMessage(ret) {
        this.$refs.overlay.showTimeoutMessage(
            "Error " + ret.code + ": " + ret.info,
            3000
        ).then(() => {
          //location.reload();
        });
      }
    },
    components: {
      hall: Hall,
      lobby: Lobby,
      overlayLayer: Overlay,
      game: Game,
      dropDown: DropDown,
      victory: Victory,
    }
  };
</script>

<style scoped>
  #main {
    display: table;
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 100vw;
  }

  .center-helper {
    display: table-cell;
    vertical-align: middle;
  }

  .transition-none {
    -webkit-transition: 0ms;
    -moz-transition: 0ms;
    -ms-transition: 0ms;
    -o-transition: 0ms;
    transition: 0ms;
  }

  .transition-in {
    -webkit-transition: ease-out 500ms;
    -moz-transition: ease-out 500ms;
    -ms-transition: ease-out 500ms;
    -o-transition: ease-out 500ms;
    transition: ease-out 500ms;
    -webkit-transform-origin: 50% 50%;
    -moz-transform-origin: 50% 50%;
    -ms-transform-origin: 50% 50%;
    -o-transform-origin: 50% 50%;
    transform-origin: 50% 50%;
  }

  .transition-out {
    -webkit-transition: ease-in 500ms;
    -moz-transition: ease-in 500ms;
    -ms-transition: ease-in 500ms;
    -o-transition: ease-in 500ms;
    transition: ease-in 500ms;
    -webkit-transform-origin: 50% 50%;
    -moz-transform-origin: 50% 50%;
    -ms-transform-origin: 50% 50%;
    -o-transform-origin: 50% 50%;
    transform-origin: 50% 50%;
  }

  .component-out {
    -webkit-transform: perspective(300vh) translate3d(0, 0, 0) rotateX(-90deg);
    -moz-transform: perspective(300vh) translate3d(0, 0, 0) rotateX(-90deg);
    -ms-transform: perspective(300vh) translate3d(0, 0, 0) rotateX(-90deg);
    -o-transform: perspective(300vh) translate3d(0, 0, 0) rotateX(-90deg);
    transform: perspective(300vh) translate3d(0, 0, 0) rotateX(-90deg);
    opacity: 0;
  }

  .component-active {
    -webkit-transform: perspective(300vh) translate3d(0, 0, 0) rotateX(0);
    -moz-transform: perspective(300vh) translate3d(0, 0, 0) rotateX(0);
    -ms-transform: perspective(300vh) translate3d(0, 0, 0) rotateX(0);
    -o-transform: perspective(300vh) translate3d(0, 0, 0) rotateX(0);
    transform: perspective(300vh) translate3d(0, 0, 0) rotateX(0);
    opacity: 1;
  }

  .component-in {
    -webkit-transform: perspective(300vh) translate3d(0, 0, 0) rotateX(90deg);
    -moz-transform: perspective(300vh) translate3d(0, 0, 0) rotateX(90deg);
    -ms-transform: perspective(300vh) translate3d(0, 0, 0) rotateX(90deg);
    -o-transform: perspective(300vh) translate3d(0, 0, 0) rotateX(90deg);
    transform: perspective(300vh) translate3d(0, 0, 0) rotateX(90deg);
    opacity: 0;
  }
</style>


<!--
全局的style用来重载elementUI的丑陋设计
-->
<style>

  .el-button {
    padding: 1.5vh !important;
    border-radius: 0.5vh !important;
    border-width: 0.1vh !important;
    -webkit-transition: ease 200ms !important;
    -moz-transition: ease 200ms !important;
    -ms-transition: ease 200ms !important;
    -o-transition: ease 200ms !important;
    transition: ease 200ms !important;
  }

  .el-button + .el-button {
    margin-left: 2vh !important;
  }

  .el-form-item__label, .el-input {
    font-size: 2vh !important;
  }

  .el-form-item__label {
    width: 12vh !important;
    line-height: 5vh !important;
  }

  .el-form-item__content {
    margin-left: 12vh !important;
    line-height: 5vh !important;
  }

  .el-form-item__error {
    padding-top: 0.5vh !important;
    font-size: 1.5vh !important;
  }

  .el-form-item {
    height: 5vh !important;
    padding-bottom: 2vh !important;
    margin-bottom: 2vh !important;
  }

  .el-input {
    height: 5vh !important;
  }

  .el-input__inner {
    position: absolute !important;
    left: 0 !important;
    height: 5vh !important;
    line-height: 3vh !important;
    padding: 1vh 1.5vh !important;
    border-radius: 0.5vh !important;
  }

  .el-input__inner {
    border-width: 0.1vh !important;
  }

  .el-input-number {
    width: 100% !important;
  }

  .el-input-number__increase, .el-input-number__decrease {
    height: 4.7vh !important;
    border-radius: 0.5vh !important;
    border: none;
    top: 0.15vh !important;
    font-size: 2vh !important;
    line-height: 4.7vh !important;
    width: 4.7vh !important;
  }

  .el-input-number__increase {
    right: 0.15vh !important;
  }

  .el-input-number__decrease {
    left: 0.15vh !important;
  }

  .el-input-group__append {
    border: none !important;
    padding: 0 !important;
  }

  .el-input-group__append button.el-button--primary {
    background-color: #409EFF !important;
    color: white !important;
    height: 5vh !important;
    line-height: 3vh !important;
    padding: 1vh 1.5vh !important;
    border-radius: 0.5vh !important;
    border: none !important;
    margin: 0 !important;
  }

  .el-input-group__append button.el-button--primary:hover {
    background-color: #78aff9 !important;
    border-color: #78aff9 !important;
  }

  .el-tabs__header {
    margin-bottom: 2vh !important;
  }

  .el-tabs__item {
    font-size: 2.5vh !important;
    height: 5vh !important;
    line-height: 3vh !important;
  }

  .el-tabs__nav-wrap::after, .el-tabs__active-bar {
    height: 0.5vh !important;
  }

  .el-checkbox {
    height: 3vh !important;
  }

  .el-checkbox__label {
    font-size: 2vh !important;
    line-height: 3vh !important;
    padding-left: 1vh !important;
  }

  .el-form > .el-button {
    font-size: 2vh !important;
    line-height: 3vh !important;
    padding: 1vh 1.5vh !important;
    border-radius: 0.5vh !important;
  }

  .el-popover {
    min-width: 16vh !important;
    max-width: 16vh !important;
    padding: 2vh !important;
    text-align: center;
  }

  .el-upload {
    width: 100%;
  }

  .default-transition {
    -webkit-transition: ease 500ms;
    -moz-transition: ease 500ms;
    -ms-transition: ease 500ms;
    -o-transition: ease 500ms;
    transition: ease 500ms;
  }

  .el-collapse {
    border: none !important;
  }

  .el-collapse-item__header {
    position: relative !important;
    background: none !important;
    height: 8vh !important;
    line-height: 8vh !important;
    font-size: 3vh !important;
    border-top: none !important;
    color: rgba(255, 255, 255, 0.9) !important;
  }

  .el-collapse-item__header::after {
    border-bottom: 1px solid rgba(255, 255, 255, 0.8) !important;
  }

  .el-collapse-item__arrow {
    line-height: 8vh !important;
    margin-right: 3vh !important;
    position: absolute !important;
    right: 0 !important;
  }

  .el-collapse-item__wrap {
    background: rgba(255, 255, 255, 0.8) !important;
    border-radius: 1vh !important;
    border: none !important;
  }

  .el-collapse-item__content {
    padding: 2vh 0 !important;
    font-size: 2vh !important;
  }

  .el-carousel__mask {
    background: none !important;
  }

  .is-after {
    overflow: hidden;
  }
</style>