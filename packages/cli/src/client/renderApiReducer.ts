import camelcase from "camelcase";
import fs from 'fs'
import {MycorizaSourceConfig} from "../types";
import {applyTemplate} from "../resolveTemplate";

function getUrlConfigContent(types: string[], source: MycorizaSourceConfig) {
    let context = {
        states: types.map(a => ({
            typeName: camelcase(a, {pascalCase: true}),
            directory: camelcase(a),
        })),
        baseUrl: source.devUrl,
        prodUrl: source.prodUrl
    };
    return applyTemplate(`src/api/$source/reducers/config.ts.hbs`, context);
}

export function renderApiReducer(types: string[], outputDir: string, source: MycorizaSourceConfig): string {

    let context = {
        states: types.map(a => ({
            typeName: camelcase(a, {pascalCase: true}),
            directory: camelcase(a),
        })),
        baseUrl: source.devUrl,
        prodUrl: source.prodUrl,
        apiId: source.id,
        apiTypeId: camelcase(source.id, {pascalCase: true})
    };
    let content = applyTemplate(`src/api/$source/reducers/index.ts.hbs`, context);
    //Handlebars.compile(template)(context);

    if (fs.existsSync(`${outputDir}/reducers/reducer.ts`)) {
        fs.unlinkSync(`${outputDir}/reducers/reducer.ts`)
    }
    if (!fs.existsSync(`${outputDir}/reducers`)) {
        fs.mkdirSync(`${outputDir}/reducers`)
    }
    fs.writeFileSync(`${outputDir}/reducers/index.ts`, content)

    let urlConfigContent = getUrlConfigContent(types, source);
    fs.writeFileSync(`${outputDir}/reducers/config.ts`, urlConfigContent)

    return content;
}
