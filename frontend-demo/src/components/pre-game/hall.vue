<template>
  <div class="main">
    <enter-overlay ref="overlay"></enter-overlay>
    <h1 style="text-shadow: 0 0 1vh rgba(0, 0, 0, 0.6)">加入游戏房间</h1>
    <el-button @click="createLobby" :disabled="allDisabled || disableCreateButton">创建房间</el-button>
    <p style="text-shadow: 0 0 1vh rgba(0, 0, 0, 0.8)">在线人数：{{ player_count }}</p>
    <hr style="margin: 2vh 0; background-color: rgba(255, 255, 255, 0.5); border: none; height: 0.5vh">
    <div style="width: 120vh; margin: auto">
      <el-carousel :autoplay="false" type="card" height="60vh">

        <el-carousel-item v-if="!hall_status.length">
          <el-container>
            <el-main>
              <h2 style="color: rgba(0, 0, 0, 0.8)">
                现在没有房间<br>赶快创建一个吧
              </h2>
            </el-main>
          </el-container>
        </el-carousel-item>

        <el-carousel-item v-model="hall_status" v-for="(lobby, index) in hall_status" :key="index">
          <el-container>
            <el-header height="10vh">
              <h3>房间编号：{{ lobby.lobby_id }}</h3>
              <h3>玩家数：{{ lobby.players.filter(x => x).length }}/{{ lobby.players.length }}</h3>
            </el-header>

            <el-main>
              <br><br>
              <div style="width: 100%; word-wrap: normal;">
                当前玩家：<br>
                <span v-for="(player, index) in lobby.players" style="text-justify: auto">
                  <span v-if="player">{{ $store.state.known_nicknames[player.uid] || '未知玩家' }}&nbsp;</span>
                </span>
              </div>
            </el-main>

            <el-footer height="5vh">
              <el-button @click="joinLobby(index)" v-if="!lobby.in_game"
                         :disabled="allDisabled">
                <span v-if="lobby.password">🔒</span>
                加入房间
              </el-button>
              <el-button disabled v-if="lobby.in_game">游戏进行中</el-button>
            </el-footer>
          </el-container>
        </el-carousel-item>

      </el-carousel>
    </div>
  </div>
</template>

<script>
  import EnterOverlay from './enter-overlay.vue';

  export default {
    props: {
      //放在这里会被警告，我放到data里面了
      isTest: false,
    },
    components: {
      enterOverlay: EnterOverlay,
    },
    data() {
      return {
        player_count: '-',
        hall_status: {},
        uid: this.$store.state.username,
        scriptsLoaded: false,
        serverConnected: false,
        disableCreateButton: false,
        allDisabled: true,

        pomelo: undefined,
        parent: undefined,
      }
    },
    beforeMount() {
      this.pomelo = this.$store.state.pomelo;
      if (!this.isTest) {
        this.parent = this.$parent;
      }
      else {
        this.parent = this.$store.state.parent;
      }
    },
    mounted() {
      this.$store.dispatch({
        type: 'setOnReceive',
        from: 'hall',
        methods: {
          'hall_status': data => {
            this.readHallStatus(data);
          },
        },
      });
      this.queryHall().then(() => this.$emit('mounted'));
      this.allDisabled = false;
    },
    beforeDestroy() {
      this.$store.commit('clearOnReceive', 'hall');
    },
    methods: {
      createLobby() {
        this.disableCreateButton = true;
        this.pomelo.request('connector.entryHandler.createLobby', {}, ret => {
          console.log('createLobby', ret);
          switch (ret.code) {
            case 200:
              //console.log('successfully created lobby');
              this.allDisabled = true;
              this.$store.commit({
                type: 'joinLobby',
                lobby_id: ret.lobby_id,
                lobby: ret.lobby,
              });
              this.parent.changeComponent('lobby');
              return;
            case 503:
              this.$message({
                type:"error",
                message:'创建房间失败，房间数量已达服务器上限'
              });
              this.disableCreateButton = false;
              return;
            default:
              //console.log(ret);
              this.$message({
                type:"error",
                message:ret.info
              });
          }
        });
      },
      /**
       * 点击加入房间按钮
       */
      joinLobby(index) {
        if (this.hall_status[index].password) {
          this.$refs.overlay.show();
          this.request_join = this.hall_status[index].lobby_id;
          return;
        }
        //console.log('joinLobby(' + id + ')');
        this.sendJoinRequest(this.hall_status[index].lobby_id);
      },
      /**
       * 向后端发送加入房间请求
       */
      sendJoinRequest(id, password) {
        return new Promise((resolve, reject) => {
          this.pomelo.request('connector.entryHandler.join', {
            lobby_id: id,
            lobby_password: password || '',
          }, ret => {
            if (ret.code === 200) {
              this.$store.commit({
                type: 'joinLobby',
                lobby_id: id,
                lobby: ret.lobby,
              });
              //console.log(ret);
              this.parent.changeComponent('lobby');
              resolve(ret);
            } else if (ret.info === 'wrong password') {
              this.$message({
                type:"error",
                message:'密码错误'
              });
              reject(ret);
            }
          });
        });
      },
      /**
       * 手动请求房间信息
       * 只在需要刷新的时候调用，平时接收服务器的定时更新
       */
      queryHall() {
        return new Promise((resolve, reject) => {
          this.pomelo.request('connector.entryHandler.queryHall', {}, data => {
            console.log(data);
            if (data && data.code === 200) {
              this.readHallStatus(data).then(() => resolve());
            } else {
              reject('getLobbies() received undefined data');
            }
          });
        });
      },
      readHallStatus(data) {
        return new Promise(resolve => {
          this.hall_status = data.hall_status;
          this.player_count = data.online_players;
          let unknown_player_list = [];
          for (let lobby_id in this.hall_status) {
            if (this.hall_status.hasOwnProperty(lobby_id)) {
              for (let player of this.hall_status[lobby_id].players) {
                if (player !== null && !this.$store.state.known_nicknames.hasOwnProperty(player.uid)) {
                  unknown_player_list.push(player.uid);
                }
              }
            }
          }
          if (unknown_player_list.length > 0) {
            this.$store.dispatch('queryNicknames', {
              usernames: unknown_player_list,
              callback: () => resolve()
            });
          } else {
            resolve();
          }
        });
      }
    },
  }
</script>

<style scoped>
  .main {
    color: rgba(255, 255, 255, 0.9);
  }

  h1 {
    font-size: 4vh;
    margin: 2vh 0;
  }

  h2 {
    font-size: 3vh;
  }

  h3 {
    font-size: 2.5vh;
  }

  .main {
    font-size: 1.8vh;
    height: 100vh;
    padding-top: 6vh;
  }

  .el-button {
    font-size: 2vh;
  }

  .el-carousel {
    color: rgba(0, 0, 0, 0.8);
  }

  .el-carousel__item {
    background: white;
    opacity: 0.8;
    -webkit-transition: ease 500ms;
    -moz-transition: ease 500ms;
    -ms-transition: ease 500ms;
    -o-transition: ease 500ms;
    transition: ease 500ms;
    border-radius: 1vh;
  }

  .el-carousel__item.is-active {
    opacity: 1;
  }

  .el-footer {
    position: absolute;
    width: 100%;
    bottom: 3vh;
  }

</style>