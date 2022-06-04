import fs from 'fs'
import camelcase from "camelcase";
import {MycorizaConfig} from "../types";
import {applyTemplate} from "../resolveTemplate";


export function renderRootReducer(outputDir: string, config: MycorizaConfig) {
  let context = {
    api: config.sources.map(({id}) => ({apiId: id, apiTypeId: camelcase(id, {pascalCase: true})}))
  };
  let content = applyTemplate('src/api/index.ts.hbs', context);
  //Handlebars.compile(template)(context);

  if (fs.existsSync(`${outputDir}/index.ts`)) {
    fs.unlinkSync(`${outputDir}/index.ts`)
  }

  fs.writeFileSync(`${outputDir}/index.ts`, content)
}
