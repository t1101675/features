import {GameMain} from "./game/gameMain.js";
import {Connection} from "./game/connection/connection.js";
pomelo.on('onGameMsg', Connection._recv.bind(Connection));
window.onresize = function() {
  console.log('resize');
  let h = window.innerHeight;
  let w = window.innerWidth;
  let canvas = document.getElementById('testdiv');
  canvas.style.position = 'fixed';
  canvas.style['z-index'] = 1000;
  canvas.style['transform-origin'] = '0 0';
  if (h / w > 900 / 1600) {
    canvas.style.transform = 'scale(' + w / 1600 + ')';
    canvas.style.left = '0';
    canvas.style.top = ((h - w * 9 / 16) / 2).toString() + 'px';
  } else {
    canvas.style.transform = 'scale(' + h / 900 + ')';
    canvas.style.left = ((w - h * 16 / 9) / 2).toString() + 'px';
    canvas.style.top = '0';
  }
};
GameMain.start();