export interface MycorizaSourceConfig {
  id: string
  name: string
  specUrl: string
  devUrl: string
  prodUrl: string
}

export interface MycorizaConfig {
  sources: MycorizaSourceConfig[]
}

export interface ExportContent {
  type: 'type' | 'object'
  exports: string[]
  path: string
}
