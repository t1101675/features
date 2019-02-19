<template>
  <div id="app">
    <router-view></router-view>
    <div id="background">
    </div>
  </div>
</template>

<script>
  export default {
    name: 'app'
  }
</script>

<style>

  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin: 0 !important;
  }

  #background {
    position: fixed;
    top: 0;
    left: 0;
    background: url('/images/ui/back.jpg') no-repeat center;
    background-size: cover;
    height: 100vh;
    width: 100vw;
    z-index: -1;
  }
</style>
