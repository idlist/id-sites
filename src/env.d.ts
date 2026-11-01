import 'matter-js'

declare module 'matter-js' {
  namespace Common {
    let logLevel: number
  }
}

declare module '*.vmd' {
  import type { ComponentOptions } from 'vue'

  const Component: ComponentOptions
  export default Component
}
