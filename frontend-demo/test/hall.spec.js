import {
	mount,
	createLocalVue
} from '@vue/test-utils'
import Comp from '../src/components/pre-game/hall.vue'
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
    changeComponent:()=>{},
    onChildComponentMounted:()=>{}
}
describe('hall.vue', () => {
    it('has a mounted hook', () => {
        expect(typeof Comp.mounted).toBe('function')
    }),
    it('has a before mount hook', () => {
        expect(typeof Comp.beforeMount).toBe('function')
    }),
	it('basic test', (done) => {
		let mock = new MockAdapter(myAxios.instance);
        const spy = sinon.spy()
        var myPomelo = {
            request: (str,data,ret) => {
                ret({code:200})
            }
        }
        const $parent = {
            onChildComponentMounted: ()=>{},
            changeComponent:(data)=>{},
            sendJoinRequest:(data)=>{}
        }
        $store.state.pomelo = myPomelo
        $store.state.parent = parent
        $store.state.alert = spy
		const wrapper = mount(Comp, {
            sync:false,
            localVue,
            parent:$parent,
			mocks: {
				$router,
                $store,
			},
			propsData: {
                isTest: true,
			}
        })
        wrapper.vm.readHallStatus({
            hall_status:{
                lobby_id:{
                    players:null
                }
            },
            online_players:0
        })
        wrapper.vm.readHallStatus({
            hall_status:{
                lobby_id:{
                    players:[{
                        uid:1234
                    }]
                }
            },
            online_players:0
        })
        wrapper.vm.createLobby()
        wrapper.vm.$data.hall_status = [{lobby_id: 0, password: 100}]
        wrapper.vm.joinLobby(0)
        //wrapper.vm.$data.lobbies = {"0":{}}
        //wrapper.vm.joinLobby("0")
        wrapper.vm.sendJoinRequest()
        wrapper.vm.queryHall()
        //wrapper.vm.beforeDestroy()
        wrapper.vm.$nextTick(() => {
            done()
        })
    }),
    it('lobby test', (done) => {
		let mock = new MockAdapter(myAxios.instance);
        const spy = sinon.spy()
        var myPomelo = {
            request: (str,data,ret) => {
                ret({code:404})
            }
        }
		const wrapper = mount(Comp, {
            localVue,
            sync:false,
			mocks: {
				$router,
                $store,
			},
			propsData: {
                isTest: true,
                pomelo: myPomelo,
                parent:parent,
                alert:spy
			}
        })
        wrapper.vm.createLobby()
        wrapper.vm.sendJoinRequest()
        wrapper.vm.$nextTick(() => {
            done()
        })
    }),
    it('lobby test2', (done) => {
		let mock = new MockAdapter(myAxios.instance);
        const spy = sinon.spy()
        var myPomelo = {
            request: (str,data,ret) => {
                ret({code:503})
            }
        }
		const wrapper = mount(Comp, {
            localVue,
            sync:false,
			mocks: {
				$router,
                $store,
			},
			propsData: {
                isTest: true,
                pomelo: myPomelo,
                parent: parent,
                alert:spy
			}
        })
        wrapper.vm.createLobby()
        wrapper.vm.$nextTick(() => {
            done()
        })
    }),
    it('lobby test3', (done) => {
		let mock = new MockAdapter(myAxios.instance);
        const spy = sinon.spy()
        var myPomelo = {
            request: (str,data,ret) => {
                ret({})
            }
        }
		const wrapper = mount(Comp, {
            localVue,
            sync:false,
			mocks: {
				$router,
                $store,
			},
			propsData: {
                isTest: true,
                pomelo: myPomelo,
                parent: parent,
                alert:spy
			}
        })
        wrapper.vm.createLobby()
        wrapper.vm.$data.hall_status = [{lobby_id: 0, password: ''}]
        wrapper.vm.joinLobby(0)
        wrapper.vm.queryHall()
        wrapper.vm.$nextTick(() => {
            done()
        })
    }),
    it('lobby test3', (done) => {
		let mock = new MockAdapter(myAxios.instance);
        const spy = sinon.spy()
        var myPomelo = {
            request: (str,data,ret) => {
                ret()
            }
        }
		const wrapper = mount(Comp, {
            localVue,
            sync:false,
			mocks: {
				$router,
                $store,
			},
			propsData: {
                isTest: true,
                pomelo: myPomelo,
                parent: parent,
                alert:spy
			}
        })
        wrapper.vm.queryHall()
        wrapper.vm.$nextTick(() => {
            done()
        })
        wrapper.destroy()
    })
})