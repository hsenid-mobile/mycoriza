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
  emptyBodyTypeOnPost?: "unknown" | "object" | "array" | "string" | "number" | "boolean" | "null" | "undefined"
  sources: MycorizaSourceConfig[]
}

export interface ExportContent {
  type: 'type' | 'object'
  exports: string[]
  path: string
}
