// Querying with "sanityFetch" will keep content automatically updated
// Before using it, import and render "<SanityLive />" in your layout, see
// https://github.com/sanity-io/next-sanity#live-content-api for more information.
import 'server-only'

import { defineLive } from 'next-sanity/live'

import { client } from './client'

// browserToken is intentionally omitted: it would ship the private read
// token to the client bundle. Live updates run through the server-rendered
// SanityLive component instead.
export const { sanityFetch, SanityLive } = defineLive({
  client,
  serverToken: process.env.SANITY_API_READ_TOKEN,
})
