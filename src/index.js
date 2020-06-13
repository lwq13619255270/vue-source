import {initMixin} from './init';
function Vue(options) {
	// 内部要进行初始化的操作
	this._init(options);  // 初始化操作 此方法后面还会被用，所以写道原型上
}

initMixin(Vue);  // 添加原型方法


export default Vue;