<template>
  <div class="main">
    <transition name="el-fade-in">
      <div class="hint" @click="show" v-show="show_hint">
        <div class="hint-icon" @click="show" :class="{
        'hint-icon-off': opened,
        'hint-active': hint_active,
        }"></div>
      </div>
    </transition>
    <div class="drop" :class="{
        'drop-open': opened,
        'drop-closed': !opened,
        }">
      <div id="background"></div>
      <div :class="{
          'center': component,
          'center-on': show_component,
          'center-off': !show_component,
          }">
        <component :is="component" ref="component"></component>
      </div>
      <transition name="el-fade-in">
        <div class="bottom-hint" @click="hide" v-show="hidable"></div>
      </transition>
      <div class="bottom-hint-icon" @click="hide" :class="{
          'bottom-hint-icon-off': !opened,
         }" :style="{ cursor: opened ? 'pointer' : 'default' }" v-show="hidable"></div>
    </div>
  </div>
</template>

<script>
  import Login from "./login.vue";
  import UserInfo from "./userinfo.vue";

  export default {
    name: "drop-down",
    components: {
      login: Login,
      userInfo: UserInfo
    },
    data() {
      return {
        opened: false,
        component: undefined,
        show_component: true,
        show_hint: false,
        hint_active: false, //用于显示提示动画
        hidable: false, //用户是否可以直接关闭
      };
    },
    methods: {
      geturls(item) {//图片链接
        //console.log("fileurls" + item.fileurls);
        return "https://featuresgame.tk:8001/" + item.fileurls.replace(/^\//, '');
      },
      loginComplete() {
        this.changeComponent("userInfo");
        this.hidable = true;
        this.$emit('loginComplete')
      },
      showHint() {
        this.hint_active = true;
        setTimeout(() => (this.hint_active = false), 1300);
      },
      show() {
        this.opened = true;
      },
      hide() {
        if (this.opened) {
          this.opened = false;
          setTimeout(() => this.showHint(), 700);
        }
      },
      changeComponent(name) {
        if (this.component === undefined) {
          this.component = name;
          if (name !== undefined) {
            this.show_component = true;
          }
          return;
        }
        this.show_component = false;
        setTimeout(() => {
          this.component = name;
          if (name !== undefined) {
            this.show_component = true;
          }
        }, 700);
      },
      requireLogin() {
        this.opened = true;
        this.hidable = false;
        this.component = "login";
      }
    },
    mounted() {
      window.addEventListener("mousemove", (e) => {
        let val = e.y / 600;
        val = 0.4 - (val > 0.4 ? 0.4 : val);
        document.querySelector('.hint').style.setProperty('--y', val);
      });
      /*window.addEventListener('mousewheel', ev => {
          if (ev.deltaY <= -40) {
            this.show();
          } else if (ev.deltaY >= 40) {
            if (this.hidable) {
              this.hide();
            }
          }
        }, true);*/
      //this.getavatar()
    }
  };
</script>

<style scoped>
  .main {
    color: rgba(255, 255, 255, 0.9);
  }

  .hint {
    position: fixed;
    cursor: pointer;
    height: 6vh;
    min-height: 30px;
    width: 100vw;
    --y: 0;
    top: 0;
    left: 0;
    z-index: 100;
    background-image: linear-gradient(
        to bottom,
        rgba(0, 0, 0, var(--y)),
        rgba(0, 0, 0, 0)
    );
  }

  .hint-icon {
    background: no-repeat center url("/images/ui/drop-down.png");
    background-size: 7vh 2vh;
    height: 100%;
    z-index: 1000;
    cursor: pointer;
    position: absolute;
    width: 7vh;
    left: 50vw;
    -webkit-transform: translateX(-50%);
    -moz-transform: translateX(-50%);
    -ms-transform: translateX(-50%);
    -o-transform: translateX(-50%);
    transform: translateX(-50%);
    top: -100%;
    -webkit-transition: ease-out 300ms;
    -moz-transition: ease-out 300ms;
    -ms-transition: ease-out 300ms;
    -o-transition: ease-out 300ms;
    transition: ease-out 300ms;
  }

  .hint:hover > .hint-icon,
  .hint-active {
    top: 0;
  }

  .hint-icon-off {
    top: 200% !important;
    opacity: 0 !important;
  }

  .hint-icon:hover {
    top: 20% !important;
  }

  .bottom-hint {
    position: absolute;
    cursor: pointer;
    height: 4vh;
    min-height: 30px;
    width: 100vw;
    top: 96vh;
    left: 0;
    z-index: 100;
    background-image: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0),
        rgba(0, 0, 0, 0.5)
    );
  }

  .bottom-hint-icon {
    background: no-repeat center url("/images/ui/drop-down.png");
    background-size: 7vh 2vh;
    cursor: pointer;
    height: 4vh;
    position: fixed;
    top: 96vh;
    width: 7vh;
    left: 50vw;
    -webkit-transform: translateX(-50%) rotateZ(180deg);
    -moz-transform: translateX(-50%) rotateZ(180deg);
    -ms-transform: translateX(-50%) rotateZ(180deg);
    -o-transform: translateX(-50%) rotateZ(180deg);
    transform: translateX(-50%) rotateZ(180deg);
    -webkit-transition: ease-out 300ms;
    -moz-transition: ease-out 300ms;
    -ms-transition: ease-out 300ms;
    -o-transition: ease-out 300ms;
    transition: ease-out 300ms;
    z-index: 1000;
  }

  .bottom-hint-icon:hover {
    top: 95vh;
  }

  .bottom-hint-icon-off {
    top: 92vh !important;
    opacity: 0 !important;
  }

  .drop {
    position: fixed;
    width: 100vw;
    top: 0;
    left: 0;
    z-index: 101;
    overflow: hidden;
    -webkit-transition: ease 1000ms;
    -moz-transition: ease 1000ms;
    -ms-transition: ease 1000ms;
    -o-transition: ease 1000ms;
    transition: ease 1000ms;
    transform-origin: 50% -50%;
  }

  .drop-open {
    height: 100vh;
  }

  .drop-closed {
    height: 0 !important;
  }

  .center {
    position: absolute;
    top: 50%;
    left: 50%;
    vertical-align: middle;
    transform-origin: 50% 50%;
  }

  .center-on {
    opacity: 1;
    -webkit-transform: rotateX(0) translate(-50%, -50%);
    -moz-transform: rotateX(0) translate(-50%, -50%);
    -ms-transform: rotateX(0) translate(-50%, -50%);
    -o-transform: rotateX(0) translate(-50%, -50%);
    transform: rotateX(0) translate(-50%, -50%);
    -webkit-transition: ease-out 700ms;
    -moz-transition: ease-out 700ms;
    -ms-transition: ease-out 700ms;
    -o-transition: ease-out 700ms;
    transition: ease-out 700ms;
  }

  .center-off {
    opacity: 0;
    -webkit-transform: rotateX(90deg) translate(-50%, -50%);
    -moz-transform: rotateX(90deg) translate(-50%, -50%);
    -ms-transform: rotateX(90deg) translate(-50%, -50%);
    -o-transform: rotateX(90deg) translate(-50%, -50%);
    transform: rotateX(90deg) translate(-50%, -50%);
    -webkit-transition: ease-in 700ms;
    -moz-transition: ease-in 700ms;
    -ms-transition: ease-in 700ms;
    -o-transition: ease-in 700ms;
    transition: ease-in 700ms;
  }

  .drop-closed > #background {
    opacity: 0;
  }

  .drop-closed > .center {
    opacity: 0.5;
  }

  .drop-open > #background, .drop-open > .center {
    opacity: 1;
  }

  #background {
    position: absolute;
    top: 0;
    left: 0;
    background: url('/images/ui/back.jpg') no-repeat center;
    background-size: cover;
    height: 100vh;
    width: 100vw;
    z-index: -1;
    -webkit-transition: ease 700ms;
    -moz-transition: ease 700ms;
    -ms-transition: ease 700ms;
    -o-transition: ease 700ms;
    transition: ease 700ms;
  }

  #background:after {
    content: "";
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    height: 100vh;
    width: 100vw;
    z-index: 0;
    background: rgba(0, 0, 0, 0.4);
  }
</style>