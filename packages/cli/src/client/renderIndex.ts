import {ExportContent} from "../types";
import Handlebars from "handlebars";
import fs from 'fs'
import path from 'path'

const template = `
{{#each exportContents}}
export {{#if type}}type {{/if}}{ {{#each exports}}{{#if @last}}{{value}}{{else}}{{value}},{{/if}}{{/each}} } from '{{path}}'; 
{{/each}}
`

export function renderIndex(exportContents: ExportContent[]) {
  let indexPath = './src/index.ts';
  let content = Handlebars.compile(template)({
    exportContents: exportContents.map(({exports, type, path: p}, index, arr) => ({
      type: type === 'type',
      path: `./${path.relative('./src', p).replace('.ts', '')}`,
      exports: exports.map((value) => {
        let count = 0
        for (let i = 0; i < index; i++) {
          if (arr[i].exports.includes(value)) count ++
        }
        if (count) return ({value: `${value} as ${value}${count}`})
        return ({value});
      })
    }))
  });

  if (fs.existsSync(indexPath)) {
    fs.unlinkSync(indexPath)
  }
  fs.writeFileSync(indexPath, content)
}
