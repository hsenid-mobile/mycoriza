export interface MycorizaSourceConfig {
  id: string
  name: string
  specUrl: string
  devUrl: string
  prodUrl: string,
  regex?: string
}

export interface MycorizaConfig {
  addToGitOnUpdate?: boolean
  rejectUnauthorized?: boolean
  sources: MycorizaSourceConfig[]
}

export interface ExportContent {
  type: 'type' | 'object'
  exports: string[]
  path: string
}
