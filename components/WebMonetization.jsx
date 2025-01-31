import Head from 'next/head'
import { useProfile } from 'swrlit'
import { getStringNoLocale } from '@inrupt/solid-client'
import { US } from '../vocab'

// itme's uphold USD payment pointer
const defaultPaymentPointer = "$ilp.uphold.com/DYPhbXPmDa2P"

export default function WebMonetization({webId}){
  const { profile } = useProfile(webId)
  const paymentPointer = profile && getStringNoLocale(profile, US.paymentPointer)

  return (
    <Head>
      <meta name="monetization" content={paymentPointer || defaultPaymentPointer} />
    </Head>
  )
}
