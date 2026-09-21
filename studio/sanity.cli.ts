// Author: Demir Ajvazi
import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? 'u2f7mbu5',
    dataset: process.env.SANITY_STUDIO_DATASET ?? 'production',
  },
  deployment: {
    appId: 'gvpse3fqotvb7t388pi7zkt7',
  },
})
