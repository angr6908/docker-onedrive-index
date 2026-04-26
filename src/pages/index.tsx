import { GetServerSideProps } from 'next'

import DrivePage from '../components/DrivePage'
import { getServerSidePublicConfigProps } from '../utils/getServerSidePublicConfigProps'
import { PublicRuntimeConfig } from '../utils/publicRuntimeConfig'

export default function Home({ publicConfig }: { publicConfig: PublicRuntimeConfig }) {
  return <DrivePage publicConfig={publicConfig} />
}

export const getServerSideProps: GetServerSideProps = async () => getServerSidePublicConfigProps()
