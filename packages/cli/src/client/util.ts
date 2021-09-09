import {OpenAPIV2, OpenAPIV3} from "openapi-types";
import ReferenceObject = OpenAPIV3.ReferenceObject;
import ResponseObject = OpenAPIV3.ResponseObject;
import MediaTypeObject = OpenAPIV3.MediaTypeObject;
import SchemaObject = OpenAPIV3.SchemaObject;
import ArraySchemaObject = OpenAPIV3.ArraySchemaObject;

function isReference(valueOrRef: any): valueOrRef is ReferenceObject {
    return !!valueOrRef.$ref
}

function isArraySchema(schema: SchemaObject): schema is ArraySchemaObject {
    return schema.type === 'array';
}

export interface TypeRef {
    shouldImport: boolean
    typeName: string
    description?: string
}

export function extractReturnType(operation: OpenAPIV3.OperationObject<any>): TypeRef | undefined{
    if (!operation.responses) return undefined
    let response: ReferenceObject | ResponseObject | undefined = operation.responses["200"];
    if (!response) return undefined
    if (isReference(response)) return undefined // TODO resolve reference

    let description = response.description;

    let content = response.content;
    if (!content) return undefined;
    let mediaTypeObject: MediaTypeObject = content["application/json"] ?? content["*/*"] ?? Object.values(content)[0];
    let schema = mediaTypeObject.schema;
    if (!schema) return undefined
    if (isReference(schema)) {
        return {
            shouldImport: true,
            typeName: schema.$ref.split("/").reverse()[0],
            description
        };
    }
    if (isArraySchema(schema)) {
        if (isReference(schema.items)) {
            return {
                shouldImport: true,
                typeName: schema.items.$ref.split("/").reverse()[0] + '[]',
                description
            };
        } else {
            return {
                shouldImport: false,
                typeName: transformTypes(schema.items.type) + '[]',
                description
            }
        }
    }
    return {
        shouldImport: false,
        typeName: transformTypes(schema.type),
        description
    };
}

export function extractRequestBodyType(operation: OpenAPIV3.OperationObject<any>, openApi: OpenAPIV3.Document<any>): TypeRef | undefined {
    let requestBody = operation.requestBody;
    if (!requestBody) return undefined
    requestBody = resolveReference(openApi, requestBody)
    requestBody.content

    let description = requestBody.description;

    let content = requestBody.content;
    if (!content) return undefined;
    let mediaTypeObject: MediaTypeObject = content["application/json"] ?? content["*!/!*"] ?? Object.values(content)[0];
    let schema = mediaTypeObject.schema;
    if (!schema) return undefined
    if (isReference(schema)) {
        return {
            shouldImport: true,
            typeName: schema.$ref.split("/").reverse()[0],
            description
        };
    }
    if (isArraySchema(schema)) {
        if (isReference(schema.items)) {
            return {
                shouldImport: true,
                typeName: schema.items.$ref.split("/").reverse()[0] + '[]',
                description
            };
        } else {
            return {
                shouldImport: false,
                typeName: transformTypes(schema.items.type) + '[]',
                description
            }
        }
    }
    return {
        shouldImport: false,
        typeName: transformTypes(schema.type),
        description
    };
}

function resolveReference<T>(openApi: any, value: T | ReferenceObject | undefined): T | undefined{

    if (!value) return undefined
    if (!isReference(value)) return value
    if (!value.$ref.startsWith('#')) return undefined

    function recur(parent: object, keys: string[]): object | undefined {
        if (!parent) return undefined
        if (!keys.length) return parent

        let [current, ...rest] = keys
        return recur(parent[current], rest)

    }

    let [hash, ...keys] = value.$ref.split('/');
    return recur(openApi, keys) as any as T
}

export interface ParameterInfo {
    type: string
    mandatory: boolean
    description?: string
}

export interface ParametersInfo {
    pathParams: { [k:string]: ParameterInfo}
    queryParams: { [k:string]: ParameterInfo}
    importTypes: string[]
}

export function extractParameters(openApi: any,operation: OpenAPIV3.OperationObject<any>): ParametersInfo | undefined {
    let parameters = operation.parameters;
    if (!parameters) return

    let pathParams: { [k:string]: ParameterInfo} = {}
    let queryParams: { [k:string]: ParameterInfo} = {}
    let importTypes: string[] = []
    for (let parameter of parameters) {
        let parameterObject = resolveReference(openApi, parameter);
        let reference = getReference(parameterObject.schema);
        switch (parameterObject.in) {
            case "query":
                if (!!reference) {
                    queryParams[parameterObject.name] = {
                        type: reference.typeName,
                        description: parameterObject.description,
                        mandatory: false
                    }
                    if (reference.shouldImport) importTypes.push(transformTypes(reference.typeName))
                }
                break;
            case "path":
                if (!!reference) {
                    pathParams[parameterObject.name] = {
                        type: reference.typeName,
                        description: parameterObject.description,
                        mandatory: true
                    }
                    if (reference.shouldImport) importTypes.push(transformTypes(reference.typeName))
                }
                break;
        }
    }
    return {
        pathParams,
        queryParams,
        importTypes
    }
}

function getReference(schema: ReferenceObject | SchemaObject): TypeRef | undefined {
    if (!schema) {
        return undefined
    } else if (isReference(schema)) {
        return {
            shouldImport: true,
            typeName: schema.$ref.split("/").reverse()[0]
        }
    } else if (isArraySchema(schema)) {
        if (isReference(schema.items)) {
            return {
                shouldImport: true,
                typeName: schema.items.$ref.split("/").reverse()[0] + "[]"
            }
        } else {
            return {
                shouldImport: false,
                typeName: transformTypes(schema.items.type) + "[]"
            }
        }
    } else {
        return {
            shouldImport: false,
            typeName: transformTypes(schema.type)
        }
    }
}

const TYPE_MAPPING = {
    "integer": "number"
}

function transformTypes(tpe: string): string {
    return TYPE_MAPPING[tpe] ?? tpe;
}
