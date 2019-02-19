<template>
  <el-form :model="loginForm" :rules="rules" ref="loginForm" label-position="left" label-width="100px"
           class="demo-loginForm">
    <el-form-item label="用户名" prop="username">
      <el-input v-model="loginForm.username" clearable></el-input>
    </el-form-item>
    <el-form-item label="邮箱" prop="email">
      <el-input v-model="loginForm.email" clearable>
        <el-button @click="sendCode()" :disabled="isDisabled" type="primary" slot="append">发送验证码</el-button>
      </el-input>
    </el-form-item> 
    <el-form-item label="验证码" prop="verifycode">
      <el-input v-model="loginForm.verifycode" clearable></el-input>
    </el-form-item>
    <el-form-item label="新密码" prop="newPass">
      <el-input type="password" v-model="loginForm.newPass" clearable></el-input>
    </el-form-item>
    <el-form-item label="确认密码" prop="newPass2">
      <el-input type="password" v-model="loginForm.newPass2" clearable></el-input>
    </el-form-item>
    <el-button type="primary" @click="submitForm('loginForm')" style="float: right">确认</el-button>
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
          if (this.loginForm.newPass2 !== "") {
            this.$refs.loginForm.validateField("newPass2");
          }
          callback();
        }
      };
      var validatePass2 = (rule, value, callback) => {
        if (value === "") {
          callback(new Error("请再次输入密码"));
        } else if (value !== this.loginForm.newPass) {
          callback(new Error("两次输入密码不一致!"));
        } else {
          callback();
        }
      };
      return {
        activeName: "third",
        canSendCode: true,
        loginForm: {
          username: "",
          email: "",
          verifycode: "",
          newPass: "",
          newPass2: ""
        },
        rules: {
          username: [
            {required: true, message: "请输入用户名", trigger: "blur"}
          ],
          email: [{required: true, validator: (rule, value, callback) => {
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
            },message: "请输入邮箱", trigger: "blur"}],
          verifycode: [{required: true, trigger: "blur"}],
          newPass: [
            {required: true, validator:validatePass,message: '请输入密码', trigger: "blur"},
            {min: 8, max: 32, message: '长度在 8 到 32 个字符', trigger: "blur"},
          ],
          newPass2: [
            {required: true, validator: validatePass2, trigger: "blur"}
          ]
        }
      };
    },
    computed: {
      isDisabled() {
        return !this.canSendCode;
      }
    },
    methods: {
      submitForm(formName) {
        this.$refs[formName].validate(valid => {
          if (valid) {
            const info = {
              username: this.loginForm.username,
              newpw: this.loginForm.newPass,
              change_code: this.loginForm.verifycode
            };
            axios.sendNewPass(info).then(({data}) => {
              if (data.info_code === 0) {
                this.$message({
                  type: "success",
                  message: "修改成功"
                });
              } else if (data.info_code === 1) {
                this.$message({
                  type:"error",
                  message:"用户不存在"
                })
              } else if (data.info_code === 2) {
                this.$message({
                  type:"error",
                  message:"重置码错误"
                })
              }
            }).catch(err=>{
                this.$message({
                  type:"error",
                  message:"连接错误"
                })
            });
          } else {
            return false;
          }
        });
      },
      resetForm(formName) {
        this.loginForm.username = "";
        this.loginForm.email = "";
        this.loginForm.verifycode = "";
        this.loginForm.newPass = "";
        this.loginForm.newPass2 = "";
      },
      sendCode() {//发送验证码
        const info = {
          username: this.loginForm.username,
          email: this.loginForm.email,
        };
        axios.sendCode(info).then(({data}) => {
          switch (data.info_code) {
            case 0:
              this.$message({
                type: "success",
                message: "验证码已发送到你的邮箱"
              });
              return;
            case 1:
              this.$message({
                type: "error",
                message: "用户名或邮箱输入错误"
              });
              return;
            case 2:
              this.$message({
                type: "error",
                message: "邮件发送失败"
              });
              return;
            default:
              break;
          }
        }).catch(err=>{
                this.$message({
                  type:"error",
                  message:"连接错误"
                })
            });
      }
    }
  };
</script>