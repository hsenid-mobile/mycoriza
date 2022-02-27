import fs from "fs";
import chalk from "chalk";
import {getOpenApiSpec} from "./openApi/getSpec";
import {generate} from "openapi-typescript-codegen";
import {generateHooks} from "./client/generator";
import inquirer from "inquirer";
import fuzzyPathPlugin from "inquirer-fuzzy-path";
import {OpenAPIV3} from "openapi-types";
import {get} from "node-emoji";
import BottomBar from "bottom-bar";
import {addTypedocConfig} from "./client/addTypedocConfig";
import {ExportContent, MycorizaConfig, MycorizaConfigSource} from "./types";
import {renderRootReducer} from "./client/renderRootReducer";
import {renderIndex} from "./client/renderIndex";

inquirer.registerPrompt('fuzzypath', fuzzyPathPlugin)

const ui = new BottomBar({
  format: "{value}"
})
const apiPath = './src/api';

const CONFIG_FILE = "mycoriza.config.json";

export async function listApis() {
  if (!fs.existsSync(CONFIG_FILE)) {
    ui.log(chalk`{red ${get('x')} Cannot find mycoriza.config.json}`)
    return false
  }

  let json: MycorizaConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));

  if (!json.sources.length) {
    ui.log(chalk`{green ${get('heavy_check_mark')} There are no apis configured to be removed}`)
    return false
  }

  json.sources.forEach(config => {
    ui.log(chalk`{green ${get('heavy_check_mark')} ${config.name} (${config.id}) : ${config.specUrl} }`)
  })
}

export async function addApi() {
  let json: MycorizaConfig = {
    sources: []
  }

  if (fs.existsSync(CONFIG_FILE)) {
    json = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"))
  }

  let {data, url} = await getUrlAndData();

  let serverUrl = data.servers?.[0]?.url;
  let {devBaseUrl} = await inquirer.prompt({
    type: "input",
    name: 'devBaseUrl',
    message: 'What is the development base url?',
    default: serverUrl
  });

  let {prodBaseUrl} = await inquirer.prompt({
    type: "input",
    name: 'prodBaseUrl',
    message: 'What is the production base url?'
  });

  let {id} = await inquirer.prompt({
    type: "input",
    name: 'id',
    message: 'Please enter an id for the API. The related sources will be generated in `${apiPath}/<api-id>` directory',
    async validate(input) {
      if (/([_a-zA-Z])([_a-zA-Z0-9])+/.test(input)) return true
      return 'Invalid format. the id should be an alphanumeric name starting with a letter.'
    }
  });

  json.sources.push({
    id: id,
    name: data.info.title,
    devUrl: devBaseUrl,
    prodUrl: prodBaseUrl,
    specUrl: url
  })

  fs.writeFileSync(CONFIG_FILE, JSON.stringify(json, null, '\t'))

  ui.log(chalk`{green ${get('heavy_check_mark')} Api Added}`)
}

export async function removeApi() {
  if (!fs.existsSync(CONFIG_FILE)) {
    ui.log(chalk`{red ${get('x')} Cannot find mycoriza.config.json}`)
    return false
  }

  let json: MycorizaConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));

  if (!json.sources.length) {
    ui.log(chalk`{green ${get('heavy_check_mark')} There are no apis configured to be removed}`)
    return false
  }

  let {choice} = await inquirer.prompt({
    type: "list",
    name: 'choice',
    message: 'What is the api you are going to remove?',
    default: json.sources[0]?.id,
    choices: json.sources.map(({id}) => id)
  });

  json.sources = json.sources.filter(({id}) => id !== choice)

  fs.writeFileSync(CONFIG_FILE, JSON.stringify(json, null, '\t'))

  ui.log(chalk`{green ${get('heavy_check_mark')} Removed API '${choice}'}`)
}

async function generateSingleApi(source: MycorizaConfigSource, exportContents: ExportContent[]) {
  let data = await getOpenApiSpec(source.specUrl);

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

export async function generateApi(lib: boolean) {
  if (!fs.existsSync(CONFIG_FILE)) {
    ui.log(chalk`{red ${get('x')} Cannot find mycoriza.config.json}`)
    return undefined
  }

  let json: MycorizaConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));

  if (!json.sources.length) {
    ui.log(chalk`{green ${get('heavy_check_mark')} There are no apis configured.}`)
    return undefined
  }

  const exportContents: ExportContent[] = []

  for (let source of json.sources) {
    await generateSingleApi(source, exportContents)
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

async function getUrlAndData() {
  let urlInput = await inquirer.prompt({
    type: 'input',
    name: 'specUrl',
    message: 'What is the OpenAPI specification url?'
  });

  try {
    ui.update(chalk`{blue Fetching OPENAPI config}`)
    let data: OpenAPIV3.Document<any> = await getOpenApiSpec(urlInput.specUrl);
    ui.update(``)
    return {
      url: urlInput.specUrl,
      data
    }
  } catch (e) {
    ui.update(chalk.red("Could not fetch data for the given input. Please try again."))
    return getUrlAndData();
  }
}
