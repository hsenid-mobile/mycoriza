import Handlebars from 'handlebars'
import camelcase from "camelcase";
import fs from 'fs'
import {MycorizaSourceConfig} from "../types";

const template = `
import {combineReducers, ReducersMapObject} from 'redux'
{{#each states}}
import { {{typeName}}State, {{directory}}Reducers } from './{{directory}}';
{{/each}}

/**
 * @ignore
 */
export type {{apiTypeId}}State = {
{{#each states}}
    {{directory}}: {{typeName}}State
{{/each}}
}

/**
 * @ignore
 */
export const {{apiId}}Reducers = combineReducers<{{apiTypeId}}State>({
{{#each states}}
  {{directory}}: {{directory}}Reducers,
{{/each}}
})

`

const urlConfigTemplate = `
/**
 * @ignore
 */
export function baseUrl() {
    return process.env.API_URL ?? (!process.env.NODE_ENV || process.env.NODE_ENV === 'development' ? '{{baseUrl}}' : '{{prodUrl}}')
}
`

export function renderApiReducer(types: string[], outputDir: string, source: MycorizaSourceConfig): string {

    let content = Handlebars.compile(template)({
        states: types.map(a => ({
            typeName: camelcase(a, {pascalCase: true}),
            directory: camelcase(a),
        })),
        baseUrl: source.devUrl,
        prodUrl: source.prodUrl,
        apiId: source.id,
        apiTypeId: camelcase(source.id, {pascalCase: true})
    });

    if (fs.existsSync(`${outputDir}/reducers/reducer.ts`)) {
        fs.unlinkSync(`${outputDir}/reducers/reducer.ts`)
    }
    if (!fs.existsSync(`${outputDir}/reducers`)) {
        fs.mkdirSync(`${outputDir}/reducers`)
    }
    fs.writeFileSync(`${outputDir}/reducers/index.ts`, content)

    let urlConfigContent = Handlebars.compile(urlConfigTemplate)({
        states: types.map(a => ({
            typeName: camelcase(a, {pascalCase: true}),
            directory: camelcase(a),
        })),
        baseUrl: source.devUrl,
        prodUrl: source.prodUrl
    });
    fs.writeFileSync(`${outputDir}/reducers/config.ts`, urlConfigContent)

    return content;
}
