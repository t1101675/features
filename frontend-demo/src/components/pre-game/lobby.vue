<template>
  <div class="main" @click="onClick">
    <lobby-settings ref="settings"></lobby-settings>
    <h1 style="text-shadow: 0 0 1vh rgba(0, 0, 0, 0.6)">
      房间#{{ lobby_id }}
      <span v-show="lobby_password !== ''">
        🔒:
        <span style="font-size: 3vh; line-height: 5vh">
          {{ lobby_password }}
        </span>
      </span>
    </h1>
    <el-button @click="ready"
               :disabled="allDisabled || disableReadyButton">
      {{ start_button_text }}
    </el-button>
    <el-button @click="settings"
               v-if="my_position === 0" :disabled="allDisabled || disableSettingsButton">
      房间设置
    </el-button>
    <el-button @click="quit"
               :disabled="allDisabled || disableLeaveButton">
      退出房间
    </el-button>
    <hr style="margin: 2vh 0; background-color: rgba(255, 255, 255, 0.5); border: none; height: 0.5vh">
    <div class="lobby-content default-transition" :style="{
        'max-height': lobby_status.players.length > 1 ?
            (2 + Math.ceil(lobby_status.players.length / 4) * 14 + 'vh') : '22vh',
        'background-color': lobby_status.players.length > 1 ?
            'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.6)'
      }">
      <div class="super-background"></div>
      <div class="players-display">
        <h1 style="font-family: serif; font-size: 10vh" v-if="lobby_status && lobby_status.players.length === 1">
          😈<span style="vertical-align: 1.4vh; color: rgba(0, 0, 0, 0.8)">单人生存模式</span>😈
        </h1>
        <el-row v-if="lobby_status && lobby_status.players.length !== 1">
          <el-col :span="6" v-for="(player, index) in lobby_status.players">
            <span v-if="!index" id="ownerSign">
              房主
            </span>
            <el-card :class="{
                        'hover-animation': true,
                        empty: !player,
                        ready: player && player.ready,
                        not_ready: player && !player.ready,
                        you: player && player.uid === uid,
                        other: player && (player.uid !== uid),
                      }"
                     :id="'block_' + index">
              <div :id="'overlay_' + index" :class="{
                'hover-animation': true,
                'overlay-card': true,
                'overlay-card-visible': display_prompt[index],
                'overlay-card-invisible': !display_prompt[index],
              }">
                <div :class="{
                        'view-info': my_position !== 0 || player.ready,
                        'view-info-half': my_position === 0 && !player.ready,
                        'hover-animation': !allDisabled,
                      }"
                     v-if="player && index !== my_position"
                     :id="'view_' + index">
                  <span class="card-text">查看</span>
                </div>
                <div :class="{
                        'kick': true,
                        'hover-animation': !allDisabled,
                      }"
                     v-if="player && index !== my_position && (my_position === 0 && !player.ready)"
                     :id="'kick_' + index">
                  <span class="card-text">踢出</span>
                </div>
                <div :class="{
                        'view-me': true,
                        'hover-animation': !allDisabled,
                      }"
                     v-if="index === my_position"
                     id="view-me">
                  <span class="card-text">选择人物</span>
                </div>
                <div :class="{
                        'view-info': true,
                        'hover-animation': !allDisabled,
                      }"
                     v-if="!player"
                     :id="'move_' + index">
                  <span class="card-text">移到此处</span>
                </div>
              </div>
              <span class="card-text">
                <span v-if="player">{{ $store.state.known_nicknames[player.uid] || '未知玩家' }}</span>
                <span v-if="!player">(empty)</span>
              </span>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script>
  import LobbySettings from './settings-overlay.vue';

  export default {
    name: "lobby",
    components: {
      lobbySettings: LobbySettings,
    },
    props: {
      //放在这里会被警告，我放到data里面了
      isTest: false,
      lobbystatus: undefined
    },
    data() {
      return {
        parent: undefined,

        lobby_id: this.$store.state.lobby_id,
        uid: this.$store.state.username,
        start_button_text: '准备',
        lobby_status: this.$store.state.lobby_status,
        my_position: -1,

        disableReadyButton: false,
        disableLeaveButton: false,
        disableSettingsButton: false,
        allDisabled: false,

        display_prompt: [], //显示玩家图标上的overlay

        lobby_password: '',
        on_receive: {
          lobby_status: data => {
            this.readLobbyStatus(data);
          },
          gameStart: () => {
            this.parent.changeComponent('game');
          },
          kicked: () => {
            this.allDisabled = true;
            this.parent.$refs.overlay.showTimeoutMessage('你被房主移出房间:(', 2000);
            this.parent.changeComponent('hall', 'reverse');
          }
        },
      };
    },
    created() {
    },
    beforeMount() {
      this.pomelo = this.$store.state.pomelo;
      if (!this.isTest) {
        this.parent = this.$parent;
      } else {
        this.parent = this.$store.state.parent;
        this.lobby_status = this.lobbystatus
      }
      this.readLobbyStatus(this.lobby_status);
      this.lobby_password = this.lobby_status.password;
    },
    mounted() {
      this.$store.dispatch({
        type: 'setOnReceive',
        methods: this.on_receive,
        from: 'lobby',
      });
      this.$emit('mounted');
      this.allDisabled = false;
    },
    beforeDestroy() {
      this.$store.commit('clearOnReceive', 'lobby');
    },
    methods: {
      onClick(mouseEvent) {
        if (this.allDisabled) {
          return;
        }
        for (let cur = mouseEvent.target; cur; cur = cur.parentElement) {
          if (cur.id) {
            let info = cur.id.split('_');
            if (!info || info.length !== 2) {
              continue;
            }
            switch (info[0]) {
              case 'move':
                this.move(parseInt(info[1]));
                return;
              case 'kick':
                this.kick(parseInt(info[1]));
                return;
              case 'block':
                this.playerClick(parseInt(info[1]));
                return;
            }
          }
        }
        this.playerClick(-1);
      },
      readLobbyStatus(status) {
        console.log(status);
        return new Promise(resolve => {
          if (status === undefined)
            resolve();
          this.lobby_status = status;

          this.my_position = this.lobby_status.players.findIndex(p => p && p.uid === this.uid);
          if (this.my_position === 0) {
            this.start_button_text = '开始';
            this.checkAllset();
          } else if (this.start_button_text === '开始') {
            if (this.lobby_status.players[this.my_position].ready) {
              this.start_button_text = '取消准备';
            } else {
              this.start_button_text = '准备';
            }
            this.disableReadyButton = false;
          }

          let unknown_player_list = [];
          this.lobby_status.nicknames = [];
          for (let player of this.lobby_status.players) {
            if (player) {
              if (!this.$store.state.known_nicknames.hasOwnProperty(player.uid)) {
                unknown_player_list.push(player.uid);
                this.lobby_status.nicknames.push('未知玩家');
              } else {
                this.lobby_status.nicknames.push(this.$store.state.known_nicknames[player.uid]);
              }
            }
          }
          if (unknown_player_list.length > 0) {
            this.$store.dispatch('queryNicknames', {
              usernames: unknown_player_list,
              callback: () => {
                this.lobby_status.nicknames =
                    this.lobby_status.players.map(x => x ? this.$store.state.known_nicknames[x.uid] || '未知玩家' : null);
                resolve();
              }
            });
          } else {
            resolve();
          }
        });
      },
      /**
       * 当点击到了一个玩家的时候
       */
      playerClick(index) {
        if (isNaN(index)) {
          return;
        }
        if (index === -1) {
          this.display_prompt = [];
          return;
        }
        if (!this.display_prompt[index]) {
          this.display_prompt = [];
          this.display_prompt[index] = true;
        }
      },
      /**
       * 检查是否所有人都已经准备，而且房间至少有两个人
       */
      checkAllset() {
        if (this.lobby_status.players.length === 1) {
          this.disableReadyButton = false;
          return;
        }
        let allset = false;
        for (let i = 1; i < this.lobby_status.players.length; i += 1) {
          if (this.lobby_status.players[i]) {
            if (!this.lobby_status.players[i].ready) {
              this.disableReadyButton = true;
              return;
            } else {
              allset = true;
            }
          }
        }
        this.disableReadyButton = !allset;
      },
      /**
       * 退出房间
       */
      quit() {
        this.readLobbyStatus = () => {
        }; //不再更新
        this.disableLeaveButton = true;
        this.pomelo.request('connector.entryHandler.leaveLobby', {}, ret => {
          //this.disableLeaveButton = false; //注释掉这个以防连续点击按钮
          if (ret.code === 200) {
            this.disableReadyButton = true;
            this.disableSettingsButton = true;
            this.parent.changeComponent('hall', 'reverse');
          } else {
            this.parent.showErrorMessage(ret);
          }
        });
      },
      /**
       * 发送准备/取消准备/开始信息
       */
      ready() {
        if (this.start_button_text === '准备') {
          // 房主不能准备，只能在所有人都准备之后开始
          this.start_button_text = '取消准备';
          this.disableReadyButton = true;
          this.pomelo.request('connector.entryHandler.ready', {
            status: 'ready',
            slot: this.$store.state.selected_hero_slot,
          }, ret => {
            //this.parent.port = ret.port.port;
            //console.log(this.parent.port);
            if (ret.code === 200) {
              this.readLobbyStatus(ret.lobby);
              this.disableReadyButton = false;
            } else {
              this.disableReadyButton = false;
              this.parent.showErrorMessage(ret);
            }
          });
        } else if (this.start_button_text === '取消准备') {
          this.start_button_text = '准备';
          this.disableReadyButton = true;
          this.pomelo.request('connector.entryHandler.ready', {status: 'not_ready'}, ret => {
            if (ret.code === 200) {
              this.readLobbyStatus(ret.lobby);
              this.disableReadyButton = false;
            } else {
              this.disableReadyButton = false;
              this.parent.showErrorMessage(ret);
            }
          });
        } else {
          this.disableReadyButton = true;
          this.pomelo.request('game.gameHandler.requestGameStart', {
            slot: this.$store.state.selected_hero_slot,
          }, ret => {
            console.log(ret);
            if (ret.code === 200) {
              this.disableReadyButton = false;
              this.parent.changeComponent('game');
              // 进入游戏界面
            } else {
              this.disableReadyButton = false;
              this.parent.showErrorMessage(ret);
            }
          });
        }
      },
      /**
       * 移动位置
       */
      move(index) {
        this.playerClick(-1);
        console.log('move', index);
        this.pomelo.request('connector.entryHandler.movePosition', {
          target: index,
        }, ret => {
          console.log(ret);
          if (ret.code === 200) {
            this.readLobbyStatus(ret.lobby);
          } else {
            this.parent.showErrorMessage(ret);
          }
          this.queryLobby();
        });
      },
      /**
       * 踢出一个玩家
       */
      kick(player) {
        this.playerClick(-1);
        console.log('kick', player);
        this.pomelo.request('connector.entryHandler.kickPlayer', {
          target: player,
        }, ret => {
          switch (ret.code) {
            case 200:
              console.log('kick successful');
              this.readLobbyStatus(ret.lobby);
              break;
            case 510:
              console.log('kick target no longer there');
              break;
            default:
              this.parent.showErrorMessage(ret);
          }
        });
      },
      /**
       * 房主点击"房间设置"按钮
       */
      settings() {
        this.$refs.settings.confirmed_settings = {
          max_player: this.lobby_status.players.length,
          lobby_password: this.lobby_status.password,
        };
        this.$refs.settings.show();
      },
      /**
       * 手动请求房间信息
       * 只在需要刷新的时候调用，平时接收服务器的定时更新
       */
      queryLobby() {
        return new Promise((resolve, reject) => {
          this.pomelo.request('connector.entryHandler.queryLobby', {}, data => {
            if (data && data.code === 200) {
              this.readLobbyStatus(data.lobby);
              resolve();
            } else {
              reject('getLobbies() received undefined data');
            }
          });
        });
      }
    }
  }
