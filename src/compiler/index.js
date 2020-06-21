import {parseHTML} from './parser.js'
export function compileToFunctions (template) {

    // 实现模板的编译

    let ast = parseHTML(template);


    // 模板编译原理

    // 1、先把我们的代码转换成ast语法数 （1）  parser 解析  (正则)
    
    // 2、标记静态树 （2） 树得遍历标记 markup  只是优化

    // 3、通过ast产生的语法数 生成 代码 =》 render函数  code generate
}