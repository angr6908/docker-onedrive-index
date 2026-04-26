import type { IconDefinition, IconProp } from '@fortawesome/fontawesome-svg-core'

import * as BrandIcons from '@fortawesome/free-brands-svg-icons'

import { FontAwesomeIcon } from '../utils/fontawesome'

const isIconDefinition = (icon: unknown): icon is IconDefinition => {
  return typeof icon === 'object' && icon !== null && 'iconName' in icon && typeof icon.iconName === 'string'
}

const brandIconByName: Record<string, IconDefinition> = {}

Object.values(BrandIcons).forEach(icon => {
  if (isIconDefinition(icon)) brandIconByName[icon.iconName] = icon
})

export default function BrandIcon({ name }: { name: string }) {
  const icon: IconProp = brandIconByName[name.toLowerCase()] ?? 'link'
  return <FontAwesomeIcon icon={icon} />
}
