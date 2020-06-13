import { initState } from './state'

export function initMixin(Vue) {
	Vue.prototype._init = function (options) {
		// vUE 的内部有个属性 $options  就是用户传递的所有参数
		//在data外面定义的属性和方法通过$options可以获取和调用
		const vm = this;
		vm.$options = options;  // 用户传入的参数

		initState(vm);   // 初始化状态
	}
}