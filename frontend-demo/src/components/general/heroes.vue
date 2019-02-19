<template>
  <el-row style="margin: 0 10vh">
    <el-col :span="8" v-for="index in [0, 1, 2]">
      <el-popover placement="top-start" trigger="hover">
        <el-upload action="1234"
                   :before-upload="beforeUpload.bind(null, index)"
                   accept="image/jpeg,image/gif,image/png"

                   :show-file-list="false">
          <el-button style="width: 100%" type="primary">上传新图片</el-button>
        </el-upload>
        <div slot="reference"
             style="width: 20vh; height: 20vh; background-color: rgba(255, 255, 255, 0.5); outline: none !important; margin: auto"
             class="default-transition" :style="{
                       'box-shadow': index === $store.state.selected_hero_slot ?
                          '0 0 2vh #3fff16 !important' : 'none'
                       }"
             @click="$store.commit('selectHero', index)">
          <img :src="'https://featuresgame.tk:8001/api/get_hero?username=' + $store.state.username + '&slot=' + index"
               :id="'heroimage' + index"
               style="max-height: 20vh; max-width: 20vh;">
        </div>
      </el-popover>
    </el-col>
  </el-row>
</template>

<script>
  import axios from 'axios'

  export default {
    name: "heroes",
    data() {
      return {
        photo: "",
        username: this.$store.state.username
      };
    },
    methods: {//上传hero图片
      beforeUpload(index, file) {
        let fd = new FormData();
        fd.append("hero", file, file.name);
        fd.append("username", this.username);
        fd.append("slot", index);
        axios.post("https://featuresgame.tk:8001/api/upload_hero", fd, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: this.$store.state.token
          }
        }).then(() => {
          this.$message({
            type: "success",
            message: "上传成功"
          });
          document.getElementById('heroimage' + index).src = 'https://featuresgame.tk:8001/api/get_hero?username=' +
              this.$store.state.username + '&slot=' + index + '&random=' + Math.random()

        }).catch(err => {
          this.$message({
            type: "error",
            message: "上传失败"
          })
        });
        return false;
      },
    }
  }
</script>

<style scoped>

</style>