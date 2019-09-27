# composition-api-demo

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

## Vue3.0 API 着重需要解决的事情
- 组件的代码变得越来越复杂，通过选项 (options) 来组织代码会变得很乱，而通过逻辑关注 (logical concerns) 的方式会更好
- 如果多个组件之间需要重用逻辑，那么就比较麻烦

## Side Effect 简单例子
```javascript
let counter = 0;

// with side effect
function incCounter() {
    counter += 1;
    return counter;
}

// without side effect
function incNumber(m) {
    return m + 1;
}
```
每次执行 `incCounter` 这个函数，它就会修改其 scope 之外的环境(就是 counter), **程序跑一遍能修改外部环境的我们就叫做 Side Effect**

## Vue 响应式的流程是怎么样的呢
1. 使用 `data()` 返回一个对象
2. 这个对象在组件内部被 `reactive()` 构造成一个响应式的对象
3. 然后模板会被编译成一个 render 函数，这个 render 函数就会利用这些响应式的属性去渲染 DOM

## setup
使用 composition api 的入口

## reactive
这个 API 就相当于 Vue2.x 里面的 `Vue.observable()`, 它会返回一个响应式的对象
[参考链接](https://cn.vuejs.org/v2/api/#Vue-observable)

## 为什么需要 .value ?
有时去处理数据的时候，假如这个数据还依赖其他数据变化的话，我们一般会用到 `computed` 这个属性, 在 Vue3 中，我们一般会这么写
```javascript
import { reactive, computed } from 'vue'

const state = reactive({
  count: 0
})

const double = computed(() => state.count * 2)
```
那 `computed` 这个函数**返回**的是啥呢? 我们可以猜一下其内部实现的过程
```javascript
function computed(getter) {
  let value
  watch(() => {
    value = getter()
  })
  return value
}
```
当然以上其实是行不通的，因为代码中的 `value` 的 type 为原始类型，返回一个原始类型的变量就跟踪不到这个变量的变化了，你要能够响应这个变量的变化，自然只能用 **引用** 的方式来做，以下是一个非常形象的图

![](./pass-by-reference-vs-pass-by-value-animation.gif)

你看，假如这个原始类型的 `value` 有变化，但其他地方感知不到，也就没办法做 "响应"

所以我们自然就想到了用 Object 也就是对象的方式，在 Vue 里面大致是这样做的
```javascript
function computed(getter) {
  const ref = {
    value: null
  }
  watch(() => {
    ref.value = getter()
  })
  return ref
}
```
要能保证每时每刻都能读取到最新的 `computed` 里面的返回值, 就在一个 object 里面包一个 `value` 的属性，然后返回它(至于为啥一定是 .value, 我觉得这个只要记住它就好了叭，毕竟 Vue 不是我发明的哈哈)

## Vue 作者认为的代码组织模式
从看到组件源码的第一眼开始，若要理解这个组件，从正常的逻辑来讲，我们应该要想知道的是，这个组件在干什么，它是不是先处理了 A，然后处理了 B，最后再对 C 做了什么样的操作，而不是说，这个组件有什么 data, 有什么 methods，有什么 computed ,Vue 2 中对于项目中的大型组件来说，基于 options 去组织的代码在 **试图表现代码背后意图** 方面表现得相当差, 而这正是 Vue3 想要改进的地方

Vue 作者认为，在这些大型组件中，要理清各个 function 之前的逻辑关系，你必须要在 methods 里面 **跳来跳去** 才能看懂整个代码的流程是怎么走的，由于每个人维护的部分不一样，那么代码的组织就会变得很琐碎，毕竟一个差不多逻辑的同样的功能干嘛要分散在各地呢？

使用 composition api 更改过后的代码它的整体组织就会像这样子
![](./difference-between-optionsApi-and-compositionApi.png)
颜色相同的地方表示代码需要处理的逻辑是差不多的

那个图不太清晰，没关系，官方文档给了一个代码被组织过的大致实例
```javascript
export default {
  setup() { // ...
  }
}

function useCurrentFolderData(nextworkState) { // ...
}

function useFolderNavigation({ nextworkState, currentFolderData }) { // ...
}

function useFavoriteFolder(currentFolderData) { // ...
}

function useHiddenFolders() { // ...
}

function useCreateFolder(openFolder) { // ...
}
```

`setup` 函数里面全是 **logical concern** 的代码，很像是一个 main 入口，然后关于其他组合函数(就是用 use 开头的, 这里组合函数的意思应该是相对于 options api 而言的，即相当于把上图中相同颜色部分的逻辑 **组合** 起来产生的函数)，直接放在下面，也方便查看其详细的实现

```javascript
export default {
  setup () {
    // Network
    const { networkState } = useNetworkState()

    // Folder
    const { folders, currentFolderData } = useCurrentFolderData(networkState)
    const folderNavigation = useFolderNavigation({ networkState, currentFolderData })
    const { favoriteFolders, toggleFavorite } = useFavoriteFolders(currentFolderData)
    const { showHiddenFolders } = useHiddenFolders()
    const createFolder = useCreateFolder(folderNavigation.openFolder)

    // Current working directory
    resetCwdOnLeave()
    const { updateOnCwdChanged } = useCwdUtils()

    // Utils
    const { slicePath } = usePathUtils()

    return {
      networkState,
      folders,
      currentFolderData,
      folderNavigation,
      favoriteFolders,
      toggleFavorite,
      showHiddenFolders,
      createFolder,
      updateOnCwdChanged,
      slicePath
    }
  }
}
```
这里注意这个 `return`, return 里面的东西是暴露给 template 用的, 如果你 template 里面要用到则一定要 return 出来

## 关于逻辑抽取和复用
先看代码, 这里假设新建一个 `mouse.js` 的文件
```javascript

import { ref, onMounted, onUnmounted } from 'vue'

export function useMousePosition() {
  const x = ref(0)
  const y = ref(0)

  function update(e) {
    x.value = e.pageX
    y.value = e.pageY
  }

  onMounted(() => {
    window.addEventListener('mousemove', update)
  })

  onUnmounted(() => {
    window.removeEventListener('mousemove', update)
  })

  return { x, y }
}
```
在另一个组件中就可以做如下的引入
```javascript
import { useMousePosition } from './mouse'

export default {
  setup() {
    const { x, y } = useMousePosition()
    // other logic...
    return { x, y }
  }
}
```

## Ref 与 Reactive
使用 `ref` 和 `reactive` api 貌似会达到一样的功能，但在一些细节上还是不同的，比如，假如
1. 使用 `ref`, 就把它拆分成变量的形式来用
```javascript
let x = ref(0)
let y = ref(0)

function updatePosition(e) {
  x.value = e.pageX
  y.value = e.pageY
}
```
2. 使用 `reactive`，就把它弄成 Object 的形式来使用
```javascript
const pos = reactive({
  x: 0,
  y: 0
})

function updatePosition(e) {
  pos.x = e.pageX
  pos.y = e.pageY
}
```
但是要在组件里面使用 `reactive` api 的时候要注意, 比如声明定义一个组合函数如下
```javascript
function useMousePosition() {
  const pos = reactive({
    x: 0,
    y: 0
  })

  // ...
  return pos
}
```
组件中要使用这个函数, 直接 `return` 的话是得不到其**响应式**的值的
```javascript
// consuming component
export default {
  setup() {
    const { x, y } = useMousePosition()
    // 这样不行
    return { x, y }

    // 这样也不行
    return {
      ...useMousePosition()
    }
    // 只有这样返回才可以
    return {
      pos: useMousePosition()
    }
  }
}
```
但是上面那个返回感觉不太优雅，所以 Vue3.0 又提供了一个叫做 `toRefs` 的 api，只要你在组合函数中做这样的 return
```javascript
function useMousePosition() {
  const pos = reactive({
    x: 0,
    y: 0
  })

  // ...
  return toRefs(pos)
}
```
然后在组件中就可以愉快的使用了
```javascript
// consuming component
export default {
  setup() {
    const { x, y } = useMousePosition()
    // 这样就可以了
    return { x, y }
  }
}
```

## 与 Vue2.x 的兼容
目前社区对 Vue3.0 的升级有很大的意见，在综合各方的意(nu)见(pen)之后，Vue 团队决定会提供一个兼容版本，即在 Vue3.0 中你依然可以使用 2.x 的 api 进行开发

## 不太懂的地方
- You can even achieve the equivalent of extends by exporting the entire setup function of a component
甚至可以通过导出组件的 `setup` 来实现与 extends 等价的功能,但我试了下貌似不行，不知道是不是姿势不对
- 在 Vue2 中，当使用多个 mixin 读取组件模板时，很难去区分指定的属性是从哪个 mixin 注入的
- mixin可能在属性和方法名上发生冲突，而高阶组件可能在预期的属性名上发生冲突
- vue2 中为了逻辑的复用要创建不必要的组件实例么?(意思是这里用到 mixin ?)