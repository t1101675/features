import {
	mount,
	createLocalVue
} from '@vue/test-utils'
import Comp from '../src/components/post-game/victory.vue'
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
    query: {},
    push:()=>{}
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
    onChildComponentMounted: ()=>{},
    changeComponent:(data,data2)=>{},
    sendJoinRequest:(data)=>{}
}
describe('victory.vue', () => {
    it('has a mounted hook', () => {
        expect(typeof Comp.mounted).toBe('function')
    }),
	it('basic test', (done) => {
		const wrapper = mount(Comp, {
            localVue,
			mocks: {
				$router,
                $store,
			},
			propsData: {
                isTest: true,
                parent: parent
			}
        })
        wrapper.vm.buttonShare()
        wrapper.vm.buttonAgain()
        wrapper.vm.$nextTick(() => {
            done()
        })
    })
})