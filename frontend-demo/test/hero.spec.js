import {
	mount,
	createLocalVue
} from '@vue/test-utils'
import ElementUI from 'element-ui';
import MockAdapter from 'axios-mock-adapter'
import axios from 'axios';
import sinon from 'sinon'
import Hero from '../src/components/general/heroes.vue'
var mock,spy,wrapper
const localVue = createLocalVue()
function init()
{
	mock = new MockAdapter(axios);
	spy = sinon.spy()
}
describe('hero.vue', () => {
	it('base test2', (done) => {
		init()
		mock.onPost("https://featuresgame.tk:8001/api/upload_hero").reply(200,{

		})
		wrapper = mount(Hero, {
			localVue,
			mocks: {
				$store:{
					state:{
						token:""
					}
				},
				$message: spy
			}
		})
		var file = new Blob([
			JSON.stringify({})
		 ], { type: 'application/json',name:1234 })
		wrapper.vm.beforeUpload(0,file)
		//wrapper.vm.logOut()
		setTimeout(() => {
			done()
		}, 0);
	}),
	it('base test', (done) => {
		init()
		mock.onPost("https://featuresgame.tk:8001/api/upload_hero").reply(401,{

		})
		wrapper = mount(Hero, {
			localVue,
			mocks: {
				$store:{
					state:{
					token:""
					},
				},
				$message: spy
			}
		}) 
		var file = new Blob([
			JSON.stringify({})
		 ], { type: 'application/json',name:1234 })
		 wrapper.vm.beforeUpload(0,file)
		//wrapper.vm.logOut()
		setTimeout(() => {
			//expect(spy.args[0]).toEqual([{type: "info",message: "用户名或密码错误"}]);
			done()
		}, 0);
	})
})