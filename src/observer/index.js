import { isObject } from '../utils';
import { arrayMethods } from './array';

class Observe {
    constructor(data) {
        // 对数组索引进行拦截 性能差而且直接更改索引的方式并不多
        Object.defineProperty(data,'__ob__',{ // __ob__ 是一个响应式饿表示 对象数组都有
            enumerable:false, // 不可枚举
            configurable:false,
            value:this
        })
        // data.__ob__ = this; // 相当于在数据上可以获取到__ob__这个属性 指代的是Observer的实例
        if (Array.isArray(data)) {
            // vue如何对数组进行处理呢？数组用的重写数组的方法 函数劫持
            // 改变数据本身的方法我就可以监控到了
           
            data._proto_ = arrayMethods;  // 通过原型链 向上查找的方法
            // [{a:1}]  =>  arr[0].a = 100
            this.observeArray(data);
        }
        this.walk(data);  // 可以对数据一步一步的处理
    }
    observeArray(data){
        for(let i =0 ; i< data.length;i++){
            observe(data[i]);// 检测数组的对象类型
        }
    }
    walk(data) {
        // 对象的循环
        Object.keys(data).forEach(key => {
            defineReactive(data, key, data[key]);  //定义响应式的数据变化
        })
    }
}
// vue2 的性能问题 递归重写get和set  (proxy 解决了)
function defineReactive(data, key, value) {
    observe(value); // 如果传入的值还是一个对象的花 就做递归循环检测
    Object.defineProperty(data, key, {
        get() {
            return value
        },
        set(newValue) {
            if (newValue === value) return;
            observe(value);  // 监控当前设置的值，有可能设置的值也是对象  
            value = newValue
        }
    })
}
export function observe(data) {
    // 对象就是使用defineProperty  来实现响应式原理

    // 如果这个数据不是对象 或者是null 那就不用监控了
    if (!isObject(data)) {
        return;
    }

    if(data.__ob__ instanceof Observe){ // 防止对象被重复观测
        return ;
    }
    // 对数据进行defineProperty
    return new Observe(data);   // 可以看到当前的数据被观测过了
}