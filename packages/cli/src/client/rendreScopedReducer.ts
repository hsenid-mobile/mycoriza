import {OperationOb} from "./types";
import camelcase from "camelcase";
import fs from "fs";
import {OpenAPIV3} from "openapi-types";
import {extractReturnType} from "./util";
import OperationObject = OpenAPIV3.OperationObject;
import {applyTemplate} from "../resolveTemplate";

export function renderScopedReducer(operations: OperationOb[], outputDir: string, key: string) {

    let directory = camelcase(key);

    let ops = operations.map(op => {
        let operation: OperationObject<any> = op.operation
        let {shouldImport, typeName} = extractReturnType(operation) ?? {shouldImport: false, typeName: "unknown"}

        return ({
            typeName,
            simpleName: camelcase(operation.operationId),
            shouldImport,
            domain: `@mycoriza/${camelcase(key)}/${camelcase(operation.operationId)}`
        });
    }).filter(a => !!a);


    let context = {
        typeName: camelcase(key, {pascalCase: true}),
        directory: directory,
        ops: ops,
        imports: new Set(ops.filter(a => a.shouldImport).map(a => a.typeName).map(a => a.replace('[]', '')))
    };
    let content = applyTemplate('src/api/$source/reducers/$scope/index.ts.hbs', context);

    if (fs.existsSync(`${outputDir}/reducers/${directory}/index.ts`)) {
        fs.unlinkSync(`${outputDir}/reducers/${directory}/index.ts`)
    }
    if (!fs.existsSync(`${outputDir}/reducers/${directory}`)) {
        fs.mkdirSync(`${outputDir}/reducers/${directory}`)
    }
    fs.writeFileSync(`${outputDir}/reducers/${directory}/index.ts`, content)
}
