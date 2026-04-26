type DriveItemName = { name?: unknown }

const personalVaultName = 'personal vault'

const normaliseDriveItemName = (name: unknown) =>
  typeof name === 'string' ? name.normalize('NFKC').trim().toLowerCase() : ''

export const isPersonalVaultItem = (item: DriveItemName) => normaliseDriveItemName(item.name) === personalVaultName

export const isNotPersonalVaultItem = <T extends DriveItemName>(item: T) => !isPersonalVaultItem(item)
