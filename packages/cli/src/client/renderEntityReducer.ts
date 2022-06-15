import {OperationOb} from "./types";
import camelcase from "camelcase";
import {extractParameters, extractRequestBodyType, extractReturnType} from "./util";
import fs from "fs";
import {OpenAPIV2, OpenAPIV3} from "openapi-types";
import {ExportContent, MycorizaConfig} from "../types";
import OperationObject = OpenAPIV2.OperationObject;
import HttpMethods = OpenAPIV3.HttpMethods;
import {applyTemplate} from "../resolveTemplate";

export interface HookInfo {
    name: string
    path: string
    propType?: string,
    key: string,
    url: string,
    method: string
}

function getTestContent(context: any) {
    return applyTemplate(`src/api/$source/reducers/$scope/$reducer.test.ts.hbs`, context);
}

export function renderEntityReducer(
  op: OperationOb,
  outputDir: string,
  key: string,
  openApi: OpenAPIV3.Document<any>,
  apiId: string,
  exportContents: ExportContent[],
  cfg: MycorizaConfig): HookInfo {

    let directory = camelcase(key);

    let operation: OperationObject<any> = op.operation
    let {shouldImport, typeName} = extractReturnType(operation) ?? {shouldImport: false, typeName: "unknown"}
    let requestBodyType = extractRequestBodyType(operation, openApi);

    if (op.method.toUpperCase() === 'POST' && !requestBodyType && !!cfg.emptyBodyTypeOnPost) {
        requestBodyType = {
            typeName: cfg.emptyBodyTypeOnPost,
            shouldImport: false,
            description: "Body for POST requests"
        };
    }

    let simpleName = camelcase(operation.operationId);

    let parameterInfo = extractParameters(openApi, operation);

    const parameters = !!parameterInfo ? {
        path: Object.entries(parameterInfo.pathParams).map(([name, {type, description}]) => ({name, type, description})),
        query: Object.entries(parameterInfo.queryParams).map(([name, {type, description}]) => ({name, type, description})),
        props: [...Object.entries(parameterInfo.pathParams), ...Object.entries(parameterInfo.queryParams)].map(([name, {type, description}]) => ({name, type, description})).filter(a => !!a.name),
        importTypes: parameterInfo.importTypes
    } : undefined

    let imports = new Set([shouldImport && typeName, requestBodyType?.shouldImport && requestBodyType?.typeName, ...(parameters?.importTypes ?? [])].filter(a => !!a).map(a => a.replace('[]', '')));

    let context = {
        method: op.method.toUpperCase(),
        dirName: directory,
        capitalizedDirName: camelcase(directory, {pascalCase: true}),
        simpleName: simpleName,
        capitalizedName: camelcase(operation.operationId, {pascalCase: true}),
        returnType: typeName,
        url: op.path,
        description: operation?.description,
        requestBody: !!requestBodyType ? {
            ...requestBodyType,
            simpleName: camelcase(requestBodyType.typeName),
            description: requestBodyType.description ?? ''
        } : undefined,
        parameters: parameters?.props?.length ? parameters : undefined,
        executionParamsWithType: [
            requestBodyType && `${camelcase(requestBodyType.typeName).replace("[]", "")}: ${requestBodyType.typeName}`,
            parameters?.props?.length && `params: ${camelcase(operation.operationId, {pascalCase: true})}_Params`
        ].filter(a => !!a),
        executionParams: [
            requestBodyType ? `${camelcase(requestBodyType.typeName).replace("[]", "")}` : ([HttpMethods.PUT, HttpMethods.POST, HttpMethods.DELETE].includes(op.method) ? "{}" : undefined),
            parameters?.props?.length && `parameters`
        ].filter(a => !!a),
        executionParamsForSample: [
            requestBodyType && `${camelcase(requestBodyType.typeName)}`,
            parameterInfo && `params`
        ].filter(a => !!a),
        imports: imports,
        apiId: apiId
    };

    let content = applyTemplate('src/api/$source/reducers/$scope/$reducer.ts.hbs', context)
    //Handlebars.compile(template)(context);
    if (fs.existsSync(`${outputDir}/reducers/${directory}/${simpleName}.ts`)) {
        fs.unlinkSync(`${outputDir}/reducers/${directory}/${simpleName}.ts`)
    }

    fs.writeFileSync(`${outputDir}/reducers/${directory}/${simpleName}.ts`, content)

    if (context.parameters) {
        exportContents.push({
            type: "type",
            path: `${outputDir}/reducers/${directory}/${simpleName}.ts`,
            exports: [`${context.capitalizedName}_Params`]
        })
    }

    exportContents.push({
        type: "object",
        path: `${outputDir}/reducers/${directory}/${simpleName}.ts`,
        exports: [`use${context.capitalizedName}`]
    })

    let testContent = getTestContent(context);
    fs.writeFileSync(`${outputDir}/reducers/${directory}/${simpleName}.test.ts`, testContent)

    return {
        name: `use${camelcase(operation.operationId, {pascalCase: true})}`,
        path: `reducers/${directory}/${simpleName}`,
        propType: parameters?.props?.length ? `${camelcase(operation.operationId, {pascalCase: true})}_Params` : undefined,
        key: camelcase(key, {pascalCase: true}),
        url: op.path,
        method: op.method.toUpperCase()
    }
}
