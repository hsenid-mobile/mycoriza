import Handlebars from 'handlebars'
import camelcase from "camelcase";
import fs from 'fs'

const template = `
import {combineReducers, ReducersMapObject} from 'redux'
{{#each states}}
import { {{typeName}}State, {{directory}}Reducers } from './{{directory}}';
{{/each}}

/**
 * @ignore
 */
export type MycorizaState<T> = {
{{#each states}}
    {{directory}}: {{typeName}}State
{{/each}}
} & T

export function mycorizaMapObject<T>(reducers: ReducersMapObject<T>): ReducersMapObject<MycorizaState<T>> {
    return {
        {{#each states}}
            {{directory}}: {{directory}}Reducers,
        {{/each}}
        ...reducers
    } as any
}

/**
 * @ignore
 * Generates a mycoriza generated state empowered redux state. 
 * 
 * Apart from the provided reduces, following reducers are injected.
{{#each states}}
 * {@link {{directory}}Reducers}
{{/each}}
 * 
 * @param reducers
 */
export function mycorizaState<T>(reducers: ReducersMapObject<T>) {
    return combineReducers< MycorizaState<T>>(mycorizaMapObject(reducers))
}

/**
 * @ignore
 */
export function baseUrl() {
    return process.env.API_URL ?? (!process.env.NODE_ENV || process.env.NODE_ENV === 'development' ? '{{baseUrl}}' : '{{prodUrl}}')
}
`

export function renderRootReducer(types: string[], outputDir: string, baseUrl: string, prodUrl: string): string {

    let content = Handlebars.compile(template)({
        states: types.map(a => ({
            typeName: camelcase(a, {pascalCase: true}),
            directory: camelcase(a),
        })),
        baseUrl: baseUrl,
        prodUrl: prodUrl
    });

    if (fs.existsSync(`${outputDir}/reducers/reducer.ts`)) {
        fs.unlinkSync(`${outputDir}/reducers/reducer.ts`)
    }
    if (!fs.existsSync(`${outputDir}/reducers`)) {
        fs.mkdirSync(`${outputDir}/reducers`)
    }
    fs.writeFileSync(`${outputDir}/reducers/index.ts`, content)

    return content;
}
