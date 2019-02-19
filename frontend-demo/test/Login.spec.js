import {
	mount,
	createLocalVue
} from '@vue/test-utils'
import Login from '../src/components/drop-down/login.vue'
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
function init()
{
	mock = new MockAdapter(myAxios.instance);
	spy = sinon.spy()
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
}
describe('Login.vue', () => {
	it('user unexist', (done) => {
		init()
		mock.onPost('https://featuresgame.tk:8001/api/login').reply(200, {
			info_code: 1
		})
		wrapper.vm.$data.loginForm.username = "1234";
		wrapper.vm.$data.loginForm.password = "123";
		wrapper.vm.submitForm('loginForm')
		setTimeout(() => {
			expect(spy.args[0]).toEqual([{type: "info",message: "用户名不存在"}]);
			done()
		}, 0);
	}),
	it('link fail', (done) => {
		init()
		mock.onPost('https://featuresgame.tk:8001/api/login').reply(401, {})
		wrapper.vm.$data.loginForm.username = "1234";
		wrapper.vm.$data.loginForm.password = "123";
		wrapper.vm.submitForm('loginForm')
		setTimeout(() => {
			expect(spy.args[0][0].type).toEqual('error')
			done()
		}, 0);
	})
	it('password wrong', (done) => {
		init()
		mock.onPost('https://featuresgame.tk:8001/api/login').reply(200, {
			info_code: 2
		});
		wrapper.vm.$data.loginForm.username = "1234";
		wrapper.vm.$data.loginForm.password = "123456";
		wrapper.vm.submitForm('loginForm');
		setTimeout(() => {
			expect(spy.args[0]).toEqual([{type: "info",message: "用户名或密码错误"}]);
			done()
		}, 0);
	}),
	it('inactive', (done) => {
		init()
		mock.onPost('https://featuresgame.tk:8001/api/login').reply(200, {
			info_code: 3
		});
		wrapper.vm.$data.loginForm.username = "1234";
		wrapper.vm.$data.loginForm.password = "123456";
		wrapper.vm.submitForm('loginForm');
		setTimeout(() => {
			expect(spy.args[0]).toEqual([{type: "info",message: "账户尚未激活，请检查邮件"}]);
			done()
		}, 0);
	}),
	it('success', (done) => {
		init()
		mock.onPost('https://featuresgame.tk:8001/api/login').reply(200, {
			info_code: 0
		});
		wrapper.vm.$data.loginForm.username = "1234";
		wrapper.vm.$data.loginForm.password = "123456";
		wrapper.vm.$data.remember_pass = true;
		wrapper.vm.$data.$parent = {
			loginComplete:()=>{}
		}
		wrapper.vm.submitForm('loginForm');
		setTimeout(() => {
			done()
		}, 0);
	}),
	it('success', (done) => {
		init()
		mock.onPost('https://featuresgame.tk:8001/api/login').reply(200, {
			info_code: 0
		});
		wrapper.vm.$data.loginForm.username = "1234";
		wrapper.vm.$data.loginForm.password = "123456";
		wrapper.vm.$data.remember_pass = false;
		wrapper.vm.$data.$parent = {
			loginComplete:()=>{}
		}
		wrapper.vm.submitForm('loginForm');
		setTimeout(() => {
			done()
		}, 0);
	}),
	
	it('server error', (done) => {
		init()
		mock.onPost('https://featuresgame.tk:8001/api/login').reply(200, {
			info_code: 4
		});
		wrapper.vm.$data.loginForm.username = "1234";
		wrapper.vm.$data.loginForm.password = "123456";
		wrapper.vm.$data.remember_pass = true;

		wrapper.vm.submitForm('loginForm');
		setTimeout(() => {
			expect(spy.args[0]).toEqual([{type: "info",message: "服务器错误"}]);
			done()
		}, 0);
	}),
	it('input illegal', (done) => {
		init()
		wrapper.vm.$data.loginForm.username = "1";
		wrapper.vm.$data.loginForm.password = "123456";
		wrapper.vm.submitForm('loginForm');
		wrapper.vm.$data.loginForm.username = "12314214423";
		wrapper.vm.$data.loginForm.password = "123456";
		wrapper.vm.submitForm('loginForm');
		wrapper.vm.$data.loginForm.username = "12314";
		wrapper.vm.$data.loginForm.password = "";
		wrapper.vm.submitForm('loginForm');
		wrapper.vm.$data.loginForm.username = "??????";
		wrapper.vm.$data.loginForm.password = "1234";
		wrapper.vm.submitForm('loginForm');
		setTimeout(() => {
			expect(spy.callCount).toEqual(0)
			done()
		}, 0);
	})
})