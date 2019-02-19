<template>
  <div>
    <!--<div id="flash" :class="{'flash-on': flash, 'flash-off': !flash}"></div>-->
    <share :config="config"></share>
  </div>
</template>
<script>
  export default {
    data() {
      return {//分享
        img_src: this.$store.state.share.img_src,
        flash: true,
        config: {
          title: this.$store.state.share.text,
          image: this.$store.state.share.img_src,
          sites: ['weibo', 'wechat', 'douban'],
          wechatQrcodeTitle: '微信扫一扫：分享', // 微信二维码提示文字
          wechatQrcodeHelper: '<p>微信里点“发现”，扫一下</p><p>二维码便可将本文分享至朋友圈。</p>'
        }
      }
    },
    created() {
      document.body.style.margin = "0";
    },
    mounted() {
      setTimeout(() => {
        this.flash = false;
        setTimeout(() => {
          let flash = document.getElementById('flash');
          if(flash!=null)
            flash.parentElement.removeChild(flash);
        }, 1000);
      }, 500);
    }
  }
</script>
<style scoped>
  .img-wrap {
    width: 100vw;
    height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
    overflow: hidden;
    margin: 0;
  }

  div > img {
    display: block;
    position: absolute;
    top: 50%;
    left: 50%;
    max-height: 100%;
    max-width: 100%;
    transform: translate(-50%, -50%);
  }

  .social-share {
    position: absolute;
    bottom: 0;
    left: 50%;
    -webkit-transform: translateX(-50%);
    -moz-transform: translateX(-50%);
    -ms-transform: translateX(-50%);
    -o-transform: translateX(-50%);
    transform: translateX(-50%);
  }

  #flash {
    width: 100vw;
    height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
    -webkit-transition: ease-out 1000ms;
    -moz-transition: ease-out 1000ms;
    -ms-transition: ease-out 1000ms;
    -o-transition: ease-out 1000ms;
    transition: ease-out 1000ms;
    pointer-events: none;
    background-color: white;
    z-index: 10;
  }

  .flash-on {
    opacity: 1;
  }

  .flash-off {
    opacity: 0;
  }
</style>