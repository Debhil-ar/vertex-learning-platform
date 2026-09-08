/**
 * This configuration file lets you run `$ sanity [command]` in this folder
 * Go to https://www.sanity.io/docs/cli to learn more.
 **/
import { defineCliConfig } from 'sanity/cli'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET

export default defineCliConfig({
  api: { projectId, dataset },
  deployment: {
    appId: 'qwzkkpxnfvbcgdu2tbsinkeo',
  },
  typegen: {
    // Regenerates automatically during `sanity dev` / `sanity build` in this
    // workspace. Queries live in the web app at ../sanity/queries.
    enabled: true,
    path: '../sanity/**/*.ts',
    schema: 'schema.json',
    generates: '../sanity/types.ts',
  },
})
