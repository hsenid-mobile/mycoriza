import {OperationOb} from "./types";
import camelcase from "camelcase";
import {extractParameters, extractRequestBodyType, extractReturnType} from "./util";
import Handlebars from "handlebars";
import fs from "fs";
import {OpenAPIV2, OpenAPIV3} from "openapi-types";
import OperationObject = OpenAPIV2.OperationObject;
import HttpMethods = OpenAPIV3.HttpMethods;

const template = `
/**
 * @module {{capitalizedDirName}}
 */
import { NetworkStateFamily, MycorizaHookResultType, {{method}}, reset, resolveFamily } from "mycoriza-runtime";
import {useDispatch, useSelector} from "react-redux";
import {MycorizaState} from "../index";
{{#each imports}}
import { {{this}} } from '../../models/{{this}}';
{{/each}}

/**
 * @ignore
 */
const domain = "@mycoriza/{{dirName}}/{{simpleName}}"

{{#if parameters}}
export type {{capitalizedName}}_Params = {
    {{#each parameters.props}}
        /**
         * {{description}}
         */
        {{name}}{{#unless mandatory}}?{{/unless}}: {{type}}
    {{/each}}
}

{{/if}}
/**
    {{#if description}}
 * {{description}}
    {{/if}}
 *
 * Returns a stateful value confirms to NetworkState, a function to issue network requests and clean up function.
 * Upon function execution, a <code>{{method}}</code> call will be issued to <code>{{url}}</code>
 *
 * @example
 * ${"```"}typescript
 * ...
 * function {{capitalizedName}}Example() {
 *     const [{{simpleName}}State, {{simpleName}}, clean{{capitalizedName}}State] = use{{capitalizedName}}()
 *
 *     //To cleanup the entity upon unload
 *     useEffect(() => clean{{capitalizedName}}State);
 *
 *     //Callback function
 *     function on{{capitalizedName}}({{#each executionParamsWithType}}{{this}}{{#unless @last}},{{/unless}}{{/each}}) {
 *       {{simpleName}}({{#each executionParamsForSample}}{{this}}{{#unless @last}},{{/unless}}{{/each}})
 *     }
 *
 *     //Do on pending
 *     if (isPending({{simpleName}}State)) {
 *         return <>pending</>
 *     }
 *
 *     //Do on success
 *     if (isSuccess({{simpleName}}State)) {
 *         return <>{JSON.stringify({{simpleName}}State.data)}</>
 *     }
 *
 *     //Do on error
 *     if (isError({{simpleName}}State)) {
 *         return <>An error occurred {JSON.stringify({{simpleName}}State.error)}</>
 *     }
 * }
 * ${"```"}
 * @param entityKey Unique key it isolate each response.
 */
export function use{{capitalizedName}}(entityKey: string = "default"): 
    MycorizaHookResultType<{{returnType}}, ({{#each executionParamsWithType}}{{this}}{{#unless @last}},{{/unless}}{{/each}}) => void> {
    let dispatch = useDispatch();

    /**
     * Upon function execution, a <code>{{method}}</code> call will be issued to <code>{{url}}</code>
     *
     {{#if requestBody}}
     * @param { {{requestBody.typeName}} } {{requestBody.simpleName}} {{requestBody.description}}
     {{/if}}
     */
    function execute({{#each executionParamsWithType}}{{this}}{{#unless @last}},{{/unless}}{{/each}}) {
        {{#if parameters}}
        let parameters = {
            {{#if parameters.query.length}}
            query: {
                {{#each parameters.query}}
                ...(params.{{name}} ? { {{name}}: params.{{name}} } : {}),
                {{/each}}
            },
            {{/if}}
            {{#if parameters.path.length}}
                path: {
                    {{#each parameters.path}}
                    ...(params.{{name}} ? { {{name}}: params.{{name}} } : {}),
                    {{/each}}
                },
            {{/if}}
        }
        
        {{/if}}
        dispatch({{method}}(domain, entityKey, "{{url}}", {{#each executionParams}}{{this}}{{#unless @last}},{{/unless}}{{/each}}))
    }

    return [
        resolveFamily(entityKey, useSelector<MycorizaState<any>, NetworkStateFamily<{{returnType}}>>(state => state.{{dirName}}.{{simpleName}})),
        execute,
        () => dispatch(reset(domain, entityKey))
    ]
}
`

const testTemplate = `
/**
 * @module test/{{capitalizedDirName}}
 */
import { TypedHookStub } from "mycoriza-runtime";
import {MycorizaState} from "../index";
{{#each imports}}
import { {{this}} } from '../../models/{{this}}';
{{/each}}

/**
 * Stub for {{capitalizedName}}. This can be used with <code>testStore</code>
 * @example
 * \`\`\`typescript
 * import {render} from "@testing-library/react";
 * import {testStore} from "mycoriza-runtime";
 * import {rootState} from "./store/store"; //Fix the import
 * import {Provider} from "react-redux";
 * import { stubFor{{capitalizedName}} } from "./api/reducers/{{dirName}}/{{simpleName}}.test"; //Fix the import
 *
 * describe("MyComponent", () => {
 *   it('should work as expected', function () {
 *     let {{simpleName}}Stub = stubFor{{capitalizedName}}();
 *
 *     render(<Provider store={testStore({
 *       rootReducer: rootState,
 *       stubs:[{{simpleName}}Stub]})
 *     } >
 *       <MyComponent/>
 *     </Provider>);
 *
 *     //Write your test code here.
 *   });
 * })
 * \`\`\`
 */
export function stubFor{{capitalizedName}}(): TypedHookStub<MycorizaState<unknown>, {{returnType}}> {
    return new TypedHookStub<MycorizaState<unknown>, {{returnType}}>("@mycoriza/{{dirName}}/{{simpleName}}", (state: MycorizaState<any>) => state.{{dirName}}.{{simpleName}})
}

it('Mock test for stubFor{{capitalizedName}}', () => {
    //Mock test for {{capitalizedName}} stub.
})
`

const exportTemplate = `{{#if parameters}}
export type { {{capitalizedName}}_Params } from '{{filePath}}';
{{/if}}
export { use{{capitalizedName}} } from '{{filePath}}';
export { stubFor{{capitalizedName}} } from '{{filePath}}.test';
`

export interface HookInfo {
    name: string
    path: string
    propType?: string,
    key: string,
    url: string,
    method: string
    exportContent: string
}

export function renderEntityReducer(op: OperationOb, outputDir: string, key: string, openApi: OpenAPIV3.Document<any>): HookInfo {

    let directory = camelcase(key);

    let operation: OperationObject<any> = op.operation
    let {shouldImport, typeName} = extractReturnType(operation) ?? {shouldImport: false, typeName: "unknown"}
    let requestBodyType = extractRequestBodyType(operation, openApi);

    let simpleName = camelcase(operation.operationId);

    let parameterInfo = extractParameters(openApi, operation);

    const parameters = !!parameterInfo ? {
        path: Object.entries(parameterInfo.pathParams).map(([name, {type, description}]) => ({name, type, description})),
        query: Object.entries(parameterInfo.queryParams).map(([name, {type, description}]) => ({name, type, description})),
        props: [...Object.entries(parameterInfo.pathParams), ...Object.entries(parameterInfo.queryParams)].map(([name, {type, description}]) => ({name, type, description})).filter(a => !!a.name),
        importTypes: parameterInfo.importTypes
    } : undefined

    let imports = new Set([shouldImport && typeName, requestBodyType?.shouldImport && requestBodyType?.typeName].filter(a => !!a).map(a => a.replace('[]', '')));

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
            requestBodyType ? `${camelcase(requestBodyType.typeName).replace("[]", "")}` : ([HttpMethods.PUT, HttpMethods.POST].includes(op.method) ? "{}" : undefined),
            parameters?.props?.length && `parameters`
        ].filter(a => !!a),
        executionParamsForSample: [
            requestBodyType && `${camelcase(requestBodyType.typeName)}`,
            parameterInfo && `params`
        ].filter(a => !!a),
        imports: imports
    };

    let content = Handlebars.compile(template)(context);
    if (fs.existsSync(`${outputDir}/reducers/${directory}/${simpleName}.ts`)) {
        fs.unlinkSync(`${outputDir}/reducers/${directory}/${simpleName}.ts`)
    }

    fs.writeFileSync(`${outputDir}/reducers/${directory}/${simpleName}.ts`, content)

    let exportContent = Handlebars.compile(exportTemplate)({
        ...context,
        filePath: `${outputDir}/reducers/${directory}/${simpleName}`.replace('/src', '')
    });

    let testContent = Handlebars.compile(testTemplate)(context);
    fs.writeFileSync(`${outputDir}/reducers/${directory}/${simpleName}.test.ts`, testContent)

    return {
        name: `use${camelcase(operation.operationId, {pascalCase: true})}`,
        path: `reducers/${directory}/${simpleName}`,
        propType: parameters?.props?.length ? `${camelcase(operation.operationId, {pascalCase: true})}_Params` : undefined,
        key: camelcase(key, {pascalCase: true}),
        url: op.path,
        method: op.method.toUpperCase(),
        exportContent
    }
}
