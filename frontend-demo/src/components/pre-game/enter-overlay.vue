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
          <el-row>请输入密码</el-row>
          <div style="width: 100%; margin: auto">
            <el-row>
              <el-input v-model="password"
                        placeholder="" clearable></el-input>
            </el-row>
          </div>
          <div style="margin-top: 2vh">
            <el-button
                :disabled="button_disabled"
                style="width: 100%; font-size: 2vh"
                type="primary" plain @click="submit">OK
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
    data() {
      return {
        show_overlay: false,
        show_content: false,
        show_transition: false,
        password: '',
        button_disabled: false,
      };
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
        this.$parent.sendJoinRequest(this.$parent.request_join, this.password)
            .then(() => this.quit())
            .catch(() => {
              this.password = '';
              this.quit()
            });
      },
      quit() {
        this.show_overlay = false;
        this.show_content = false;
        delete this.$parent.request_join;
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

  .bubble {
    position: absolute;
    width: 100%;
    left: 0;
    bottom: 0;
    background-color: white;
  }

  .el-row {
    margin-bottom: 10px;
    color: rgba(0, 0, 0, 0.8);
  }

  .setting-button {
    padding: 1vh 2vh;
  }
</style>