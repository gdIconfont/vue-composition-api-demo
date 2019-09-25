<template>
  <div>
    <!--
    <button @click="increment">
      Count is: {{ state.count }}, double is: {{ state.double }}
    </button>
    -->
  </div>
</template>

<script>
import Vue from 'vue'
import VueCompositionApi from '@vue/composition-api'
Vue.use(VueCompositionApi)

import { reactive, computed } from 'vue'

console.log('reactive = ', reactive)

export default {
  name: 'HelloWorld',
  setup() {
    const state = reactive({
      count: 0,
      double: computed(() => state.count * 2)
    })

    function increment() {
      state.count++
    }

    return {
      state,
      increment
    }
  }
}
</script>