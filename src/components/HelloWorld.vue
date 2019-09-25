<template>
  <div>
    <button @click="increment">
      Count is: {{ state.count }}, double is: {{ state.double }}
    </button>
  </div>
</template>

<script>
// 参考
// https://vue-composition-api-rfc.netlify.com/
// https://juejin.im/post/5d836458f265da03d871f6e9
import { 
  reactive, 
  computed,
  watch,
  ref,
  onMounted
} from '@vue/composition-api'

export default {
  name: 'HelloWorld',
  // 这里的 state 就像旧 api 的 data
  setup() {
    const state = reactive({
      count: 0,
      // 那么问题来了，这里的 double 为什么可以在 template 里面不用 value 来访问呢
      // Vue3.0 内部做了处理，在上下文 (context) 遇到引用时(也就是遇到像 double 这样的引用),
      // 上下文就直接暴露了其 value, 所以你在 template 中写的时候就不用加 double.value 了
      double: computed(() => state.count * 2) 
    })

    // 还有像这种情况，只要是 ref 作为 【属性】 嵌套在一个对象(比如上面的 state) 中
    // 那么就不用写 state.double.value 来访问它了(因为此时是 undefined)
    console.log('state.double.value =', state.double.value)
    console.log('state.double =', state.double)

    // 有时候我们需要编写这样的代码，就是一个 state 依赖另一个 state 的时候，
    // 一般用 computed 来操作
    // Vue3.0 computed 返回什么呢？它返回的是一个对象, 这个对象也是响应式的
    const xxx = computed(() => state.count * 2)  

    // 这里就像旧 api 的 methods
    function increment() {
      state.count++
    }

    // 这里就像 watch
    watch(() => {
      const div = document.createElement('div')
      // 但是我们看到我们这里是用 xxx.value 来访问到这个变量的
      // 显而易见 xxx 在这里就是一个对象，在 Vue3.0 里面称之为 "ref"
      // 而这个 ref 在 Vue3.0 中就是一个【响应式的引用】，当然在渲染 DOM 的时候这个 refs 也是保留了的
      div.innerHTML = `count is ${state.count}, double is ${state.double}, xxx is ${xxx.value}`
      document.body.append(div)
    })

    // 当然除了使用 computed 这个 api 创建 ref 响应式引用之外，也可以用 ref 这个 API 来创建【响应式引用】
    // 比如
    const yyy = ref(0)
    console.log('yyy.value =', yyy.value)
    yyy.value += 1
    console.log('yyy.value =', yyy.value)

    console.log('yyy =', yyy)

    // 所以什么时候该使用 ref ,什么时候使用 reactive 呢
    // https://vue-composition-api-rfc.netlify.com/#ref-vs-reactive


    // 像生命周期钩子之类的一般就是用 onXXX 这种来代替了，如
    onMounted(() => {
      console.log('组件挂载了')
    })

    // Vue 用这种组合类型的 api 的用意是啥呢，为了 【更方便的组织代码，使代码的可读性变高】
    // 平常我们在开发代码的时候，基本上代码一多，就容易对代码的逻辑迷惑住(特别是没有注释的情况下)
    // 代码之间经常需要跳来跳去看(特别是 methods 里面的函数)
    // 所以解决的方法是什么呢？
    // 假如我们能够把那些[相同逻辑的代码配置并封装在同一个函数里面呢]? 使用 use函数名 这种方式为函数起名
    // https://github.com/vuejs/vue-cli/blob/dev/packages/@vue/cli-ui/src/components/folder/FolderExplorer.vue#L198-L404
    // https://github.com/vuejs/vue-cli/blob/dev/packages/@vue/cli-ui/src/components/folder/FolderExplorer.vue#L198-L404
    // https://gist.github.com/yyx990803/8854f8f6a97631576c14b63c8acd8f2e
    // 每个逻辑关注点的代码现在都被组合在一个复合函数中。你也就没必要跳来跳去的看了

    // 这里必须要 return, 只有 return 了 template 才能用到
    return {
      state,
      increment
    }
  }
}
</script>
<style>
  /** 这里仍然可以写 css */
  button {
    background: red;
  }
</style>