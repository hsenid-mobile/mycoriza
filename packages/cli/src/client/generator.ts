import {OpenAPIV2, OpenAPIV3} from 'openapi-types'
import {renderRootReducer} from "./renderRootReducer";
import {OperationOb} from "./types";
import {renderScopedReducer} from "./rendreScopedReducer";
import {HookInfo, renderEntityReducer} from "./renderEntityReducer";
import fs from "fs";
import OperationObject = OpenAPIV2.OperationObject;
import HttpMethods = OpenAPIV2.HttpMethods;

function groupBy<T>(xs: T[], f: (T) => string): { [k: string]: T[]} {
    return xs.reduce(function (rv, x) {
        let key = f(x);
        (rv[key] = rv[key] || []).push(x);
        return rv;
    }, {});
}

export function generateHooks(openApi: OpenAPIV3.Document<any>, outputDir: string, baseUrl: string, prodUrl: string): string {

    const operations: OperationOb[] = []

    Object.entries(openApi.paths).forEach(([path, content]) => {
        for (let httpMethodsKey in HttpMethods) {
            let httpMethod = HttpMethods[httpMethodsKey];

            if ([HttpMethods.GET, HttpMethods.POST, HttpMethods.PUT, HttpMethods.DELETE].includes(httpMethod)) {
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

    renderRootReducer(Object.keys(grouped), outputDir, baseUrl, prodUrl)

    if (!fs.existsSync(`${outputDir}/reducers`)) {
        fs.mkdirSync(`${outputDir}/reducers`)
    }
    let list = Object.entries(grouped).flatMap<HookInfo>(([key, entities]) => {
        renderScopedReducer(entities, outputDir, key)
        return entities.map(op => renderEntityReducer(op, outputDir, key, openApi))
    });
    addModuleToModels(outputDir)
    return list.map(({exportContent}) => exportContent).join('')
}

function addModuleToModels(outputDir: string) {
    let files = fs.readdirSync(`${outputDir}/models`);
    files.filter(a => a.endsWith('.ts')).forEach(fileName => {
        let file = `${outputDir}/models/${fileName}`;
        fs.writeFileSync(file, `/**
 * @module types
 */
 ${fs.readFileSync(file)}
        `)
    })
}

