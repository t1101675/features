<template>
  <el-form status-icon :model="loginForm" :rules="rules" ref="loginForm" label-position="left" label-width="100px"
           class="demo-loginForm">
    <el-form-item label="用户名" prop="username">
      <el-input v-model="loginForm.username" placeholder="4-10个字符，只能包含字母、数字和下划线"></el-input>
    </el-form-item>
    <el-form-item label="邮箱" prop="email">
      <el-input v-model="loginForm.email" placeholder="每个邮箱只能注册一个账号"></el-input>
    </el-form-item>
    <el-form-item label="密码" prop="password">
      <el-input type="password" v-model="loginForm.password" placeholder="8-32个字符" auto-complete="off"></el-input>
    </el-form-item>
    <el-form-item label="确认密码" prop="checkPass">
      <el-input type="password" v-model="loginForm.checkPass" placeholder="建议使用大小写字母、数字和符号的混合" auto-complete="off"></el-input>
    </el-form-item>
      <el-button type="primary" @click="submitForm('loginForm')" style="float: right">注册</el-button>
  </el-form>
</template>
<script>
  import axios from "../../axios.js";

  export default {
    props: {
      spy: {
        type: Function
      }
    },
    data() {
      var validatePass = (rule, value, callback) => {
        if (value === "") {
          callback(new Error("请输入密码"));
        } else {
          if (this.loginForm.checkPass !== "") {
            this.$refs.loginForm.validateField("checkPass");
          }
          callback();
        }
      };
      var validatePass2 = (rule, value, callback) => {
        if (value === "") {
          callback(new Error("请再次输入密码"));
        } else if (value !== this.loginForm.password) {
          callback(new Error("两次输入密码不一致"));
        } else {
          callback();
        }
      };
      return {
        activeName: "second",
        loginForm: {
          username: "",
          password: "",
          checkPass: "",
          email: ""
        },
        rules: {
          username: [
            {required: true, message: "请输入用户名", trigger: "blur"},
            {min: 4, max: 10, message: "长度在 4 到 10 个字符", trigger: "blur"},
            {
              validator: (rule, value, callback) => {
                axios.checkAvailable({username: value}).then(({data}) => {
                  if (data.info_code === 0) {
                    callback();
                  } else {
                    callback(new Error('用户名已被注册'));
                  }
                }).catch(err => {
                  callback(new Error('未知错误'));
                });
              }, trigger: 'blur'
            }
          ],
          password: [
            {required: true, validator: validatePass, message: '请输入密码', trigger: "blur"},
            {min: 8, max: 32, message: '长度在 8 到 32 个字符', trigger: "blur"},
          ],
          checkPass: [
            {required: true, validator: validatePass2, trigger: "blur"}
          ],
          email: [{
            required: true,
            validator: (rule, value, callback) => {
              if (value === "") {
                callback(new Error("请输入邮箱"));
              } else {
                let reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                if (reg.test(value) === false) {
                  callback(new Error("邮箱格式有误"));
                } else {
                  callback();
                }
              }
            }, trigger: "blur"
          }]
        }
      };
    },
    methods: {
      submitForm(formName) {
        this.$refs[formName].validate(valid => {
          if (valid) {
            axios.userRegister(this.loginForm).then(({data}) => {
              if (data.info_code === 0) {
                this.$message({
                  type: "success",
                  message: "注册成功"
                });
              } else if (data.info_code === 2) {
                this.$message({
                  type: "info",
                  message: "邮件发送失败"
                });
              } else if (data.info_code === 1) {
                this.$message({
                  type: "info",
                  message: "用户名已存在"
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
      }
    }
  };
</script>
