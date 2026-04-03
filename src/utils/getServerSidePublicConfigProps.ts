import { readPublicRuntimeConfig } from './publicRuntimeConfig'

export function getServerSidePublicConfigProps() {
  return {
    props: {
      publicConfig: readPublicRuntimeConfig(),
    },
  }
}
