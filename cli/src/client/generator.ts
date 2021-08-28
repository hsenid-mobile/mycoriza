import {OpenAPIV2, OpenAPIV3} from 'openapi-types'
import {renderRootReducer} from "./renderRootRouter";
import {OperationOb} from "./types";
import {renderScopedReducer} from "./rendreScopedReducer";
import {HookInfo, renderEntityReducer} from "./renderEntityReducer";
import fs from "fs";
import OperationObject = OpenAPIV2.OperationObject;
import HttpMethods = OpenAPIV2.HttpMethods;
import {updateIndex} from "./updateIndex";

/*
function isReference(valueOrRef: any): valueOrRef is Reference {
    return !!valueOrRef.$ref
}

function resolveReference<T>(openApi: OpenApi, value: T | Reference | undefined): T | undefined{

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

interface ReferenceType {
    importRequired: boolean
    name: string
}

function extractRequestType(operation: Operation, openApi: OpenApi): ReferenceType | undefined {
    let content = resolveReference<RequestBody>(openApi, operation.requestBody)?.content;
    if (!content) return undefined

    let mediaType = content["application/json"] ?? content["*!/!*"];
    if (!mediaType) return undefined

    if (isReference(mediaType)) {
        return {
            importRequired: true,
            name: mediaType.$ref.split('/').reverse()[0]
        };
    }
    return {
        importRequired: false,
        name: mediaType.type === "array" ? (mediaType.items as any).type + "[]" : mediaType.type as string
    }
}
*/

// function extractResponseType(operation: Operation, openApi: OpenApi): ReferenceType | undefined {
//     operation.responses
// }

function groupBy<T>(xs: T[], f: (T) => string): { [k: string]: T[]} {
    return xs.reduce(function (rv, x) {
        let key = f(x);
        (rv[key] = rv[key] || []).push(x);
        return rv;
    }, {});
}

export function generateHooks(openApi: OpenAPIV3.Document<any>, outputDir: string) {

    const operations: OperationOb[] = []

    Object.entries(openApi.paths).forEach(([path, content]) => {
        for (let httpMethodsKey in HttpMethods) {
            let httpMethod = HttpMethods[httpMethodsKey];

            if ([HttpMethods.GET, HttpMethods.POST, HttpMethods.PUT, HttpMethods.POST].includes(httpMethod)) {
                let contentElement = content[httpMethod] as (OperationObject<any> | undefined);
                if (contentElement) {
                    let operation = contentElement as OperationObject<any>;
                    operations.push({
                        operation: operation,
                        method: httpMethod,
                        path: path
                    })
                }
            }
        }
    })
    let grouped = groupBy(operations, (t: OperationOb) => t.operation.tags[0] ?? '');

    renderRootReducer(Object.keys(grouped), outputDir)

    if (!fs.existsSync(`${outputDir}/reducers`)) {
        fs.mkdirSync(`${outputDir}/reducers`)
    }

    let imports = Object.entries(grouped).flatMap<HookInfo>(([key, entities]) => {
        renderScopedReducer(entities, outputDir, key)
        return entities.map(op => renderEntityReducer(op, outputDir, key, openApi))
    });

    updateIndex(imports, outputDir)
}

