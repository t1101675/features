import Vuex from 'vuex'

const state = {
    token: '',
    username: '',
    share:{
        text:'',
        img_src:''
    },
    known_nicknames:{},
    result: {
        rank: 1,
        total: 2,
        kill: 1,
        score: 1,
    }
};

const mutations = {
    LOGIN: (state, data) => {
        //更改token的值
        state.token = data;
        //window.sessionStorage.setItem('token', data);
    },
    LOGOUT: (state) => {
        //登出的时候要清除token
        state.token = null;
        //window.sessionStorage.removeItem('token');
    },
    USERNAME: (state, data) => {
        //把用户名存起来
        state.username = data;
        //window.sessionStorage.setItem('username', data);
    }
};

const actions = {
    UserLogin({ commit }, data){
        commit('LOGIN', data);
    },
    UserLogout({ commit }){
        commit('LOGOUT');
    },
    UserName({ commit }, data){
        commit('USERNAME', data);
    },
    queryNicknames({commit},data){

    }
};

export default new Vuex.Store({
    state,
    mutations,
    actions
});