import {
	mount,
	createLocalVue
} from '@vue/test-utils'
import Login from '../src/components/drop-down/userinfo.vue'
import ElementUI from 'element-ui';
import sinon from "sinon"
import store from './store';
import myAxios from '../src/axios'
import MockAdapter from 'axios-mock-adapter'
import axios from 'axios';
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
}
describe('Login.vue', () => {
	it('base test', (done) => {
		init()
		mock.onGet(netadd+'/api/ranklist').reply(200, {
			info_code: 0
		})
		wrapper = mount(Login, {
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
		setTimeout(() => {
			//expect(spy.args[0]).toEqual([{type: "info",message: "用户名或密码错误"}]);
			done()
		}, 0);
	}), 
	it('base test2', (done) => {
		init()
		mock.onGet(netadd+'/api/ranklist').reply(401, {
			info_code: 1
		})
		let mock2 = new MockAdapter(axios)
		mock2.onPost("https://featuresgame.tk:8001/api/upload_profile").reply(200,{

		})
		wrapper = mount(Login, {
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
		var file = new Blob([
			JSON.stringify({})
		 ], { type: 'application/json',name:1234 })
		wrapper.vm.beforeUploadProfile(file)
		//wrapper.vm.logOut()
		setTimeout(() => {
			//expect(spy.args[0]).toEqual([{type: "info",message: "用户名或密码错误"}]);
			done()
		}, 0);
	}),
	it('base test2', (done) => {
		init()
		mock.onGet(netadd+'/api/ranklist').reply(401, {
			info_code: 1
		})
		let mock2 = new MockAdapter(axios)
		mock2.onPost("https://featuresgame.tk:8001/api/upload_profile").reply(401,{
			
		})
		wrapper = mount(Login, {
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
		var file = new Blob([
			JSON.stringify({})
		 ], { type: 'application/json',name:1234 })
		wrapper.vm.beforeUploadProfile(file)
		//wrapper.vm.logOut()
		setTimeout(() => {
			//expect(spy.args[0]).toEqual([{type: "info",message: "用户名或密码错误"}]);
			done()
		}, 0);
	})
})