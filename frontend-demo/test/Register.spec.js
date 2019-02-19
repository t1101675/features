import {
	mount,
	createLocalVue
} from '@vue/test-utils'
import Register from '../src/components/drop-down/register.vue'
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
var mock
var spy
var wrapper
function init()
{
	mock = new MockAdapter(myAxios.instance);
	spy = sinon.spy()
	wrapper = mount(Register, {
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
describe('Register.vue', () => {
	it('user exist', (done) => {
		init()
		mock.onPost('https://featuresgame.tk:8001/api/register').reply(200, {
			info_code: 1
		})
		mock.onPost('https://featuresgame.tk:8001/api/chav').reply(200, {
			info_code: 0
		})
		wrapper.vm.$data.loginForm.username = "jkxing";
		wrapper.vm.$data.loginForm.password = "12345678";
		wrapper.vm.$data.loginForm.checkPass = "12345678";
		wrapper.vm.$data.loginForm.email = "1234@qq.com";
		wrapper.vm.submitForm('loginForm')
		setTimeout(() => {
			expect(spy.args[0]).toEqual([{type: "info",message: "用户名已存在"}]);
			done()
		}, 0);
	}),
	it('email sent fail', (done) => {
		init() 
		mock.onPost('https://featuresgame.tk:8001/api/register').reply(200, {
			info_code: 2
		})
		mock.onPost('https://featuresgame.tk:8001/api/chav').reply(200, {
			info_code: 0
		})
		wrapper.vm.$data.loginForm.username = "jkxing";
		wrapper.vm.$data.loginForm.password = "12345678";
		wrapper.vm.$data.loginForm.checkPass = "12345678";
		wrapper.vm.$data.loginForm.email = "1234@qq.com";
		wrapper.vm.submitForm('loginForm')
		setTimeout(() => {
			expect(spy.args[0]).toEqual([{type: "info",message: "邮件发送失败"}]);
			done()
		}, 0);
	}),
	it('info_code wrong', (done) => {
		init() 
		mock.onPost('https://featuresgame.tk:8001/api/register').reply(200, {
			info_code: 123
		})
		mock.onPost('https://featuresgame.tk:8001/api/chav').reply(200, {
			info_code: 0
		})
		wrapper.vm.$data.loginForm.username = "jkxing";
		wrapper.vm.$data.loginForm.password = "12345678";
		wrapper.vm.$data.loginForm.checkPass = "12345678";
		wrapper.vm.$data.loginForm.email = "1234@qq.com";
		wrapper.vm.submitForm('loginForm')
		setTimeout(() => {
			//expect(spy.args[0]).toEqual([{type: "info",message: "邮件发送失败"}]);
			done()
		}, 0);
	}),
	it('checkfail', (done) => {
		init()
		mock.onPost('https://featuresgame.tk:8001/api/register').reply(200, {
			info_code: 2
		})
		mock.onPost('https://featuresgame.tk:8001/api/chav').reply(401, {
			info_code: 0
		})
		wrapper.vm.$data.loginForm.username = "jkxing";
		wrapper.vm.$data.loginForm.password = "12345678";
		wrapper.vm.$data.loginForm.checkPass = "12345678";
		wrapper.vm.$data.loginForm.email = "1234@qq.com";
		wrapper.vm.submitForm('loginForm')
		setTimeout(() => {
			expect(spy.callCount).toEqual(0);
			done()
		}, 0);
	}),
	it('checkfail2', (done) => {
		init()
		mock.onPost('https://featuresgame.tk:8001/api/register').reply(200, {
			info_code: 2
		})
		mock.onPost('https://featuresgame.tk:8001/api/chav').reply(200, {
			info_code: 1
		})
		wrapper.vm.$data.loginForm.username = "jkxing";
		wrapper.vm.$data.loginForm.password = "12345678";
		wrapper.vm.$data.loginForm.checkPass = "12345678";
		wrapper.vm.$data.loginForm.email = "1234@qq.com";
		wrapper.vm.submitForm('loginForm')
		setTimeout(() => {
			expect(spy.callCount).toEqual(0);
			done()
		}, 0);
	}),
	it('link fail', (done) => {
		init()
		mock.onPost('https://featuresgame.tk:8001/api/register').reply(401, {
			info_code: 2
		})
		mock.onPost('https://featuresgame.tk:8001/api/chav').reply(200, {
			info_code: 0
		})
		wrapper.vm.$data.loginForm.username = "jkxing";
		wrapper.vm.$data.loginForm.password = "12345678";
		wrapper.vm.$data.loginForm.checkPass = "12345678";
		wrapper.vm.$data.loginForm.email = "1234@qq.com";
		wrapper.vm.submitForm('loginForm')
		setTimeout(() => {
			expect(spy.args[0][0].type).toEqual('error')
			done()
		}, 0);
	}),
	it('success', (done) => {
		init()
		mock.onPost('https://featuresgame.tk:8001/api/register').reply(200, {
			info_code: 0
		})
		mock.onPost('https://featuresgame.tk:8001/api/chav').reply(200, {
			info_code: 0
		})
		wrapper.vm.$data.loginForm.username = "jkxing";
		wrapper.vm.$data.loginForm.password = "12345678";
		wrapper.vm.$data.loginForm.checkPass = "12345678";
		wrapper.vm.$data.loginForm.email = "1234@qq.com";
		wrapper.vm.submitForm('loginForm')
			setTimeout(() => {expect(spy.args[0]).toEqual([{type: "success",message: "注册成功"}]);
			done()
		}, 0);
	}),
	it('input illegal', (done) => {
		init()
		mock.onPost('https://featuresgame.tk:8001/api/chav').reply(200, {
			info_code: 0
		})
		wrapper.vm.$data.loginForm.username = "jkx";
		wrapper.vm.$data.loginForm.password = "12345678";
		wrapper.vm.$data.loginForm.checkPass = "12345678";
		wrapper.vm.$data.loginForm.email = "1234@qq.com";
		wrapper.vm.submitForm('loginForm');
		wrapper.vm.$data.loginForm.username = "jkxingjkxing";
		wrapper.vm.$data.loginForm.password = "12345678";
		wrapper.vm.$data.loginForm.checkPass = "12345678";
		wrapper.vm.$data.loginForm.email = "1234@qq.com";
		wrapper.vm.submitForm('loginForm');
		wrapper.vm.$data.loginForm.username = "jkxing";
		wrapper.vm.$data.loginForm.password = "1234567";
		wrapper.vm.$data.loginForm.checkPass = "1234567";
		wrapper.vm.$data.loginForm.email = "1234@qq.com";
		wrapper.vm.submitForm('loginForm');
		wrapper.vm.$data.loginForm.username = "jkxingjkxing";
		wrapper.vm.$data.loginForm.password = "1234567812345678123456781234567812345678";
		wrapper.vm.$data.loginForm.checkPass = "1234567812345678123456781234567812345678";
		wrapper.vm.$data.loginForm.email = "1234@qq.com";
		wrapper.vm.submitForm('loginForm');
		wrapper.vm.$data.loginForm.username = "jkxing";
		wrapper.vm.$data.loginForm.password = "12345678";
		wrapper.vm.$data.loginForm.checkPass = "123456789";
		wrapper.vm.$data.loginForm.email = "1234@qq.com";
		wrapper.vm.submitForm('loginForm');
		wrapper.vm.$data.loginForm.username = "jkxing";
		wrapper.vm.$data.loginForm.password = "12345678";
		wrapper.vm.$data.loginForm.checkPass = "";
		wrapper.vm.$data.loginForm.email = "1234@qq.com";
		wrapper.vm.submitForm('loginForm');
		wrapper.vm.$data.loginForm.username = "jkxing";
		wrapper.vm.$data.loginForm.password = "12345678";
		wrapper.vm.$data.loginForm.checkPass = "";
		wrapper.vm.$data.loginForm.email = "1234@qq.com";
		wrapper.vm.submitForm('loginForm');
		wrapper.vm.$data.loginForm.username = "jkxing";
		wrapper.vm.$data.loginForm.password = "";
		wrapper.vm.$data.loginForm.checkPass = "12345678";
		wrapper.vm.$data.loginForm.email = "1234@qq.com";
		wrapper.vm.submitForm('loginForm');
		wrapper.vm.$data.loginForm.username = "jkxing";
		wrapper.vm.$data.loginForm.password = "12345678";
		wrapper.vm.$data.loginForm.checkPass = "12345678";
		wrapper.vm.$data.loginForm.email = "";
		wrapper.vm.submitForm('loginForm');
		wrapper.vm.$data.loginForm.username = "jkxing";
		wrapper.vm.$data.loginForm.password = "12345678";
		wrapper.vm.$data.loginForm.checkPass = "12345678";
		wrapper.vm.$data.loginForm.email = "1324";
		wrapper.vm.submitForm('loginForm');
		setTimeout(() => {
			expect(spy.callCount).toEqual(0)
			done()
		}, 0);
	})
})