import {
	mount,
	createLocalVue
} from '@vue/test-utils'
import Comp from '../src/components/main.vue'
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
const localVue = createLocalVue()
localVue.use(ElementUI)
localVue.use(Vuex);

var parent = {
    onChildComponentMounted: ()=>{},
    changeComponent:(data)=>{},
    sendJoinRequest:(data)=>{}
}
describe('main.vue', () => {
    it('has a mounted hook', () => {
        expect(typeof Comp.mounted).toBe('function')
    }),
    it('has a before mount hook', () => {
        expect(typeof Comp.beforeMount).toBe('function')
    }),
	it('basic test', (done) => {
		let mock = new MockAdapter(myAxios.instance);
        mock.onPost('https://featuresgame.tk:8001/api/login').reply(200, {
            info_code: 0
        })
        const spy = sinon.spy()
        var myPomelo = {
            request: (str,data,ret) => {
                ret({code:200})
            },
            init: (data,ret) => {
                ret()
            },
            disconnect:()=>{},
            on:(data,ret)=>{
                ret({code:200})
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
                isTest2: true,
                pomelo: myPomelo,
                parent: parent,
                alert:spy
			}
        })
        wrapper.vm.loadScripts()
        wrapper.vm.initConnection()
        wrapper.vm.current_component = true
        wrapper.vm.changeComponent('victory','reverse')
        wrapper.vm.changeComponent('1234','sdfaf')
        wrapper.vm.showErrorMessage({code:1234,info:1234})
        wrapper.vm.onChildComponentMounted()
        setTimeout(()=>{setTimeout(()=>{
            wrapper.vm.onChildComponentMounted()
            done()
        },3000)},3000)
    }),
    it('basic test', (done) => {
		let mock = new MockAdapter(myAxios.instance);
        mock.onPost('https://featuresgame.tk:8001/api/login').reply(200, {
            info_code: 1
        })
        const spy = sinon.spy()
        var myPomelo = {
            request: (str,data,ret) => {
                ret({code:200})
            },
            init: (data,ret) => {
                ret()
            },
            disconnect:()=>{}
        }
		const wrapper = mount(Comp, {
            localVue,
			mocks: {
				$router,
                $store,
			},
			propsData: {
                isTest: true,
                isTest2: true,
                pomelo: myPomelo,
                parent: parent,
                alert:spy
			}
        })
        wrapper.vm.loadScripts()
        wrapper.vm.initConnection()
        wrapper.vm.current_component = true
        wrapper.vm.changeComponent('victory','reverse')
        wrapper.vm.changeComponent('1234','sdfaf')
        wrapper.vm.showErrorMessage({code:1234,info:1234})
        wrapper.vm.onChildComponentMounted()
        setTimeout(()=>{setTimeout(()=>{
            wrapper.vm.onChildComponentMounted()
            done()
        },3000)},3000)
    }),
    it('basic test', (done) => {
		let mock = new MockAdapter(myAxios.instance);
        mock.onPost('https://featuresgame.tk:8001/api/login').reply(200, {
            info_code: 0
        })
        const spy = sinon.spy()
        var myPomelo = {
            request: (str,data,ret) => {
                ret({code:200,port:2000})
            },
            init: (data,ret) => {
                ret()
            },
            disconnect:()=>{}
        }
        $store.state.pomelo = myPomelo
		const wrapper = mount(Comp, {
            localVue,
			mocks: {
				$router,
                $store,
			},
			propsData: {
                isTest: true,
                isTest2: false,
                pomelo: myPomelo,
                parent: parent,
                alert:spy
			}
        })
        wrapper.vm.initConnection()
        wrapper.vm.loadScripts()
        wrapper.vm.initConnection()
        wrapper.vm.current_component = true
        wrapper.vm.changeComponent('victory','reverse')
        wrapper.vm.changeComponent('1234','sdfaf')
        wrapper.vm.showErrorMessage({code:1234,info:1234})
        wrapper.vm.onChildComponentMounted()
        setTimeout(()=>{setTimeout(()=>{
            wrapper.vm.onChildComponentMounted()
            done()
        },3000)},3000)
    })
})