import {OpenAPIV3} from "openapi-types";
import {ExportContent, MycorizaConfig, MycorizaSourceConfig} from "../../types";
import {getOpenApiSpec} from "../../openApi/getSpec";
import {apiPath, CONFIG_FILE, ui} from "../../util";
import {generate} from "openapi-typescript-codegen";
import fs from "fs";
import chalk from "chalk";
import {get} from "node-emoji";
import {generateHooks} from "../../client/generator";
import {renderRootReducer} from "../../client/renderRootReducer";
import {addTypedocConfig} from "../../client/addTypedocConfig";
import {renderIndex} from "../../client/renderIndex";
import {combinedModifiers} from "./modifiers";
import {extractInlineRequestBody} from "./modifiers/extractInlineRequestBody";
import {extractInlineResponse} from "./modifiers/extractInlineResponse";

async function generateSingleApi(source: MycorizaSourceConfig, config: MycorizaConfig, exportContents: ExportContent[]) {

  let data: OpenAPIV3.Document = combinedModifiers(extractInlineRequestBody, extractInlineResponse)({
    sourceConfig: source,
    config
  })(await getOpenApiSpec(source.specUrl))

  const output = `${apiPath}/${source.id}`

  await generate({
    input: data,
    output: output,
    exportCore: false,
    exportSchemas: false,
    exportServices: false,
    useUnionTypes: true
  })
  for (let path of fs.readdirSync(`${output}/models`)) {
    exportContents.push({
      type: "type",
      path: `${output}/models/${path}`,
      exports: [path.replace('.ts', '')]
    })
  }

  ui.log(chalk`{green ${get('heavy_check_mark')} [${source.id}] Generate API}`)
  generateHooks(data, output, source, exportContents);

  ui.log(chalk`{green ${get('heavy_check_mark')} [${source.id}] Generate Hooks}`)
}

export async function generateContent(lib: boolean, allowedSources: string[]) {
  if (!fs.existsSync(CONFIG_FILE)) {
    ui.log(chalk`{red ${get('x')} Cannot find mycoriza.config.json}`)
    return undefined
  }

  let json: MycorizaConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));

  let sources = json.sources;

  if (!allowedSources.includes('all')) {
    sources = sources.filter(({id}) => allowedSources.includes(id))
  }

  if (!sources.length) {
    ui.log(chalk`{yellow ${get('exclamation')} There are no services configured ${allowedSources.includes('all') ? '' : `with id '${allowedSources.join(',')}'`}.}`)
    return undefined
  }

  const exportContents: ExportContent[] = []

  for (let source of sources) {
    await generateSingleApi(source, json, exportContents)
  }

  renderRootReducer(apiPath, json)
  ui.log(chalk`{green ${get('heavy_check_mark')} Root reducer generated.}`)

  addTypedocConfig(exportContents)
  ui.log(chalk`{green ${get('heavy_check_mark')} typedoc.json generated.}`)
  if (lib) {
    renderIndex(exportContents)
    ui.log(chalk`{green ${get('heavy_check_mark')} Index file generated.}`)
  }
}
