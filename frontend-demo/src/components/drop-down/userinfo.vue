<template>
  <div class="main">
    <div id="profile-header">
      <div style="margin: 2vh auto; height: 12vh; display: inline-block">
        <div style="float: left">
          <el-upload
              action="1234"
              :before-upload="beforeUploadProfile"
              :show-file-list="false">
            <img :src="'https://featuresgame.tk:8001/api/get_profile?username=' + $store.state.username"
                 id="profile-image" alt="后端 /api/get_profile 接口尚未接通">
          </el-upload>
        </div>
        <div style="float: left; margin-left: 5vh">
          <h1 style="margin: 3.5vh auto; font-size: 4vh; line-height: 5vh;">{{ this.$store.state.nickname }}</h1>
        </div>
      </div>
    </div>
    <el-collapse v-model="activeNames" accordion style="max-width: 100vh; margin: auto">
      <el-collapse-item title="账户设置" name="1">
        <ChangePass v-on:logout="logOut"></ChangePass>
      </el-collapse-item>
      <el-collapse-item title="我的人物" name="2">
        <heroes></heroes>
      </el-collapse-item>
      <el-collapse-item title="周排行榜" name="3">
        <div style="overflow-x: hidden; overflow-y: scroll; max-height: 30vh">
          <table class="table">
            <tr class="table-title">
              <th class="table-col-1">
                排名
              </th>
              <th class="table-col-2">
                用户
              </th>
              <th class="table-col-3">
                总分
              </th>
            </tr>
            <tr class="table-row" v-for="entry in rank_data">
              <th class="table-col-1">
                {{ entry.rank }}
              </th>
              <th class="table-col-2">
                {{ entry.name }}
              </th>
              <th class="table-col-3">
                {{ entry.score }}
              </th>
            </tr>
          </table>
        </div>
      </el-collapse-item>
      <el-collapse-item title="总排行榜" name="4">
        <div style="overflow-x: hidden; overflow-y: scroll; max-height: 30vh">
          <table class="table">
            <tr class="table-title">
              <th class="table-col-1">
                排名
              </th>
              <th class="table-col-2">
                用户
              </th>
              <th class="table-col-3">
                总分
              </th>
            </tr>
            <tr class="table-row" v-for="entry in rank_data">
              <th class="table-col-1">
                {{ entry.rank }}
              </th>
              <th class="table-col-2">
                {{ entry.name }}
              </th>
              <th class="table-col-3">
                {{ entry.score }}
              </th>
            </tr>
          </table>
        </div>
      </el-collapse-item>
      <el-collapse-item title="我的战绩" name="5">
        <div style="overflow-x: hidden; overflow-y: scroll; max-height: 30vh">
          <table class="table">
            <tr class="table-title">
              <th class="table-col-1">
                序号
              </th>
              <th class="table-col-2">
                分数
              </th>
            </tr>
            <tr class="table-row" v-for="(entry,index) in my_data.history">
              <th class="table-col-1">
                {{ index }}
              </th>
              <th class="table-col-2">
                {{ entry }}
              </th>
            </tr>
          </table>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>
<script>
  import ChangePass from "./changePass.vue";
  import heroes from '../general/heroes.vue';
  import axios from "axios";
  import myAxios from "../../axios.js";

  export default {
    data() {
      return {
        rank_data: [
          {
            rank: 1,
            name: "顾煜贤",
            score: "4.0"
          },
          {
            rank: 2, 
            name: "赵成钢",
            score: "4.0"
          }
        ],
        my_data: [
          1,2,3
        ],

        activeNames: []
      };
    },
    mounted() {
      myAxios.rankList().then(({data}) => {
        this.rank_data = data;
      }).catch(err=>{
      });
      myAxios.rankListHistory(this.$store.state.username).then(({data}) => {
        //console.log("mydata is ",data)
        this.my_data = data;
      }).catch(err=>{
      });
    },
    methods: {
      logOut() {
        this.$parent.hide();
        this.$parent.$parent.changeComponent(undefined, "reverse");
        setTimeout(() => {
          location.reload();
        }, 700);
      },
      beforeUploadProfile(file) {//上传头像
        let fd = new FormData();
        fd.append("profile", file,file.name);
        fd.append("username", this.$store.state.username);
        //console.log(this.$store.state.token)
        //console.log(this.$store.state.username)
        axios.post("https://featuresgame.tk:8001/api/upload_profile", fd, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: this.$store.state.token
          }
        }).then(() => {
          this.$message({
            type:"success",
            message:"上传成功"
          })
          document.getElementById('profile-image').src='https://featuresgame.tk:8001/api/get_profile?username=' + this.$store.state.username+'&random='+Math.random()
        }).catch(err => {
          this.$message({
            type:"info",
            message:"上传失败"
          })
        })
        return false
      },
    },
    components: {
      ChangePass,
      heroes
    }
  };
</script>
<style scoped>

  .main {
    width: 100vw;
    height: 100vh;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: rgba(255, 255, 255, 0.9);
  }

  #profile-header {
    height: 16vh;
    width: 100vw;
  }

  #profile-image {
    height: 12vh;
    width: 12vh;
    max-height: 12vh;
    max-width: 12vh;
    border-radius: 50%;
  }

  .el-button {
    font-size: 2vh;
    padding: 1.5vh;
  }

  .el-carousel__item h3 {
    color: #475669;
    font-size: 14px;
    opacity: 0.75;
    line-height: 200px;
    margin: 0;
  }

  .el-carousel__item:nth-child(2n) {
    background-color: #99a9bf;
  }

  .el-carousel__item:nth-child(2n + 1) {
    background-color: #d3dce6;
  }

  .table {
    margin: auto;
  }

  .table-title {
    font-size: 2vh;
  }

  .table-row > th {
    font-weight: normal;
    padding: 0 2vh;
  }
</style>