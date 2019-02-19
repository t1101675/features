import {
	mount,
	createLocalVue 
} from '@vue/test-utils'
import Comp from '../src/components/game.vue'
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
describe('game.vue', () => {
    it('has a mounted hook', () => {
        expect(typeof Comp.mounted).toBe('function')
    }),
    it('has a before mount hook', () => {
        expect(typeof Comp.beforeMount).toBe('function')
    }),
	it('basic test', (done) => {
        let mock = new MockAdapter(myAxios.instance);
        mock.onGet("/js/main.js").reply(200,"adslfkjaslfkjasklfj")
        mock.onGet("/scripts/modules.js").reply(200,"adslfkjaslfkjasklfj")
        const spy = sinon.spy()
        var myPomelo = {
            request: (str,data,ret) => {
                ret({code:200}) 
            },
            on:(data,ret) =>{
                ret("gameInfo",{heroes:["","1234"]})
            }
        }
        const $parent = {
            onChildComponentMounted: ()=>{},
            changeComponent:(data)=>{},
            sendJoinRequest:(data)=>{}
        }
        $store.state.parent = $parent
		const wrapper = mount(Comp, {
            localVue,
            parent:$parent,
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
        wrapper.vm.loadWP()
        wrapper.vm.loadJS()
        wrapper.vm.loadMain()
        wrapper.vm.loadGameMain()
        wrapper.vm.loadDependencies()
        setTimeout(()=>{
            done()
        },1000)
    })
})