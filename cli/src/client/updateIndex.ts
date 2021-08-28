import {HookInfo} from "./renderEntityReducer";
import Handlebars from "handlebars";
import camelcase from "camelcase";
import fs from "fs";

const template = `
{{#each imports}}
/**
 * Issues a {{method}} call to <code>{{url}}</code>
 */
export { {{name}}{{#if reassign}} as {{name}}From{{key}}{{/if}} } from './{{path}}'
{{#if propType}}export type { {{propType}}{{#if reassign}} as {{propType}}_From_{{key}}{{/if}} } from './{{path}}'{{/if}}
{{/each}}
`

export function updateIndex(imports: HookInfo[], outputDir: string) {
    let names = imports.map(({name}) => name).reduce((prev, curr) => (prev[curr] = ++prev[curr] || 1, prev), {});

    let content = Handlebars.compile(template)({
        imports: imports.map(a => ({
            ...a,
            reassign: names[a.name] > 1
        }))
    });

    fs.appendFileSync(`${outputDir}/index.ts`, content)
}
