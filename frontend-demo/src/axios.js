import axios from 'axios'
import store from './store'

//创建axios实例
var instance = axios.create({
  baseURL: 'https://featuresgame.tk:8001',
  timeout: 3000,
  withCredentials: true,
  headers: {'Content-Type': 'application/json;charset=UTF-8'}
});


instance.interceptors.request.use(
    config => {
      if (store.state.token) {
        config.headers.Authorization = store.state.token;
      }
      return config;
    }
);

//respone拦截器
instance.interceptors.response.use(
    response => {
      return response;
    },
    error => {
      if (error.response) {
        switch (error.response.status) {
          case 401:
            //store.dispatch('UserLogout');
            router.replace({
              path: '/',
              query: {
                redirect: router.currentRoute.fullPath
              }
            });
        }
      }
      return Promise.reject(error.response);
    }
);

export default {
  instance,
  userRegister(data) {
    return instance.post('/api/register', data);
  },
  /**
   * 检验用户名邮箱是否已被注册
   * @param data 为{username, email}
   */
  checkAvailable(data) {
    return instance.post('/api/chav', data)
  },
  userLogin(data) {
    return instance.post('/api/login', data);
  },
  actPost(data) {
    return instance.post('/api/act', data);
  },
  sendNewPass(data) {
    return instance.post('/api/newpw', data)
  },
  getUsers(data) {
    return instance.post('/api/users', data)
  },
  changePass(data) {
    return instance.post('/api/resetpw', data);
  },
  /**
   * 查询用户名
   * @param usernames 用户名的列表
   */
  queryNickname(usernames) {
    return instance.get('/api/quni?usernames=' + usernames.join(','));
  },
  /**
   * 修改用户名
   * @param data 为{username, nickname}
   */
  changeNickname(data) {
    return instance.post('/api/chni', data);
  },
  sendCode(data) {
    return instance.post('/api/reqpw', data)
  },
  sendNewPass(data) {
    return instance.post('/api/newpw', data)
  },
  getImageList(data) {
    return instance.post('/api/getfilelist', data)
  },
  getImage(data) {
    return instance.post('/api/getfile', data)
  },
  delImage(data) {
    return instance.post('/api/delfile', data)
  },
  rankList() {
    return instance.get('/api/ranklist');
  },
  rankListHistory(str) {
    return instance.post('/api/history?username=',{
      username:str
    });
  }
}