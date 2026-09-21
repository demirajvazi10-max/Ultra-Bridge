// Ultra Bridge Studio configuration
// Author: Demir Ajvazi
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {schemaTypes} from './schemaTypes'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? 'u2f7mbu5'
const dataset = process.env.SANITY_STUDIO_DATASET ?? 'production'

export default defineConfig({
  name: 'default',
  title: 'Ultra Bridge',
  projectId,
  dataset,
  plugins: [structureTool()],
  schema: {types: schemaTypes},
})
