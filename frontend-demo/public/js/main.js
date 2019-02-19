import {Connection} from "../game/connection/connection.js";
import {GameMain} from "../game/gameMain.js";
var pomelo = window.pomelo;
var username;
// var room;
var users;
var maxRoom = 5;

function queryEntry(username, callback) {
  var route = 'gate.gateHandler.queryEntry';
  pomelo.init({
    host: window.location.hostname,
    port: "3014",
    log: true
  }, function() {
    pomelo.request(route, { username: username}, function(data) {
      pomelo.disconnect();
      callback(data.host, data.port);
    });
  });
}

function initUserList(data) {
  users = data.users;
  var parent = document.getElementById("users");
  var usersList = document.getElementById("list");
  parent.removeChild(usersList);

  var newList = document.createElement("list");
  for (var i = 0; i < users.length; i++) {
    var slElement = document.createElement("table");
    slElement.value = users[i];
    slElement.innerHTML = users[i];
    newList.append(slElement);
  }
  parent.append(newList);
}

function initRoomTable(userInfos) {
  var tableElem = document.getElementById("roomTable");
  var tableParent = tableElem.parentNode;
  tableParent.removeChild(tableElem);
  tableElem = document.createElement("table");
  tableParent.appendChild(tableElem);
  tableElem.setAttribute("id", "roomTable");
  for (var roomId = 0; roomId < userInfos.length; roomId++) {
    var item = document.createElement("tr");
    item.setAttribute("name", "roomItem");
    tableElem.appendChild(item);
    updateUser(userInfos[roomId], roomId);
  }
}

function initIndexPage() {
  document.getElementById("div_room").style.display = "none";
  document.getElementById("div_logout").style.display = "none";
  document.getElementById("game").style.display = "none";
}

function loginSuccess(userInfos) {
  document.getElementById("div_room").style.display = "";
  document.getElementById("div_login").style.display = "none";
  document.getElementById("div_logout").style.display = "";
  document.getElementById("div_roomList").style.display = "";
  document.getElementById("showName").innerHTML = username;
  initRoomTable(userInfos);
}

function logoutSuccess() {
  document.getElementById("div_room").style.display = "none";
  document.getElementById("div_login").style.display = "";
  document.getElementById("div_logout").style.display = "none";
  document.getElementById("div_roomList").style.display = "none";
  document.getElementById("game").style.display = "none";
}

function updateUser(userInfos, roomId) {
  var item = document.getElementsByName("roomItem")[roomId];
  item.innerHTML = "room " + (roomId + 1) + ": ";
  for (var i = 0; i < userInfos.length; i++) {
    item.innerHTML += "<td>" + userInfos[i].username + "(" + userInfos[i].started + ")" + "</td>";
  }
}

window.onload = function() {
  initIndexPage();

  pomelo.on('onAdd', function(data) {
    updateUser(data.userInfos, data.roomId);
    document.getElementById("game").style.display = "true";
  });

  pomelo.on('onLeave', function(data) {
    updateUser(data.userInfos, data.roomId);
    document.getElementById("game").style.dispaly = "none";
  });

  pomelo.on('onGameMsg', function(data) {
    if (data.name == "lose") {
      console.log(data);
    }
    Connection._recv(data);
  });

  pomelo.on('onGameStart', function(data) {
    GameMain.start();
  })

  pomelo.on('onGameEnd', function(data) {

  })

  pomelo.on('onOneStart', function(data) {
    updateUser(data.userInfos, data.roomId);
  });

  document.getElementById("login").onclick = function() {
    username = document.getElementById("name").value;
    console.log(username);
    queryEntry(username, function(host, port) {
      pomelo.init({
        host: window.location.hostname,
        port: port,
        log: true
      }, function() {
        var route = "connector.entryHandler.login";
        pomelo.request(route, {
          username: username
        }, function(data) {
          console.log("login succeed");
          console.log(data.userInfos);
          loginSuccess(data.userInfos);
        });
      });
    });
  };

  document.getElementById("join").onclick = function() {
    let room = document.getElementById("room").value;
    let route = "connector.entryHandler.join";
    pomelo.request(route, {
      username: username,
      roomId: room - 1
    }, function(data) {
      console.log("join succeed");
      document.getElementById("leaveRoom").disabled = "";
    });
  };

  document.getElementById("logout").onclick = function() {
    var route = "connector.entryHandler.logout";
    pomelo.request(route, {

    }, function(data) {
      pomelo.disconnect();
      console.log("logout succeed");
      logoutSuccess();
    });
  }

  document.getElementById("leaveRoom").onclick = function() {
    var route = "connector.entryHandler.leaveRoom";
    pomelo.request(route, {

    }, function(data) {
      console.log("leave room succeed");
      document.getElementById("leaveRoom").disabled = "true";
    });
  }

  document.getElementById("start").onclick = function() {
    var route = "game.gameHandler.startRequest";
    pomelo.request(route, {

    }, function(data) {
      // console.log(data);
    });
  }

  document.getElementById("end").onclick = function() {
    var route = "game.gameHandler.end";
    pomelo.request(route, {

    }, function(data) {
      // console.log(data);
    })
  }
}
