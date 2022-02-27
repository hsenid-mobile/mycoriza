import {OpenApiSpecModifier} from "./types";
import camelcase from "camelcase";
import {OpenAPIV3} from "openapi-types";
import ReferenceObject = OpenAPIV3.ReferenceObject;
import HttpMethods = OpenAPIV3.HttpMethods;
import OperationObject = OpenAPIV3.OperationObject;
import SchemaObject = OpenAPIV3.SchemaObject;
import {isReferenceObject} from "./util";

export const extractInlineResponse: OpenApiSpecModifier = context => doc => {
  function addToComponents(name: string, schema: SchemaObject) {
    doc.components = doc.components ?? {}
    doc.components.schemas = doc.components.schemas ?? {}
    doc.components.schemas[name] = schema
  }

  for (let [pattern, entry] of Object.entries(doc.paths)) {
    for (let httpMethodsKey in HttpMethods) {
      let operationObject: OperationObject<unknown> = entry[HttpMethods[httpMethodsKey]];
      if (!!operationObject) {
        if (operationObject.responses) {
          for (let [responseCode, responseConfig] of Object.entries(operationObject.responses)) {
            if (!isReferenceObject(responseConfig)) {
              for (let [media, mediaConfig] of Object.entries(responseConfig.content)) {
                if (!isReferenceObject(mediaConfig.schema)) {
                  let name = camelcase(`${operationObject.operationId}${responseCode.replace(/\*+/g, '')}Response`, {pascalCase: true});
                  addToComponents(name, mediaConfig.schema as SchemaObject)
                  const newSchema: ReferenceObject = {
                    $ref: `#/components/schemas/${name}`
                  }
                  mediaConfig.schema = newSchema as any
                }
              }
            }
          }
        }
      }
    }
  }
  return doc
}
