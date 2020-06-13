(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.Vue = factory());
}(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  // 写共用方法
  function isObject(obj) {
    return _typeof(obj) === 'object' && obj !== null;
  }

  var Observe = /*#__PURE__*/function () {
    function Observe(data) {
      _classCallCheck(this, Observe);

      //  对数据进行索引进行拦截 性能差而且直接更改索引的方法并不多
      this.walk(data); // 可以对数据一步一步的处理
    }

    _createClass(Observe, [{
      key: "walk",
      value: function walk(data) {
        // 对象的循环
        Object.keys(data).forEach(function (key) {
          defineReactive(data, key, data[key]); //定义响应式的数据变化
        });
      }
    }]);

    return Observe;
  }(); // vue2 的性能问题 递归重写get和set  (proxy 解决了)


  function defineReactive(data, key, value) {
    observe(value); // 如果传入的值还是一个对象的花 就做递归循环检测

    Object.defineProperty(data, key, {
      get: function get() {
        return value;
      },
      set: function set(newValue) {
        if (newValue === value) return;
        observe(value); // 监控当前设置的值，有可能设置的值也是对象  

        value = newValue;
      }
    });
  }

  function observe(data) {
    // 对象就是使用defineProperty  来实现响应式原理
    // 如果这个数据不是对象 或者是null 那就不用监控了
    if (!isObject(data)) {
      return;
    } // 对数据进行defineProperty


    return new Observe(data); // 可以看到当前的数据被观测过了
  }

  function initState(vm) {
    var opts = vm.$options;

    if (opts.props) ;

    if (opts.methods) ;

    if (opts.data) {
      initData(vm);
    } // computed  ...watch

  }

  function initData(vm) {
    //  数据响应式原理
    var data = vm.$options.data; // 用户传入的数据
    // vm._data 就是检测后的数据了

    data = vm._data = typeof data === 'function' ? data.call(vm) : data; // 如果data 为function 时，call后data函数执行
    // 观测数据

    observe(data);
  }

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      // vUE 的内部有个属性 $options  就是用户传递的所有参数
      //在data外面定义的属性和方法通过$options可以获取和调用
      var vm = this;
      vm.$options = options; // 用户传入的参数

      initState(vm); // 初始化状态
    };
  }

  function Vue(options) {
    // 内部要进行初始化的操作
    this._init(options); // 初始化操作 此方法后面还会被用，所以写道原型上

  }

  initMixin(Vue); // 添加原型方法

  return Vue;

})));
//# sourceMappingURL=vue.js.map
