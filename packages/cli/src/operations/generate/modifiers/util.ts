import {OpenAPIV3} from "openapi-types";
import ReferenceObject = OpenAPIV3.ReferenceObject;

export function isReferenceObject<T>(ob: ReferenceObject | T): ob is ReferenceObject {
  return !!ob['$ref']
}
