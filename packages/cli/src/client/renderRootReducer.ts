import Handlebars from "handlebars";
import fs from 'fs'
import camelcase from "camelcase";
import {MycorizaConfig} from "../types";

const template = `
{{#each api}}
import type { {{apiTypeId}}State } from './{{apiId}}/reducers'
import { {{apiId}}Reducers } from './{{apiId}}/reducers'
{{/each}}
import {combineReducers, ReducersMapObject} from "redux";

export type MycorizaState<T> = {
{{#each api}}
    {{apiId}}: {{apiTypeId}}State
{{/each}}
} & T

export function mycorizaMapObject<T>(reducers: ReducersMapObject<T>): ReducersMapObject<MycorizaState<T>> {
    return {
        {{#each api}}
            {{apiId}}: {{apiId}}Reducers,
        {{/each}}
        ...reducers
    } as any
}

export function mycorizaState<T>(reducers: ReducersMapObject<T>) {
    return combineReducers<MycorizaState<T>>(mycorizaMapObject(reducers))
}
`

export function renderRootReducer(outputDir: string, config: MycorizaConfig) {
  let content = Handlebars.compile(template)({
    api: config.sources.map(({id}) => ({apiId: id, apiTypeId: camelcase(id, {pascalCase: true})}))
  });

  if (fs.existsSync(`${outputDir}/index.ts`)) {
    fs.unlinkSync(`${outputDir}/index.ts`)
  }

  fs.writeFileSync(`${outputDir}/index.ts`, content)
}
