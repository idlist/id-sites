import type { FunctionalComponent, SVGAttributes } from 'vue'

export interface AnimationCanceller {
  cancel(): void
}

export type ViteSvgComponent = FunctionalComponent<SVGAttributes>
