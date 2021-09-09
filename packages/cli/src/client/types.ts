import {OpenAPIV3} from "openapi-types";
import HttpMethods = OpenAPIV3.HttpMethods;
import OperationObject = OpenAPIV3.OperationObject;

export interface OperationOb {
    method: HttpMethods
    operation: OperationObject<any>
    path: string
}
