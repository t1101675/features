<template>
  <div class="main" :style="{
    background: 'url(\'' + $store.state.share.img_src + '\') cover no-repeat'
    }">
    <div class="container">
      <div class="congrats">
        <span style="font-size: 8vh; color: white">{{ this.$store.state.nickname }}</span><br>
        <span style="font-size: 6vh; color: #ffcd2e;">{{ result.rank === 1 ? '大吉大利，软工拿Ｄ！' : '再接再厉，明年争Ｃ！'}}</span><br>
        <span style="font-size: 4vh; color: white">积分：{{ result.score }}</span>
      </div>
      <div class="rank">
        <span style="font-size: 9vh; color: #ffcd2e; vertical-align: 0.3vh">第</span><!--
        --><span style="font-size: 10vh; color: #ffcd2e; vertical-align: 0">{{ result.rank }}</span><!--
        --><span style="vertical-align: 2vh">/{{ result.total }}</span>
      </div>
      <sharing></sharing>
      <div class="buttons">
        <el-button @click="buttonAgain">再来一局</el-button>
      </div>
    </div>
  </div>
</template>

<script>
  import share from './sharing.vue'
  export default {
    name: "victory",
    props: {
      isTest: false,
    },
    components:{
      sharing:share
    },
    data() {
      return {
        result: {
          rank: 1,
          total: 2,
          kill: 1,
          score: 1,
        },
        parent: undefined,
      };
    },
    beforeMount() {
      this.result = this.$store.state.result;
    },
    mounted() {
      if(!this.isTest)
        this.parent = this.$parent
      else 
        this.parent = this.$store.state.parent
      this.$emit('mounted');
    },
    methods: {
      buttonAgain() {
        this.parent.changeComponent(undefined, 'reverse');
        setTimeout(() => location.reload(), 700);
      },
      buttonShare() {
        this.$store.commit('victory');
        this.$router.push('/share');
      },
    },
  }
</script>

<style scoped>
  .main {
    width: 100vw;
    height: 100vh;
    position:fixed;
    top: 0;
    left: 0;
  }

  .container {
    width: 100vw;
    height: 100vh;
    position: fixed;
    top: 0;
    left: 50vw;
    -webkit-transform: translateX(-50%);
    -moz-transform: translateX(-50%);
    -ms-transform: translateX(-50%);
    -o-transform: translateX(-50%);
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.5);
  }

  .congrats {
    position: absolute;
    top: 2vh;
    left: 2vh;
    text-align: left;
  }

  .rank {
    position: absolute;
    top: 2vh;
    right: 2vh;
    font-size: 7vh;
    color: white;
  }

  .buttons {
    position: absolute;
    bottom: 2vh;
    right: 2vh;
    text-align: right;
  }

  .el-button {
    font-size: 4vh;
    background-color: #ffcd2e;
    color: black;
    padding: 3vh;
  }

  .el-button:hover {
    background-color: #ffe9a2;
    color: black;
  }
</style>