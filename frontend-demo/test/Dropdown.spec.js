import {
	mount,
	createLocalVue
} from '@vue/test-utils'
import Comp from '../src/components/drop-down/drop-down.vue'
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

describe('dropDown.vue', () => {
	it('basic test', () => {
		let mock = new MockAdapter(myAxios.instance);
		const spy = sinon.spy()
		const wrapper = mount(Comp, {
			localVue,
			mocks: {
				$router,
				$store
			},
			propsData: {
				spy: spy
			}
        })
        //wrapper.vm.loginComplete()
        wrapper.vm.showHint()
        wrapper.vm.show()
        wrapper.vm.$data.opened = false
        wrapper.vm.hide()
        wrapper.vm.$data.opened = true
        wrapper.vm.hide()
        wrapper.vm.$data.component = undefined
        wrapper.vm.changeComponent()
        wrapper.vm.changeComponent(12345)
        wrapper.vm.$data.component = "userInfo"
        wrapper.vm.loginComplete()
        wrapper.vm.geturls({fileurls:"12345"})
        wrapper.vm.changeComponent()
        wrapper.vm.changeComponent(1234)
		wrapper.vm.requireLogin()
		//const clock = sinon.useFakeTimers();
		//clock.tick(1000)
    })
})