import Handlebars from 'handlebars'
import camelcase from "camelcase";
import fs from 'fs'

const template = `
import {combineReducers, ReducersMapObject} from 'redux'
{{#each states}}
import { {{typeName}}State, {{directory}}Reducers } from './{{directory}}';
{{/each}}

export type MycorizaState<T> = {
{{#each states}}
    {{directory}}: {{typeName}}State
{{/each}}
} & T

/**
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
    return combineReducers< MycorizaState<T>>({
            {{#each states}}
                {{directory}}: {{directory}}Reducers,
            {{/each}}
            ...reducers
        } as any)
}
`

export function renderRootReducer(types: string[], outputDir: string): string {

    let content = Handlebars.compile(template)({
        states: types.map(a => ({
            typeName: camelcase(a, {pascalCase: true}),
            directory: camelcase(a)
        }))
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
