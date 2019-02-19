import {
	mount,
	createLocalVue
} from '@vue/test-utils'
import Comp from '../src/components/overlay.vue'
import ElementUI from 'element-ui';
import sinon from "sinon"
import store from './store';
import myAxios from '../src/axios'
import MockAdapter from 'axios-mock-adapter'
const localVue = createLocalVue()
localVue.use(ElementUI)
const router = {
	path: '/',
	hash: '',
	params: {},
	query: {},
	push: () => {}
}
var mock = new MockAdapter(myAxios.instance);
var spy = sinon.spy()
var wrapper
var netadd = "https://featuresgame.tk:8001"
function init()
{
	mock = new MockAdapter(myAxios.instance);
	spy = sinon.spy()
	wrapper = mount(Comp, {
		localVue,
		mocks: {
			$router:router,
			$store:store,
			$message: spy
		},
		propsData: {
			value: false
		}
	})
}
describe('ovelay.vue', () => {
	it('basic test', () => {
        init()
        wrapper.vm.$data.closable  = false
        wrapper.vm.$data.show_button = false
        wrapper.vm.mainClick()
        wrapper.vm.$data.closable  = true
        wrapper.vm.$data.show_button = false
        wrapper.vm.mainClick()
	})
})