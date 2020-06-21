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

  var oldArrayMethods = Array.prototype; // 获取数组原型上的方法
  //  创建一个全新的对象 可以找到数组原型上的方法 而且修改对象是不会影响数组的原型方法

  var arrayMethods = Object.create(oldArrayMethods);
  var methods = [// 这7个方法都可以改变原数组
  'push', 'pop', 'shift', 'unshift', 'sort', 'reverse', 'splice'];
  methods.forEach(function (method) {
    arrayMethods[method] = function () {
      // 函数劫持 AOP
      // 当用户调用数组方法时 会先执行我自己改造的逻辑 在执行数组默认的逻辑
      var ob = this.__ob__;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var result = oldArrayMethods[method].apply(this, args);
      var inserted; // push unshift splice 都可以新增属性  （新增的属性可能是一个对象类型）
      // 内部还对数组中引用类型也做了一次劫持  [].push({name:'zf'})

      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args;
          break;

        case 'splice':
          // 也是新增属性  可以修改 可以删除  [].splice(arr,1,'div')
          inserted = args.slice(2);
          break;
      }

      inserted && ob.observeArray(inserted);
      return result;
    };
  });

  var Observe = /*#__PURE__*/function () {
    function Observe(data) {
      _classCallCheck(this, Observe);

      // 对数组索引进行拦截 性能差而且直接更改索引的方式并不多
      Object.defineProperty(data, '__ob__', {
        // __ob__ 是一个响应式饿表示 对象数组都有
        enumerable: false,
        // 不可枚举
        configurable: false,
        value: this
      }); // data.__ob__ = this; // 相当于在数据上可以获取到__ob__这个属性 指代的是Observer的实例

      if (Array.isArray(data)) {
        // vue如何对数组进行处理呢？数组用的重写数组的方法 函数劫持
        // 改变数据本身的方法我就可以监控到了
        data._proto_ = arrayMethods; // 通过原型链 向上查找的方法
        // [{a:1}]  =>  arr[0].a = 100

        this.observeArray(data);
      }

      this.walk(data); // 可以对数据一步一步的处理
    }

    _createClass(Observe, [{
      key: "observeArray",
      value: function observeArray(data) {
        for (var i = 0; i < data.length; i++) {
          observe(data[i]); // 检测数组的对象类型
        }
      }
    }, {
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
    }

    if (data.__ob__ instanceof Observe) {
      // 防止对象被重复观测
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

  //              字母a-zA-Z_ - . 数组小写字母 大写字母  
  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*"; // 标签名
  // ?:匹配不捕获   <aaa:aaa>

  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")"); // startTagOpen 可以匹配到开始标签 正则捕获到的内容是 (标签名)

  var startTagOpen = new RegExp("^<".concat(qnameCapture)); // 标签开头的正则 捕获的内容是标签名
  // 闭合标签 </xxxxxxx>  

  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); // 匹配标签结尾的 </div>
  // <div aa   =   "123"  bb=123  cc='123'
  // 捕获到的是 属性名 和 属性值 arguments[1] || arguments[2] || arguments[2]

  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性的
  // <div >   <br/>

  var startTagClose = /^\s*(\/?)>/; // 匹配标签结束的 >
  function parseHTML(html) {
    function start(tagName, attrs) {
      // 开始标签 每次解析开始标签 都会执行此方法
      // let element = createASTElement(tagName, attrs);
      // if (!root) {
      //     root = element; // 只有第一次是根
      // }
      // currentParent = element;
      // stack.push(element);
      console.log('开始标签--- ', tagName, attrs);
    }

    function end(tagName) {
      // 结束标签  确立父子关系
      // let element = stack.pop();
      // currentParent = stack[stack.length - 1];
      // if (currentParent) {
      //     element.parent = currentParent;
      //     currentParent.children.push(element);
      // }
      console.log('end--- ', tagName);
    }

    function chars(text) {
      // 文本
      console.log('文本--- ', text); // text = text.replace(/\s/g, '');
      // if (text) {
      //     currentParent.children.push({
      //         type: 3,
      //         text
      //     })
      // }
    } // 根据 html 解析成树结构  <div class="a" style='color:red'><span>123</span> hello {{age}} {{msg}} </div>


    while (html) {
      var textEnd = html.indexOf('<');

      if (textEnd == 0) {
        var startTageMatch = parseStartTag(); // console.log(startTageMatch)

        if (startTageMatch) {
          // 开始标签
          start(startTageMatch.tagName, startTageMatch.attrs);
        }

        var endTagMatch = html.match(endTag);

        if (endTagMatch) {
          advance(endTagMatch[0].length);
          end(endTagMatch[1]);
        } // 结束标签 

      } // 如果不是0 说明是文本


      var text = void 0;

      if (textEnd > 0) {
        text = html.substring(0, textEnd); // 是文本就把文本内容进行截取

        chars(text);
      }

      if (text) {
        advance(text.length); // 删除文本内容
      }
    }

    function advance(n) {
      html = html.substring(n);
    }

    function parseStartTag() {
      var start = html.match(startTagOpen); // 匹配开始标签

      if (start) {
        var match = {
          tagName: start[1],
          // 匹配到的标签名
          attrs: []
        };
        advance(start[0].length);

        var _end, attr;

        while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          advance(attr[0].length);
          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5]
          });
        }

        if (_end) {
          advance(_end[0].length);
          return match;
        }
      }
    }
  }

  function compileToFunctions(template) {
    // 实现模板的编译
    var ast = parseHTML(template); // 模板编译原理
    // 1、先把我们的代码转换成ast语法数 （1）  parser 解析  (正则)
    // 2、标记静态树 （2） 树得遍历标记 markup  只是优化
    // 3、通过ast产生的语法数 生成 代码 =》 render函数  code generate
  }

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      // vUE 的内部有个属性 $options  就是用户传递的所有参数
      //在data外面定义的属性和方法通过$options可以获取和调用
      var vm = this;
      vm.$options = options; // 用户传入的参数

      initState(vm); // 初始化状态
      // 需要通过模板进行渲染

      if (vm.$options.el) {
        // 用户传入了el属性
        vm.$mount(vm.$options.el);
      }
    };

    Vue.prototype.$mount = function (el) {
      // 可能是字符串 也可以传入一个dom对象
      var vm = this;
      el = document.querySelector(el); // 获取el属性
      // 如果同时传入 template 和render 默认会采用render 抛弃template， 如果都没传就使用id="app" 中的模板

      var opts = vm.$options;

      if (!opts.render) {
        var template = opts.template;

        if (!template && el) {
          // 应该使用外部的模板
          // 1.innerHTML 设置或获取位于对象起始和结束标签内的HTML
          // 2.outerHTML设置或获取对象及其内容的HTML形式
          template = el.outerHTML;
        }

        var render = compileToFunctions(template);
        opts.render = render;
      } // 走到这里说明不需要编译了，因为用户传入的就是 一个render函数

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
