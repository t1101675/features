<template>
  <div class="login">
    <div class="login-container">
      <el-form :model="loginForm" :rules="rules" ref="loginForm" label-width="12vh" class="demo-loginForm">
        <el-row :gutter="30" style="margin: 0 2vh 0 0">
          <el-col :span="12">
            <el-form-item label="昵称" prop="nickname">
              <el-input v-model="loginForm.nickname" style="width: 100%" placeholder="4-10个字符，汉字计2字符"></el-input>
            </el-form-item>
            <el-form-item label="旧密码" prop="oldPass">
              <el-input type="password" v-model="loginForm.oldPass" auto-complete="off" style="width: 100%"
                        placeholder="如不需改密码则留空"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12" style="height: 10vh">
            <el-form-item label="新密码" prop="newPass">
              <el-input type="password" v-model="loginForm.newPass" auto-complete="off" style="width:100%"
                        placeholder="8-32个字符"></el-input>
            </el-form-item>
            <el-form-item label="确认密码" prop="newPass2">
              <el-input type="password" v-model="loginForm.newPass2" auto-complete="off" style="width:100%"
                        placeholder="8-32个字符"></el-input>
            </el-form-item>
          </el-col>
        </el-row>


        <el-button type="primary" @click="submitForm('loginForm')">修改信息</el-button>
        <el-button @click="logout">登出</el-button>
      </el-form>
    </div>
  </div>
</template>
<script>
  import axios from "../../axios.js";

  export default {
    props: {
      value: {},
      spy: {
        type: Function
      }
    },
    data() {
      return {
        username: "",
        activeName: "first",
        loginForm: {
          nickname: "",
          oldPass: "",
          newPass: "",
          newPass2: "",
        },
        rules: {
          oldPass: [
            {
              validator: (rule, value, callback) => {
                if (value === '' && (this.loginForm.newPass !== '' || this.loginForm.newPass2 !== '')) {
                  callback(new Error('如要更改密码必须输入正确的旧密码'));
                } else {
                  callback();
                }
              },trigger:'blur'
            }
          ],
          newPass: [
            {
              validator: (rule, value, callback) => {
                if (value) {
                  this.$refs.loginForm.validateField('oldPass');
                  this.$refs.loginForm.validateField('newPass2');
                }
                callback();
              },trigger:'blur'
            },
            {
              min: 8, max: 32,
              message: '长度在 8 到 32 个字符',trigger:'blur'
            },
          ],
          newPass2: [
            {
              validator: (rule, value, callback) => {
                if (value !== this.loginForm.newPass) {
                  if (value) {
                    callback(new Error('两次输入密码不一致'))
                  } else {
                    callback(new Error('请再次输入密码'))
                  }
                } else {
                  callback();
                }
              },trigger:'blur'
            }
          ]
        }
      };
    },
    methods: {
      logout() {
        //清除cookies
        //console.log('清除cookies');
        document.cookie = "featuresuid=;path=/";
        this.$emit('logout');
      },
      resetForm(formName) {
        if (formName === "loginForm") {
          this.loginForm.oldPass = "";
          this.loginForm.newPass = "";
          this.loginForm.newPass2 = "";
        }
      },
      submitForm(formName) {//提交表单
        this.$refs[formName].validate(valid => {
          if (valid) {
            // 如果没有修改密码
            if (this.loginForm.oldPass === '') {
              if (this.loginForm.nickname === '') {
                this.$message({
                  type: 'warning',
                  message: '请填写需要修改的项目',
                });
              } else {
                let nickname = this.loginForm.nickname;
                axios.changeNickname({
                  username: this.$store.state.username,
                  nickname: nickname,
                }).then(({status}) => {
                  if (status !== 200) {
                    this.$message({
                      type: 'error',
                      message: '修改昵称失败',
                    });
                  } else {
                    this.$message({
                      type: 'success',
                      message: '修改昵称成功',
                    });
                    this.$store.commit('NICKNAME', nickname);
                  }
                }).catch(err=>{
                  this.$message({
                      type: 'error',
                      message: '连接失败',
                  });
                });
              }
              return;
            }
            const info = {
              username: this.$store.state.username,
              orgpw: this.loginForm.oldPass,
              newpw: this.loginForm.newPass
            };
            axios.changePass(info).then(({data}) => {
              if (data.info_code === 1) {
                this.$message({type: "error",message:"原密码错误"});
              } else if (data.info_code === 0) {
                //console.log('修改密码成功，保存cookies');
                document.cookie = 'featuresuid=' + info.username + ';path=/';
                document.cookie = 'featurespass=' + info.newpw + ';path=/';
                this.$message({
                  type: "success",
                  message: "修改成功"
                });
              }
            });
          } else {
            return false;
          }
        });
      }
    },
    mounted() {
    },
    components: {}
  };
</script>
<style rel="stylesheet/css" lang="css" scoped>

  .el-button {
    font-size: 2vh;
    padding: 1.5vh;
  }
</style>