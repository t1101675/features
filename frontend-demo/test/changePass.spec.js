import {
	mount,
	createLocalVue
} from '@vue/test-utils'
import Comp from '../src/components/drop-down/changePass.vue'
import ElementUI from 'element-ui';
import sinon from "sinon"
import store from './store';
import myAxios from '../src/axios'
import MockAdapter from 'axios-mock-adapter'
const netadd = "https://featuresgame.tk:8001"
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
describe('Login.vue', () => {
	it('basic test', (done) => {
		init()
		wrapper.vm.logout()
		wrapper.vm.resetForm('loginForm')
		wrapper.vm.resetForm('loginForm1')
		wrapper.vm.$data.loginForm.nickname = "jkxing"
		wrapper.vm.$data.loginForm.oldPass = ""
		wrapper.vm.$data.loginForm.newPass = "12345678"
		wrapper.vm.$data.loginForm.newPass2 = "12345678"
		wrapper.vm.submitForm('loginForm')
		wrapper.vm.$data.loginForm.nickname = "jkxing"
		wrapper.vm.$data.loginForm.oldPass = "123456"
		wrapper.vm.$data.loginForm.newPass = "12345678"
		wrapper.vm.$data.loginForm.newPass2 = ""
		wrapper.vm.submitForm('loginForm')
		wrapper.vm.$data.loginForm.nickname = "jkxing"
		wrapper.vm.$data.loginForm.oldPass = "123456"
		wrapper.vm.$data.loginForm.newPass = "12345678"
		wrapper.vm.$data.loginForm.newPass2 = "1234567"
		wrapper.vm.submitForm('loginForm')
		wrapper.vm.$data.loginForm.nickname = ""
		wrapper.vm.$data.loginForm.oldPass = ""
		wrapper.vm.$data.loginForm.newPass = ""
		wrapper.vm.$data.loginForm.newPass2 = ""
		wrapper.vm.submitForm('loginForm')
		setTimeout(() => {
			expect(spy.args[0]).toEqual([{type: "warning",message: "请填写需要修改的项目"}]);
			done()
		}, 0);
	}),
	it('net test1', (done) => {
		init()
		mock.onPost('https://featuresgame.tk:8001/api/chni').reply(200, 200)
		wrapper.vm.$data.loginForm.nickname = "jkxing"
		wrapper.vm.$data.loginForm.oldPass = ""
		wrapper.vm.$data.loginForm.newPass = ""
		wrapper.vm.$data.loginForm.newPass2 = ""
		wrapper.vm.submitForm('loginForm')
		setTimeout(() => {
			expect(spy.args[0]).toEqual([{
				type: 'success',
				message: '修改昵称成功',
			  }]);
			done()
		}, 0);
	}),
	it('net test2', (done) => {
		init()
		mock.onPost('https://featuresgame.tk:8001/api/chni').reply(201, 403)
		wrapper.vm.$data.loginForm.nickname = "jkxing"
		wrapper.vm.$data.loginForm.oldPass = ""
		wrapper.vm.$data.loginForm.newPass = ""
		wrapper.vm.$data.loginForm.newPass2 = ""
		wrapper.vm.submitForm('loginForm')
		setTimeout(() => {
			expect(spy.args[0]).toEqual([{
				type: 'error',
				message: '修改昵称失败',
			  }]);
			done()
		}, 0);
	}),

	it('net test3', (done) => {
		init()
		mock.onPost('https://featuresgame.tk:8001/api/chni').reply(401, {})
		wrapper.vm.$data.loginForm.nickname = "jkxing"
		wrapper.vm.$data.loginForm.oldPass = ""
		wrapper.vm.$data.loginForm.newPass = ""
		wrapper.vm.$data.loginForm.newPass2 = ""
		wrapper.vm.submitForm('loginForm')
		setTimeout(() => {
			expect(spy.args[0]).toEqual([{type: "error",message: "连接失败"}]);
			done()
		}, 0);
	}),

	it('net test4', (done) => {
		init()
		mock.onPost('https://featuresgame.tk:8001/api/resetpw').reply(200, {
			info_code:1
		})
		wrapper.vm.$data.loginForm.nickname = "jkxing"
		wrapper.vm.$data.loginForm.oldPass = "12345678"
		wrapper.vm.$data.loginForm.newPass = "123456789"
		wrapper.vm.$data.loginForm.newPass2 = "123456789"
		wrapper.vm.submitForm('loginForm')
		setTimeout(() => {
			expect(spy.args[0]).toEqual([{type: "error",message: "原密码错误"}]);
			done()
		}, 0);
	}),
	it('net test5', (done) => {
		init()
		mock.onPost('https://featuresgame.tk:8001/api/resetpw').reply(200, {
			info_code:0
		})
		wrapper.vm.$data.loginForm.nickname = "jkxing"
		wrapper.vm.$data.loginForm.oldPass = "12345678"
		wrapper.vm.$data.loginForm.newPass = "123456789"
		wrapper.vm.$data.loginForm.newPass2 = "123456789"
		wrapper.vm.submitForm('loginForm')
		setTimeout(() => {
			expect(spy.args[0]).toEqual([{type: "success",message: "修改成功"}]);
			done()
		}, 0);
	}),
	it('net test6', (done) => {
		init()
		mock.onPost('https://featuresgame.tk:8001/api/resetpw').reply(200, {
			info_code:3
		})
		wrapper.vm.$data.loginForm.nickname = "jkxing"
		wrapper.vm.$data.loginForm.oldPass = "12345678"
		wrapper.vm.$data.loginForm.newPass = "123456789"
		wrapper.vm.$data.loginForm.newPass2 = "123456789"
		wrapper.vm.submitForm('loginForm')
		setTimeout(() => {
			//expect(spy.args[0]).toEqual([{type: "success",message: "修改成功"}]);
			done()
		}, 0);
	})
})