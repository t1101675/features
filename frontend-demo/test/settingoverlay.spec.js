import {
	mount,
	createLocalVue
} from '@vue/test-utils'
import Comp from '../src/components/pre-game/settings-overlay.vue'
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
describe('settingoverlay.vue', () => {
	it('basic test', (done) => {
		let mock = new MockAdapter(myAxios.instance);
        const spy = sinon.spy()
        var myPomelo = {
            request: (str,data,ret) => {
                ret({code:412})
            }
        }
        const parent = {
            onChildComponentMounted: ()=>{},
            changeComponent:(data)=>{},
            sendJoinRequest:(data)=>{},
            readLobbyStatus:(data)=>{},
            queryLobby:(data)=>{},
            lobby_password: "",
            $parent:{
                showErrorMessage:(data)=>{}
            }
        }
        $store.state.parent = parent
		const wrapper = mount(Comp, {
            localVue,
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
        wrapper.vm.show()
        wrapper.vm.onClick({target:{id:'content'},parentElement:undefined})
        wrapper.vm.onClick({target:undefined,parentElement:undefined})
        wrapper.vm.submit()
        wrapper.vm.quit()
        wrapper.vm.$nextTick(() => {
            done()
        })
        //wrapper.destroy()
    }),
    it('overlay test 1', (done) => {
		let mock = new MockAdapter(myAxios.instance);
        const spy = sinon.spy()
        var myPomelo = {
            request: (str,data,ret) => {
                ret({code:200})
            }
        }
        const parent = {
            onChildComponentMounted: ()=>{},
            changeComponent:(data)=>{},
            sendJoinRequest:(data)=>{},
            readLobbyStatus:(data)=>{},
            queryLobby:(data)=>{},
            lobby_password: "",
            $parent:{
                showErrorMessage:(data)=>{}
            }
        }
		const wrapper = mount(Comp, {
            localVue,
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
        wrapper.vm.submit()
        wrapper.vm.$nextTick(() => {
            done()
        })
    }),
    it('overlay test 1', (done) => {
		let mock = new MockAdapter(myAxios.instance);
        const spy = sinon.spy()
        var myPomelo = {
            request: (str,data,ret) => {
                ret({code:404})
            }
        }
        const parent = {
            onChildComponentMounted: ()=>{},
            changeComponent:(data)=>{},
            sendJoinRequest:(data)=>{},
            readLobbyStatus:(data)=>{},
            queryLobby:(data)=>{},
            lobby_password: "",
            $parent:{
                showErrorMessage:(data)=>{}
            }
        }
		const wrapper = mount(Comp, {
            localVue,
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
        wrapper.vm.submit()
        wrapper.vm.$nextTick(() => {
            done()
        })
    })
})