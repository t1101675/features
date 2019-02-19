<template>
  <transition name="fade">
    <div class="main" v-show="show" @click="mainClick">
      <div class="background">
        <div class="center-div">
          <div v-for="line in message">{{ line }}</div>
          <div>
            <el-button @click="hide" v-if="show_button">OK</el-button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
  export default {
    name: "overlay",
    data() {
      return {
        message: ['default message'],
        show: false,
        show_button: false,
        closable: true,
      }
    },
    methods: {
      showMessage(message, button, closable) {
        this.message = message.split('\n');
        this.show = true;
        this.show_button = button;
        this.closable = closable;
      },
      showTimeoutMessage(message, time) {
        return new Promise(resolve => {
          this.showMessage(message);
          setTimeout(() => {
            this.hide();
            resolve()
          }, time);
          this.show_button = false;
          this.closable = true;
        });
      },
      hide() {
        this.show = false;
      },
      mainClick() {
        if (this.closable && !this.show_button) {
          this.hide();
        }
      }
    }
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
    z-index: 10000;
    background-color: rgba(0, 0, 0, 0.7);
  }

  .background {
    display: table-cell;
    vertical-align: middle;
  }

  .center-div {
    color: #eeeeee;
    font-size: 72px;
  }

  .fade-enter-active, .fade-leave-active {
    transition: opacity .5s;
  }

  .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */
  {
    opacity: 0;
  }

  .el-button {
    font-size: 36px;
  }
</style>