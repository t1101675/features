/**
  * 游戏内房间测试
  */
const chai = require('chai')
const expect = chai.expect
const should = require('should')

const PE = require('../../game-server/app/servers/game/handler/objectClasses/world').World

describe('Room in game test', function () {
  it('should run normally', function (done) {
    let pe = new PE(5, 5)
    let players = [{uid: 'lyricz', roomId: 1}, {uid: 'liuchang', roomId: 1}, {uid: 'dage', roomId: 1}, {uid: 'gushen', roomId: 1}]
    pe.setPlayers(players)
    /* Set players ready */
    for (let i = 0; i < 4; ++ i) {
          pe.setPlayerState(players[i].uid, true)
        }
    pe.isReady().should.equal(true)

    let rooms = pe.rooms
    let t_room = rooms[0]
    t_room.roomId = 0
    let t_obj = pe.players['lyricz']

    t_room.addPlayer(t_obj)
    t_room.enterRoom(t_obj, 'left', '')
    t_room.enterRoom(t_obj, 'right', '')
    t_room.enterRoom(t_obj, 'up', '')
    t_room.enterRoom(t_obj, 'down', '')
    t_room.leaveRoom(t_obj)

    t_room.getInitRoomInfo()
    t_room.getInitDoorInfo()
    t_room.getInitSceneInfo()
    t_room.getPropsInfo()
    t_room.getInitWallsInfo()
    // t_room.getGameInfo()
    t_room.getHeroesInfo()
    t_room.getPropsInfo()
    t_room.tick(10)

    done()
  })
})