</script>

<style scoped>
  h1 {
    font-size: 4vh;
    line-height: 5vh;
    color: rgba(255, 255, 255, 0.9);
  }

  .hover-animation {
    -webkit-transition: ease 300ms;
    -moz-transition: ease 300ms;
    -ms-transition: ease 300ms;
    -o-transition: ease 300ms;
    transition: ease 300ms;
  }

  .main {
    padding-bottom: 40px;
  }

  .lobby-content {
    margin: auto;
    max-width: 120vh;
    padding: 1vh;
    border-radius: 1vh;
    overflow: hidden;
  }

  .players-display {
    width: 100%;
  }

  #ownerSign {
    position: absolute;
    width: 100%;
    left: 0;
    top: -0.5vh;
    font-size: 2.5vh;
    z-index: 11;
    font-weight: bolder;
    color: #ffe222;
    text-shadow: 0 0 0.2vh #564200;
  }

  .el-row {
    margin: 0;
  }

  .el-col {
    padding: 1vh;
    position: relative;
  }

  .empty {
    background-color: #aaaaaa;
    border: #aaaaaa;
  }

  .empty:hover {
    background-color: #b6b6b6;
    border: #b6b6b6;
  }

  .ready {
    border: #3fff16;
    box-shadow: 0 0 2vh #3fff16 !important;
  }

  .not_ready {
    border: #ff938e;
    box-shadow: 0 0 2vh #ff625b !important;
  }

  .you {
    background-color: #84fac5;
  }

  .you:hover {
    background-color: #9ffacd;
  }

  .other {
    background-color: #ebff93;
  }

  .other:hover {
    background-color: #f2ffb2;
  }

  .el-card {
    cursor: pointer;
    position: relative;
    height: 12vh;
    font-size: 3vh;
  }

  .card-text {
    position: absolute;
    left: 0;
    width: 100%;
    top: 50%;
    line-height: 3.5vh;
    -webkit-transform: translateY(-50%);
    -moz-transform: translateY(-50%);
    -ms-transform: translateY(-50%);
    -o-transform: translateY(-50%);
    transform: translateY(-50%);
  }

  .overlay-card {
    z-index: 10;
    position: absolute;
    width: 100%;
    height: 100%;
    line-height: 36px;
    text-align: center;
    top: 0;
    left: 0;
    background-color: #c2faf3;
    -webkit-transition: ease 600ms;
    -moz-transition: ease 600ms;
    -ms-transition: ease 600ms;
    -o-transition: ease 600ms;
    transition: ease 600ms;
    -webkit-transform-origin: 50% 50%;
    -moz-transform-origin: 50% 50%;
    -ms-transform-origin: 50% 50%;
    -o-transform-origin: 50% 50%;
    transform-origin: 50% 50%;
    border-radius: 4px;
    overflow: hidden;
  }

  .overlay-card:hover {
    background-color: #86faf5;
  }

  .overlay-card-visible {
    opacity: 1;
    -webkit-transform: rotateY(0);
    -moz-transform: rotateY(0);
    -ms-transform: rotateY(0);
    -o-transform: rotateY(0);
    transform: rotateY(0);
  }

  .overlay-card-invisible {
    opacity: 0;
    -webkit-transform: rotateY(90deg);
    -moz-transform: rotateY(90deg);
    -ms-transform: rotateY(90deg);
    -o-transform: rotateY(90deg);
    transform: rotateY(90deg);
  }

  .view-info, .view-me {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
  }

  .view-info-half {
    background-color: #c2faf3;
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 50%;
  }

  .view-info-half:hover {
    background-color: #86faf5;
  }

  .add-bot-half {
    background-color: #ebff93;
    position: absolute;
    top: 0;
    left: 50%;
    height: 100%;
    width: 50%;
  }

  .add-bot-half:hover {
    background-color: #f1f46d;
  }

  .kick {
    background-color: #ff8077;
    position: absolute;
    top: 0;
    left: 50%;
    height: 100%;
    width: 50%;
  }

  .kick:hover {
    background-color: #ff5751;
  }

  .el-button {
    font-size: 2vh;
  }
</style>