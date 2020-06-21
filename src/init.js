import { initState } from './state'
import {compileToFunctions} from './compiler/index.js';

export function initMixin(Vue) {
	Vue.prototype._init = function (options) {
		// vUE 的内部有个属性 $options  就是用户传递的所有参数
		//在data外面定义的属性和方法通过$options可以获取和调用
		const vm = this;
		vm.$options = options;  // 用户传入的参数

		initState(vm);   // 初始化状态

		// 需要通过模板进行渲染
		if(vm.$options.el) { // 用户传入了el属性
			vm.$mount(vm.$options.el)
		}
	}
	Vue.prototype.$mount =function(el) {  // 可能是字符串 也可以传入一个dom对象
		const vm = this;
		el = document.querySelector(el); // 获取el属性
		
		// 如果同时传入 template 和render 默认会采用render 抛弃template， 如果都没传就使用id="app" 中的模板
		const opts =vm.$options;

		if(!opts.render) {
			let template =opts.template;

			if(!template && el) { // 应该使用外部的模板
				// 1.innerHTML 设置或获取位于对象起始和结束标签内的HTML
				// 2.outerHTML设置或获取对象及其内容的HTML形式
				template = el.outerHTML;
			}
			const render= compileToFunctions(template);
			opts.render = render;
		}

		// 走到这里说明不需要编译了，因为用户传入的就是 一个render函数
	}
}