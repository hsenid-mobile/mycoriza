import {OpenAPIV2, OpenAPIV3} from 'openapi-types'
import {renderApiReducer} from "./renderApiReducer";
import {OperationOb} from "./types";
import {renderScopedReducer} from "./rendreScopedReducer";
import {HookInfo, renderEntityReducer} from "./renderEntityReducer";
import fs from "fs";
import OperationObject = OpenAPIV2.OperationObject;
import HttpMethods = OpenAPIV2.HttpMethods;
import {ExportContent, MycorizaConfig, MycorizaSourceConfig} from "../types";

function groupBy<T>(xs: T[], f: (T) => string): { [k: string]: T[]} {
    return xs.reduce(function (rv, x) {
        let key = f(x);
        (rv[key] = rv[key] || []).push(x);
        return rv;
    }, {});
}

export function generateHooks(openApi: OpenAPIV3.Document<any>, outputDir: string, source: MycorizaSourceConfig, exportContents: ExportContent[], config: MycorizaConfig) {

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

    renderApiReducer(Object.keys(grouped), outputDir, source)

    if (!fs.existsSync(`${outputDir}/reducers`)) {
        fs.mkdirSync(`${outputDir}/reducers`)
    }
    Object.entries(grouped).flatMap<HookInfo>(([key, entities]) => {
        renderScopedReducer(entities, outputDir, key)
        return entities.map(op => renderEntityReducer(op, outputDir, key, openApi, source.id, exportContents, config))
    });
    addModuleToModels(outputDir)
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

