import {
  mount,
  createLocalVue,
  shallowMount
} from '@vue/test-utils'
import Comp from '../src/components/pre-game/lobby.vue'
import ElementUI from 'element-ui';
import sinon from "sinon"
import Vuex from 'vuex'
import $store from "./store"
import myAxios from '../src/axios'
import MockAdapter from 'axios-mock-adapter'

const $router = {
  path: '/',
  hash: '',
  params: {},
  query: {}
}
const GlobalPlugins = {
  install(v) {
    // Event bus
    v.prototype.$bus = EventBus;
  },
};
const localVue = createLocalVue()
localVue.use(ElementUI)
localVue.use(Vuex);

var parent = {
  changeComponent: () => {
  },
  onChildComponentMounted: () => {
  },
  showErrorMessage: () => {
  },
  $refs:{
    overlay: {
      showTimeoutMessage: (str)=>{}
    }
  }
}
describe('lobby.vue', () => {
  it('has a mounted hook', () => {
    expect(typeof Comp.mounted).toBe('function')
  }),
      it('has a before mount hook', () => {
        expect(typeof Comp.beforeMount).toBe('function')
      }),
      it("test test",(done)=>{
          let mock = new MockAdapter(myAxios.instance);
          const spy = sinon.spy()
          var myPomelo = {
            request: (str, data, ret) => {
              ret({code: 200})
            }
          }
          var status = {
            players: [
              {
                uid: 'p0',
                ready: false,
                slot: 0
              },
              {
                uid: 'p1',
                ready: true,
                slot: 0
              },
              {
                uid: 'p2',
                ready: false,
                slot: 0
              },
              {
                uid: 'p3',
                ready: true,
                slot: 0
              },
            ]
          }
          $store.state.parent = parent
          $store.state.pomelo = myPomelo
          $store.state.username = 'p0'
          $store.state.known_nicknames = {
            'p0': 'n0', 'p1': 'n1', 'p2': 'n2', 'p3': 'n3'
          }
          const wrapper = shallowMount(Comp, {
            localVue,
            mocks: {
              $router,
              $store,
            },
            propsData: {
              isTest: true,
              lobbystatus: status
            }
          })
          console.log(wrapper.vm.$data.on_receive)
          wrapper.vm.$data.on_receive.lobby_status()
          wrapper.vm.$data.on_receive.gameStart()
          wrapper.vm.$data.on_receive.kicked()
          setTimeout(()=>{
            done()
          },2000)
      })
      
      it('basic test', (done) => {
        let mock = new MockAdapter(myAxios.instance);
        const spy = sinon.spy()
        var myPomelo = {
          request: (str, data, ret) => {
            ret({code: 200})
          }
        }
        var status = {
          players: [
            {
              uid: 'p0',
              ready: false,
              slot: 0
            },
            {
              uid: 'p1',
              ready: true,
              slot: 0
            },
            {
              uid: 'p2',
              ready: false,
              slot: 0
            },
            {
              uid: 'p3',
              ready: true,
              slot: 0
            },
          ]
        }
        $store.state.parent = parent
        $store.state.pomelo = myPomelo
        $store.state.username = 'p0'
        $store.state.known_nicknames = {
          'p0': 'n0', 'p1': 'n1', 'p2': 'n2', 'p3': 'n3'
        }
        const wrapper = shallowMount(Comp, {
          localVue,
          mocks: {
            $router,
            $store,
          },
          propsData: {
            isTest: true,
            lobbystatus: status
          }
        })
        wrapper.vm.$data.uid = 0
        wrapper.vm.$data.allDisabled = true
        wrapper.vm.onClick()
        wrapper.vm.$data.allDisabled = false
        wrapper.vm.onClick({
          target:{
            id:"move_1234"
          },
          parentElement: undefined
        })
        wrapper.vm.onClick({
          target:{
            id:"kick_1234"
          },
          parentElement: undefined
        })
        wrapper.vm.onClick({
          target:{
            idd:"kick_1234"
          },
          parentElement: undefined
        })
        wrapper.vm.onClick({
          target:{
            id:"kick_1234_sadf"
          },
          parentElement: undefined
        })
        wrapper.vm.onClick({
          target:undefined
        })
        wrapper.vm.onClick({
          target:{
            id:"block_1234"
          },
          parentElement: undefined
        })
        wrapper.vm.readLobbyStatus(status)
        wrapper.vm.$data.uid = 1
        wrapper.vm.readLobbyStatus(status)
        wrapper.vm.$data.uid = 2
        wrapper.vm.readLobbyStatus(status)
        wrapper.vm.playerClick(-1)
        wrapper.vm.playerClick(1 / 0)
        wrapper.vm.playerClick(0)
        wrapper.vm.checkAllset()
        wrapper.vm.$data.lobby_status.players[2].ready = true;
        wrapper.vm.checkAllset()
        wrapper.vm.$data.start_button_text = '准备'
        wrapper.vm.ready()
        wrapper.vm.$data.start_button_text = '准备1234'
        wrapper.vm.ready()
        wrapper.vm.$data.start_button_text = '取消准备'
        wrapper.vm.ready()
        wrapper.vm.move(-1)
        wrapper.vm.kick(-1)
        //wrapper.vm.settings()
        wrapper.vm.queryLobby()
        wrapper.vm.quit()
        wrapper.vm.$nextTick(() => {
          done()
        })
        wrapper.destroy()
      }),
      it('basic test', (done) => {
        let mock = new MockAdapter(myAxios.instance);
        const spy = sinon.spy()
        var myPomelo = {
          request: (str, data, ret) => {
            ret({code: 510})
          }
        }
        var status = {
          players: [
            {
              uid: 'p0',
              ready: false,
              slot: 0
            },
            {
              uid: 'p1',
              ready: true,
              slot: 0
            },
            {
              uid: 'p2',
              ready: false,
              slot: 0
            },
            {
              uid: 'p3',
              ready: true,
              slot: 0
            },
          ]
        }
        $store.state.parent = parent
        $store.state.pomelo = myPomelo
        $store.state.username = 'p0'
        $store.state.known_nicknames = {
          'p0': 'n0', 'p1': 'n1', 'p2': 'n2', 'p3': 'n3'
        }
        const wrapper = shallowMount(Comp, {
          localVue,
          mocks: {
            $router,
            $store,
          },
          propsData: {
            isTest: true,
            lobbystatus: status
          }
        })
        wrapper.vm.$data.uid = 0
        wrapper.vm.$data.allDisabled = true
        wrapper.vm.onClick()
        wrapper.vm.$data.allDisabled = false
        wrapper.vm.onClick({
          target:{
            id:"move_1234"
          },
          parentElement: undefined
        })
        wrapper.vm.onClick({
          target:{
            id:"kick_1234"
          },
          parentElement: undefined
        })
        wrapper.vm.onClick({
          target:{
            idd:"kick_1234"
          },
          parentElement: undefined
        })
        wrapper.vm.onClick({
          target:{
            id:"kick_1234_sadf"
          },
          parentElement: undefined
        })
        wrapper.vm.onClick({
          target:undefined
        })
        wrapper.vm.onClick({
          target:{
            id:"block_1234"
          },
          parentElement: undefined
        })
        wrapper.vm.readLobbyStatus(status)
        wrapper.vm.$data.uid = 1
        wrapper.vm.readLobbyStatus(status)
        wrapper.vm.$data.uid = 2
        wrapper.vm.readLobbyStatus(status)
        wrapper.vm.playerClick(-1)
        wrapper.vm.playerClick(1 / 0)
        wrapper.vm.playerClick(0)
        wrapper.vm.checkAllset()
        wrapper.vm.$data.lobby_status.players[2].ready = true;
        wrapper.vm.checkAllset()
        wrapper.vm.$data.start_button_text = '准备'
        wrapper.vm.ready()
        wrapper.vm.$data.start_button_text = '准备1234'
        wrapper.vm.ready()
        wrapper.vm.$data.start_button_text = '取消准备'
        wrapper.vm.ready()
        wrapper.vm.move(-1)
        wrapper.vm.kick(-1)
        //wrapper.vm.settings()
        wrapper.vm.queryLobby()
        wrapper.vm.quit()
        wrapper.vm.$nextTick(() => {
          done()
        })
        wrapper.destroy()
      }),
      it('basic test', (done) => {
        let mock = new MockAdapter(myAxios.instance);
        const spy = sinon.spy()
        var myPomelo = {
          request: (str, data, ret) => {
            ret({code: 510})
          }
        }
        var status = {
          players: [0, 1, 2, 3],
          ready_status: [0, 1, 0, 1],
          max_player: 10
        }
        const wrapper = shallowMount(Comp, {
          localVue,
          mocks: {
            $router,
            $store,
          },
          propsData: {
            isTest: true,
            pomelo: myPomelo,
            parent: parent,
            alert: spy,
            lobbystatus: status
          }
        })
        wrapper.vm.$data.uid = 0
        wrapper.vm.$data.allDisabled = true
        wrapper.vm.onClick()
        wrapper.vm.$refs.settings.show = () => {
        }
        wrapper.vm.settings()
        wrapper.vm.readLobbyStatus(status)
        wrapper.vm.$data.uid = 1
        wrapper.vm.readLobbyStatus(status)
        wrapper.vm.$data.uid = 2
        wrapper.vm.readLobbyStatus(status)
        wrapper.vm.playerClick(-1)
        wrapper.vm.playerClick(1 / 0)
        wrapper.vm.playerClick(0)
        wrapper.vm.$data.lobby_status.max_player = 1
        wrapper.vm.checkAllset()
        wrapper.vm.$data.lobby_status.max_player = 4
        wrapper.vm.checkAllset()
        wrapper.vm.$data.start_button_text = '准备'
        wrapper.vm.ready()
        wrapper.vm.$data.start_button_text = '准备1234'
        wrapper.vm.ready()
        wrapper.vm.$data.start_button_text = '取消准备'
        wrapper.vm.ready()
        wrapper.vm.move(-1)
        wrapper.vm.kick(-1)
        wrapper.vm.queryLobby()
        wrapper.vm.quit()
        wrapper.vm.$nextTick(() => {
          done()
        })
        wrapper.vm.$data.lobby_status.players=[1234]
        wrapper.vm.checkAllset()
        wrapper.destroy()
      }),
      it('basic test2', (done) => {
        let mock = new MockAdapter(myAxios.instance);
        const spy = sinon.spy()
        var myPomelo = {
          request: (str, data, ret) => {
            ret({code: 404})
          }
        }
        var status = {
          players: [
            {
              uid: 'p0',
              ready: false,
              slot: 0
            },
            {
              uid: 'p1',
              ready: true,
              slot: 0
            },
            {
              uid: 'p2',
              ready: false,
              slot: 0
            },
            {
              uid: 'p3',
              ready: true,
              slot: 0
            },
          ]
        }
        const wrapper = shallowMount(Comp, {
          localVue,
          mocks: {
            $router,
            $store,
          },
          propsData: {
            isTest: true,
            pomelo: myPomelo,
            parent: parent,
            alert: spy,
            lobbystatus: status
          }
        })
        wrapper.vm.$data.uid = 'p0'
        wrapper.vm.$data.allDisabled = true
        wrapper.vm.onClick()
        wrapper.vm.readLobbyStatus(status)
        wrapper.vm.$data.uid = 'p1'
        wrapper.vm.readLobbyStatus(status)
        wrapper.vm.$data.uid = 'p2'
        wrapper.vm.readLobbyStatus(status)
        wrapper.vm.playerClick(-1)
        wrapper.vm.playerClick(1 / 0)
        wrapper.vm.playerClick(0)
        wrapper.vm.checkAllset()
        wrapper.vm.$data.lobby_status.players[2].ready = true;
        wrapper.vm.checkAllset()
        wrapper.vm.$data.start_button_text = '准备'
        wrapper.vm.ready()
        wrapper.vm.$data.start_button_text = '准备1234'
        wrapper.vm.ready()
        wrapper.vm.$data.start_button_text = '取消准备'
        wrapper.vm.ready()
        wrapper.vm.move(-1)
        wrapper.vm.kick(-1)
        //wrapper.vm.settings()
        wrapper.vm.queryLobby()
        wrapper.vm.quit()
        wrapper.vm.$nextTick(() => {
          done()
        })
        wrapper.destroy()
      }),
      it('basic test', (done) => {
        let mock = new MockAdapter(myAxios.instance);
        const spy = sinon.spy()
        var myPomelo = {
          request: (str, data, ret) => {
            ret()
          }
        }
        var status = {
          players: [
            {
              uid: 'p0',
              ready: false,
              slot: 0
            },
            {
              uid: 'p1',
              ready: true,
              slot: 0
            },
            {
              uid: 'p2',
              ready: false,
              slot: 0
            },
            {
              uid: 'p3',
              ready: true,
              slot: 0
            },
          ]
        }
        const wrapper = shallowMount(Comp, {
          localVue,
          mocks: {
            $router,
            $store,
          },
          propsData: {
            isTest: true,
            pomelo: myPomelo,
            parent: parent,
            alert: spy,
            lobbystatus: status
          }
        })
        wrapper.vm.$data.uid = 0
        wrapper.vm.queryLobby()
        wrapper.vm.$nextTick(() => {
          done()
        })
      })
})
