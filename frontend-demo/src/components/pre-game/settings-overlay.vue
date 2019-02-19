<template>
  <transition name="el-fade-in">
    <div class="main" v-show="show_overlay">
      <div class="background" @click="onClick">
        <div :class="{
               'center-div-transition': show_transition,
               'center-div': true,
               'center-div-visible': show_content,
               'center-div-hide': !show_content,
             }"
             id="content">
          <el-row>房间人数（1-20）</el-row>
          <div style="width: 180px; margin: auto">
            <el-row>
              <div class="bubble"></div>
              <el-input-number v-model="local_settings.max_player"
                               :min="1" :max="20"
                               label="房间人数"></el-input-number>
            </el-row>
          </div>
          <el-row>密码（<10字符）</el-row>
          <div style="width: 180px; margin: auto">
            <el-row>
              <el-input v-model="local_settings.lobby_password"
                        maxlength="10"
                        placeholder="留空则无密码" clearable></el-input>
            </el-row>
          </div>
          <div style="margin-top: 2vh">
            <el-button style="width: 100%; font-size: 2vh" type="primary" plain
                       @click="submit" :disabled="button_disabled">OK
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>

  export default {
    name: "lobby-settings",
    props: {
      isTest: false,
    },
    data() {
      return {
        show_overlay: false,
        show_content: false,
        show_transition: false,

        button_disabled: false,

        // 这是已经提交到服务器确认的数据
        confirmed_settings: {},

        // 这是本地页面的数据
        local_settings: {
          max_player: 10,
          lobby_password: '',
        },

        parent: undefined,
        pomelo: undefined,
      };
    },
    beforeMount() {
      this.pomelo = this.$store.state.pomelo;
      if (!this.isTest) {
        this.parent = this.$parent;
        this.alert = alert;
      }
      else {
        this.parent = this.$store.state.parent;
        this.alert = this.$store.state.alert
      }
    },
    methods: {
      onClick(mouseEvent) {
        for (let cur = mouseEvent.target; cur; cur = cur.parentElement) {
          if (cur.id === 'content') {
            return;
          }
        }
        this.quit();
      },
      show() {
        this.local_settings = this.confirmed_settings;
        this.show_transition = false;
        this.show_overlay = true;
        this.button_disabled = false;
        setTimeout(() => {
          this.show_content = false;
          setTimeout(() => {
            this.show_transition = true;
            setTimeout(() => {
              this.show_content = true;
            }, 5);
          }, 5);
        }, 5);
      },
      submit() {
        this.button_disabled = true;
        this.pomelo.request('connector.entryHandler.changeLobbySettings', this.local_settings,
            ret => {
              switch (ret.code) {
                case 200:
                case 412:
                  this.parent.readLobbyStatus(ret.lobby);
                  this.parent.queryLobby();
                  this.parent.lobby_password = this.local_settings.lobby_password;
                  console.log('change settings success');
                  this.quit();
                  return;
                default:
                  this.parent.$parent.showErrorMessage(ret);
              }
            });
        this.quit();
      },
      quit() {
        this.show_overlay = false;
        this.show_content = false;
      }
    },
  }
</script>

<style scoped>
  .main {
    position: fixed;
    display: table;
    width: 100vw;
    height: 100vh;
    left: 0;
    top: 0;
    z-index: 20;
    background-color: rgba(0, 0, 0, 0.5);
  }

  .background {
    display: table-cell;
    vertical-align: middle;
  }

  .center-div {
    background-color: rgba(255, 255, 255, 0.9);
    margin: 0 auto 10vh auto;
    padding: 3vh;
    text-align: left;
    width: 20vh;
    font-size: 2vh;
    border-radius: 1vh;
  }

  .center-div-transition {
    -webkit-transition: ease 500ms;
    -moz-transition: ease 500ms;
    -ms-transition: ease 500ms;
    -o-transition: ease 500ms;
    transition: ease 500ms;
  }

  .center-div-visible {
    -webkit-transform: rotateX(0);
    -moz-transform: rotateX(0);
    -ms-transform: rotateX(0);
    -o-transform: rotateX(0);
    transform: rotateX(0);
  }

  .center-div-hide {
    -webkit-transform: rotateX(60deg);
    -moz-transform: rotateX(60deg);
    -ms-transform: rotateX(60deg);
    -o-transform: rotateX(60deg);
    transform: rotateX(60deg);
  }

  #content > div {
    width: 100% !important;
  }

  .bubble {
    position: absolute;
    width: 100%;
    left: 0;
    bottom: 0;
    background-color: white;
  }

  .el-row {
    margin-bottom: 1vh;
  }

  .setting-button {
    padding: 1vh 2vh;
  }
</style>