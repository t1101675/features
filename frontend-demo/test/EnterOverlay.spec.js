import {
	mount,
	createLocalVue
} from '@vue/test-utils'
import Comp from '../src/components/pre-game/enter-overlay.vue'
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

describe('EnterOverlay.vue', () => {
	it('basic test', () => {
		let mock = new MockAdapter(myAxios.instance);
		const spy = sinon.spy()
		const $parent = {
            onChildComponentMounted: ()=>{},
            changeComponent:(data)=>{},
            sendJoinRequest:(data)=>{}
        }
		const wrapper = mount(Comp, {
			localVue,
			mocks: {
				$router,
				$store,
				$parent
			},
			propsData: {
				spy: spy
			}
        })
		wrapper.vm.onClick({target:{id:'content'},parentElement:undefined})
		wrapper.vm.onClick({target:undefined,parentElement:undefined})
		wrapper.vm.show()
		wrapper.vm.quit()
        wrapper.vm.$nextTick(() => {
            done()
        })
    })
})