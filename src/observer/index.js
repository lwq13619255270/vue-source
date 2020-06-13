import { isObject } from '../utils';

class Observe {
    constructor(data) {
        //  对数据进行索引进行拦截 性能差而且直接更改索引的方法并不多

        
        this.walk(data);  // 可以对数据一步一步的处理
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
    // 对数据进行defineProperty
    return new Observe(data);   // 可以看到当前的数据被观测过了
}