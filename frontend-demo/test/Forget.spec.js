import {
	mount,
	createLocalVue
} from '@vue/test-utils'
import Comp from '../src/components/drop-down/forget.vue'
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
describe('Forget.vue', () => {
	it('basic test', () => {
		init()
        wrapper.vm.$data.loginForm.username="",
        wrapper.vm.$data.loginForm.email="973289085@qq.com",
        wrapper.vm.$data.loginForm.verifycode="1234",
        wrapper.vm.$data.loginForm.newPass="12345678",
        wrapper.vm.$data.loginForm.newPass2="12345678"
		wrapper.vm.submitForm('loginForm');
        wrapper.vm.$data.loginForm.username="123456",
        wrapper.vm.$data.loginForm.email="",
        wrapper.vm.$data.loginForm.verifycode="1234",
        wrapper.vm.$data.loginForm.newPass="12345678",
        wrapper.vm.$data.loginForm.newPass2="12345678"
		wrapper.vm.submitForm('loginForm');
        wrapper.vm.$data.loginForm.username="123456",
        wrapper.vm.$data.loginForm.email="97328com",
        wrapper.vm.$data.loginForm.verifycode="1234",
        wrapper.vm.$data.loginForm.newPass="12345678",
        wrapper.vm.$data.loginForm.newPass2="12345678"
		wrapper.vm.submitForm('loginForm');
        wrapper.vm.$data.loginForm.username="123456",
        wrapper.vm.$data.loginForm.email="973289085@qq.com",
        wrapper.vm.$data.loginForm.verifycode="",
        wrapper.vm.$data.loginForm.newPass="12345678",
        wrapper.vm.$data.loginForm.newPass2="12345678"
		wrapper.vm.submitForm('loginForm');
        wrapper.vm.$data.loginForm.username="123456",
        wrapper.vm.$data.loginForm.email="973289085@qq.com",
        wrapper.vm.$data.loginForm.verifycode="12345",
        wrapper.vm.$data.loginForm.newPass="",
        wrapper.vm.$data.loginForm.newPass2="12345678"
		wrapper.vm.submitForm('loginForm');
        wrapper.vm.$data.loginForm.username="123456",
        wrapper.vm.$data.loginForm.email="973289085@qq.com",
        wrapper.vm.$data.loginForm.verifycode="1234",
        wrapper.vm.$data.loginForm.newPass="12345678",
        wrapper.vm.$data.loginForm.newPass2=""
		wrapper.vm.submitForm('loginForm');
        wrapper.vm.$data.loginForm.username="123456",
        wrapper.vm.$data.loginForm.email="973289085@qq.com",
        wrapper.vm.$data.loginForm.verifycode="1234",
        wrapper.vm.$data.loginForm.newPass="123456789",
        wrapper.vm.$data.loginForm.newPass2="12345678"
		wrapper.vm.submitForm('loginForm');
		wrapper.vm.resetForm()
	}),
	it('net test', () => {
		init()
		mock.onPost(netadd+'/api/newpw').reply(200, {
			info_code: 0
		})
		mock.onPost(netadd+'/api/reqpw').reply(200, {
			info_code: 0
		})
        wrapper.vm.$data.loginForm.username="jkxing"
		wrapper.vm.$data.loginForm.email="973289085@qq.com"
        wrapper.vm.$data.loginForm.verifycode="1234"
        wrapper.vm.$data.loginForm.newPass="12346789"
        wrapper.vm.$data.loginForm.newPass2="12346789"
		wrapper.vm.submitForm('loginForm');
		wrapper.vm.sendCode();
		//expect(spy.calledWith('sendCode')).toEqual(true);
	}),
	it('net test2', () => {
		
		init()
		mock.onPost(netadd+'/api/newpw').reply(200, {
			info_code: 1
		})
		mock.onPost(netadd+'/api/reqpw').reply(200, {
			info_code: 1
		})
        wrapper.vm.$data.loginForm.username="jkxing"
		wrapper.vm.$data.loginForm.email="973289085@qq.com"
        wrapper.vm.$data.loginForm.verifycode="1234"
        wrapper.vm.$data.loginForm.newPass="12346789"
        wrapper.vm.$data.loginForm.newPass2="12346789"
		wrapper.vm.submitForm('loginForm');
		wrapper.vm.sendCode();
		//expect(spy.calledWith('sendCode')).toEqual(true);
	}),
	it('net test3', () => {
		init()
		mock.onPost(netadd+'/api/newpw').reply(200, {
			info_code: 2
		})
		mock.onPost(netadd+'/api/reqpw').reply(200, {
			info_code: 2
		})
        wrapper.vm.$data.loginForm.username="jkxing"
		wrapper.vm.$data.loginForm.email="973289085@qq.com"
        wrapper.vm.$data.loginForm.verifycode="1234"
        wrapper.vm.$data.loginForm.newPass="12346789"
        wrapper.vm.$data.loginForm.newPass2="12346789"
		wrapper.vm.submitForm('loginForm');
		wrapper.vm.sendCode();
		//expect(spy.calledWith('sendCode')).toEqual(true);
	}),
	it('net test4', () => {
		
		init()
		mock.onPost(netadd+'/api/newpw').reply(200, {
			info_code: 3
		})
		mock.onPost(netadd+'/api/reqpw').reply(200, {
			info_code: 3
		})
        wrapper.vm.$data.loginForm.username="jkxing"
		wrapper.vm.$data.loginForm.email="973289085@qq.com"
        wrapper.vm.$data.loginForm.verifycode="1234"
        wrapper.vm.$data.loginForm.newPass="12346789"
        wrapper.vm.$data.loginForm.newPass2="12346789"
		wrapper.vm.submitForm('loginForm');
		wrapper.vm.sendCode();
	}),

	it('net test4', () => {
		
		init()
		mock.onPost(netadd+'/api/newpw').reply(401, {
			info_code: 3
		})
		mock.onPost(netadd+'/api/reqpw').reply(401, {
			info_code: 3
		})
        wrapper.vm.$data.loginForm.username="jkxing"
		wrapper.vm.$data.loginForm.email="973289085@qq.com"
        wrapper.vm.$data.loginForm.verifycode="1234"
        wrapper.vm.$data.loginForm.newPass="12346789"
        wrapper.vm.$data.loginForm.newPass2="12346789"
		wrapper.vm.submitForm('loginForm');
		wrapper.vm.sendCode();
	})
})