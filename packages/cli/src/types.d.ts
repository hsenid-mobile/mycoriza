export interface MycorizaConfigSource {
  id: string
  name: string
  specUrl: string
  devUrl: string
  prodUrl: string
}

export interface MycorizaConfig {
  sources: MycorizaConfigSource[]
}

export interface ExportContent {
  type: 'type' | 'object'
  exports: string[]
  path: string
}
