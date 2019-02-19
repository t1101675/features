import Vue from 'vue'
import Vuex from 'vuex'
import axios from '../axios';

Vue.use(Vuex);

const state = {
  token: '',
  username: '',
  nickname: '',
  lobby_id: undefined,
  hall_status: undefined,
  lobby_status: undefined,
  lobby_password: '',
  on_receive: {},
  selected_hero_slot: 0,

  share: {
    img_src: '',
    title: '',
    text: '',
  },

  result: {
    rank: 1,
    total: 2,
    kill: 1,
    score: 1,
  },

  known_nicknames: {},

  pomelo: undefined,

};

const getters = {
};

const mutations = {
  LOGIN: (state, data) => {
    //更改token的值
    state.token = data;
    window.sessionStorage.setItem('token', data);
  },
  LOGOUT: (state) => {
    //登出的时候要清除token
    state.token = null;
    window.sessionStorage.removeItem('token');
  },
  USERNAME: (state, data) => {
    //把用户名存起来
    state.username = data;
    window.sessionStorage.setItem('username', data);
  },
  NICKNAME: (state, data) => {
    state.known_nicknames[state.username] = data;
    state.nickname = data;
  },
  /**
   * 初始化了pomelo之后，将其放在这里供全局访问
   * @param state
   * @param pomeloObj
   */
  setPomelo: (state, pomeloObj) => {
    state.pomelo = pomeloObj;
  },
  /**
   * 选择游戏人物
   * @param state
   * @param data int 表示选择的人物，范围0~2
   */
  selectHero: (state, data) => {
    state.selected_hero_slot = data;
  },
  /**
   * 成功加入了房间
   * @param state
   * @param data 包含{lobby_id, lobby}，格式同后端返回值
   */
  joinLobby: (state, data) => {
    state.lobby_id = data.lobby_id;
    state.lobby_status = data.lobby;
  },
  /**
   * 离开了房间
   */
  leaveLobby: (state) => {
    state.lobby_id = undefined;
    state.lobby_status = undefined;
  },
  /**
   * 外面应该调用action
   * @private
   */
  _setOnReceive: (state, data) => {
    for (let key in data.methods) {
      if (data.methods.hasOwnProperty(key)) {
        if (!state.on_receive.hasOwnProperty(key)) {
          state.on_receive[key] = {};
        }
        state.on_receive[key][data.from] = data.methods[key];
      }
    }
  },
  /**
   * 清除由一个component名称设置的所有回调
   * @param state
   * @param from component的名字
   */
  clearOnReceive: (state, from) => {
    for (let key in state.on_receive) {
      if (state.on_receive.hasOwnProperty(key)) {
        delete state.on_receive[key][from];
      }
    }
  },
  /**
   * 存储从数据库请求好的nickname
   * @param state
   * @param data 格式为{usernames: ['u1', 'u2'], nicknames: ['n1', 'n2']}
   */
  saveNickname: (state, data) => {
    for (let i in data.usernames) {
      state.known_nicknames[data.usernames[i]] = data.nicknames[i];
    }
  },
  victory: state => {
    state.share = {
      img_src: 'https://featuresgame.tk/images/share/share-victory.jpg',
      title: '我在软工拿到了1.0的好成绩，快来抱大腿吧！',
      text: [
        '点一下，玩一年，装备不花一分钱！',
        '大家好，我是蛊天勒。给大家推荐一款超好玩的游戏：贪玩软工！',
        '葡萄美酒夜光杯，软工挂科走一回。',
        '大家好，我是渣渣辉。戏点林我拿过很多，但软工，我只有一。',
        '是组员就来一起砍我！有小伙伴吐槽，自从上了软工，组员都被自己给砍秃了。',
        '大扎好，我系轱天乐，我四渣渣辉，探挽朊汞，介四里没有挽过的船新版本，挤需体验一雪期，里造会干我一样，爱象戒个依点林。',
      ][Math.floor(Math.random() * 6)],
    };
  },
  defeat: state => {
    state.share = {
      img_src: 'https://featuresgame.tk/images/share/share-defeat.jpg',
      title: '我在软工拿到了重修的好成绩，快来抱大腿吧！',
      text: [
        '点一下，玩一年，装备不花一分钱！',
        '大家好，我是蛊天勒。给大家推荐一款超好玩的游戏：贪玩软工！',
        '葡萄美酒夜光杯，软工挂科走一回。',
        '大家好，我是渣渣辉。戏点林我拿过很多，但软工，我只有一。',
        '是组员就来一起砍我！有小伙伴吐槽，自从上了软工，组员都被自己给砍秃了。',
        '大扎好，我系轱天乐，我四渣渣辉，探挽朊汞，介四里没有挽过的船新版本，挤需体验一雪期，里造会干我一样，爱象戒个依点林。',
      ][Math.floor(Math.random() * 6)],
    };
  },
  /**
   * 保存游戏结果
   */
  _saveResult: (state, result) => {
    state.result = result;
  }
};

const actions = {
  UserLogin({commit}, data) {
    commit('LOGIN', data);
  },
  UserLogout({commit}) {
    commit('LOGOUT');
  },
  UserName({commit}, data) {
    commit('USERNAME', data);
  },
  /**
   * 设置pomelo接受数据的回调方法
   * @param context
   * @param data 格式{ methods: {'route': method()}, from: 'component_name' }
   */
  setOnReceive(context, data) {
    for (let key in data.methods) {
      if (data.methods.hasOwnProperty(key) && !context.state.on_receive.hasOwnProperty(key)) {
        pomelo.on(key, d => context.dispatch({
          type: '_triggerOnReceive',
          key: key,
          data: d,
        }));
      }
    }
    context.commit('_setOnReceive', data);
  },
  /**
   * 收到pomelo数据后，触发存储的回调方法
   * @private
   */
  _triggerOnReceive({state}, data) {
    if (!state.on_receive.hasOwnProperty(data.key)) {
      return;
    }
    for (let from in state.on_receive[data.key]) {
      if (state.on_receive[data.key].hasOwnProperty(from)) {
        state.on_receive[data.key][from](data.data);
      }
    }
  },
  /**
   * 向web-server请求玩家昵称
   * Guest则不请求直接用uid
   * @param context
   * @param usernames 玩家用户名的列表
   * @param callback
   */
  queryNicknames(context, {usernames, callback}) {
    let guests = usernames.filter(name => name.substring(0, 5) === 'Guest');
    usernames = usernames.filter(name => name.substring(0, 5) !== 'Guest');
    context.commit('saveNickname', {usernames: guests, nicknames: guests});
    if (usernames.length === 0) {
      callback();
      return;
    }
    return axios.queryNickname(usernames).then(({data: {nickname_list: nicknames}}) => {
      context.commit('saveNickname', {usernames, nicknames});
      callback();
    });
  },
  gameEnd(context, {loser, rankList}) {
    if (loser.length === rankList.length - 1) {
      context.commit('victory');
    } else if (loser.find(x => x.name === context.state.username)) {
      context.commit('defeat');
    } else {
      return;
    }
    context.commit('_saveResult', {
      rank: rankList.length - loser.length,
      total: rankList.length,
      score: rankList.find(x => x.name === context.state.username).score,
    });
  }
};

export default new Vuex.Store({
  state,
  mutations,
  actions,
  getters,
});