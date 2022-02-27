import {OpenAPIV3} from "openapi-types";
import {MycorizaConfig, MycorizaSourceConfig} from "../../../types";

export interface ModifierContext {
  config: MycorizaConfig
  sourceConfig: MycorizaSourceConfig
}

export type OpenApiSpecModifier = (context: ModifierContext) => (doc: OpenAPIV3.Document) => OpenAPIV3.Document
