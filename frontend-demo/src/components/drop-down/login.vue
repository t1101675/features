<template>
  <div class="main login-container" :class="{
        'login-container-first': activeName === 'first',
        'login-container-second': activeName === 'second',
        'login-container-third': activeName === 'third',
        }">
    <el-tabs v-model="activeName">
      <el-tab-pane label="登录" name="first">
        <div style="height: 3vh; width: 100%"></div>
        <el-form :model="loginForm" :rules="rules" ref="loginForm" label-width="100px" label-position="left"
                 class="demo-loginForm">
          <el-form-item label="用户名" prop="username">
            <el-input :placeholder="'admin' + Math.floor(Math.random() * 2) + Math.floor(Math.random() * 9)"
                      v-model="loginForm.username" style="width:100%" clearable></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input type="password" placeholder="features" v-model="loginForm.password" auto-complete="off"
                      style="width:100%"
                      clearable></el-input>
          </el-form-item>
          <div style="height: 1.5vh; width: 100%"></div>
          <el-checkbox v-model="remember_pass" style="float: left; margin: 1.5vh 0">记住密码</el-checkbox>
          <el-button type="primary" @click="submitForm('loginForm')" style="float: right;">登录</el-button>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="注册" name="second">
        <div style="height: 3vh; width: 100%"></div>
        <register></register>
      </el-tab-pane>
      <el-tab-pane label="找回密码" name="third">
        <div style="height: 3vh; width: 100%"></div>
        <forget></forget>
      </el-tab-pane>
    </el-tabs>

  </div>
</template>
<script>
  import register from "./register.vue";
  import forget from "./forget.vue"
  import axios from "../../axios.js";

  export default {
    props: {
      value: {}
    },
    data() {
      return {
        username: "",
        activeName: "first",
        loginForm: {
          username: "",
          password: ""
        },
        validators: {},
        rules: {
          username: [
            {required: true, message: "请输入用户名", trigger: 'blur'},
            {max: 10, message: "长度在 4 到 10 个字符", trigger: 'blur'},
            {min: 4, message: "长度在 4 到 10 个字符", trigger: 'blur'},
            {
              validator: (rule, value, callback) => {
                if (value.match(/\W/)) {
                  callback(new Error('只能包含字母、数字和下划线'));
                } else {
                  callback();
                }
              },
              trigger: 'blur'
            },
          ],
          password: [
            {required: true, message: '请输入密码', trigger: 'blur'},
          ],
        },
        remember_pass: false,
      };
    },
    methods: {
      submitForm(formName) {
        this.$refs[formName].validate(valid => {
          if (valid) {
            axios.userLogin(this.loginForm).then(({data}) => {
              switch (data.info_code) {
                case 1:
                  this.$message({
                    type: "info",
                    message: "用户名不存在"
                  });
                  break
                case 2:
                  this.$message({
                    type: "info",
                    message: "用户名或密码错误"
                  });
                  break;
                case 3:
                  this.$message({
                    type: 'info',
                    message: '账户尚未激活，请检查邮件',
                  });
                  break;
                case 0:
                  this.$store.dispatch("UserLogin", data.token);
                  this.$store.dispatch("UserName", data.username);
                  this.$store.commit('NICKNAME', data.nickname);
                  if (this.remember_pass) {
                    //console.log('登陆成功，保存cookies');
                    document.cookie = 'featuresuid=' + data.username + ';path=/';
                    document.cookie = 'featurespass=' + this.loginForm.password + ';path=/';
                  }
                  this.$parent.loginComplete();
                  break;
                default:
                  this.$message({
                    type: 'info',
                    message: '服务器错误',
                  });
              }
            }).catch(err => {
              this.$message({
                type: 'error',
                message: '连接失败，请重试' 
              });
            });
          } else {
            return false;
          }
        });
      },
    },
    components: {
      register,
      forget,
    }
  };
</script>
<style rel="stylesheet/css" lang="css" scoped>
  .login-container {
    position: absolute;
    padding: 4vh;
    min-width: 60vh;
    top: 50%;
    left: 50%;
    background: rgba(255, 255, 255, 0.9);
    transform: translate(-50%, -50%);
    border-radius: 1vh;
    -webkit-transition: ease 500ms;
    -moz-transition: ease 500ms;
    -ms-transition: ease 500ms;
    -o-transition: ease 500ms;
    transition: ease 500ms;
    overflow: hidden;
  }

  .login-container-first {
    height: 35vh;
  }

  .login-container-second {
    height: 51vh;
  }

  .login-container-third {
    height: 60vh;
  }

  #app {
    font-family: "Avenir", Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    margin-top: 60px;
  }
</style>