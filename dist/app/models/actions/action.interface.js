// action.interface.ts
// 
// structure of all command-pattern actions 
// export interface Action {
//   t:string;  - target object (on which to bind f (see next) or set property)
//                target can refer to embedded objects by using '.' separator.
//                For example to invoke function or set a property on
//                quad['material']['uniforms']['color'] use as action['t'] 
//                the '.'-separated 'quad.material.uniforms.color'
//   f?:string; - function t['f'] to invoke. If omitted => set property on 
//                target by assignment. Then o should be {<propertyname>:value}
//                type of 'value' is given by action['a'] - see next
//   a:string  - argument type:
//                'o': Object - arg is action['o'] Object
//                'n': non-Object - arg is primitive or array - put in
//                action['o'] in the form {'arg':<value>} where value is
//                non-Object (in practice 'n' is the 'default case' in
//                services/actions/direct.exec so action['a'] could be made 
//                any string not equal to 'o' 'm' or 'v' - so if it is helpful 
//                as a memory check on the argument type, the actual non-Object
//                type-string could be inserted if desired)
//                'm': 'multiple' (i.e a,b,c,...) - put multiple args in array
//                Object in action['o'] (see next) i.e. {'arg':[a,b,c,...]}
//                and they will be invoked with spread - t['f'](...m).
//                'v': void - invoke action['f'] with no argument
//   o?:Object; - Object holding the argument (if undefined => void arg)
//   ms:number; - timestamp
// }
// 
// examples:
// most common is state-change or state initialization (first exp)
// Object arg: {t:'narrative',   
//              f:'changeState',
//              a:'o',
//              o:{...}
//              ms:<time in ms>}
// embeddded target:'narrative.o1.o2',   
//              f:'foo',
//              a:'o',
//              o:{...}
//              ms:<time in ms>}
// string arg: {t:<target-name>,
//              f:<method-name>,
//              a:'n',
//              o:{arg:'<value>'},
//              ms:<time in ms>}
// number arg: {t:<target-name>,
//              f:<method-name>,
//              a:'n',
//              o:{arg:1.0},
//              ms:<time in ms>}
// multiple args: {t:<target-name>,
//                 f:<method-name>,
//                 a:'m',
//                 o:{arg:[a,b,c]},
//                 ms:<time in ms>}
// set property: {t:<actor-name>
//                a:'o',
//                o:{<propertyname>:{...}},
//                ms:<time in ms>}
// set property: {t:<actor-name>
//                a:'n',
//                o:{<propertyname>:0.5},
//                ms:<time in ms>}
// void argument: {t:<target-name>,
//                 f:<method-name>,
//                 a:'v',
//                 ms:<time in ms>}
//# sourceMappingURL=action.interface.js.map