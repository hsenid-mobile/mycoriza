import fs from "fs";
import chalk from "chalk";
import {getOpenApiSpec} from "./openApi/getSpec";
import rimraf from "rimraf";
import {generate} from "openapi-typescript-codegen";
import {generateHooks} from "./client/generator";
import inquirer from "inquirer";
import fuzzyPathPlugin from "inquirer-fuzzy-path";
import {OpenAPIV3} from "openapi-types";
import {execSync} from "child_process";
import {get} from "node-emoji";
import {generateStarterSetup} from "./setup/generateStarterSetup";
import {updateEntryPoint} from "./client/renderEntryPoint";

inquirer.registerPrompt('fuzzypath', fuzzyPathPlugin)

const ui = new inquirer.ui.BottomBar()

export async function generateApi() {

  let json = JSON.parse(fs.readFileSync("package.json", 'utf8'));
  let mycoriza = json.mycoriza;

  if (!mycoriza) {
    ui.updateBottomBar(chalk`{red Could not find the configuration. Have you initialized mycoriza?}`)
    return null;
  }

  let data = await getOpenApiSpec(mycoriza.specUrl);

  let output = mycoriza.apiPath;

  rimraf.sync(output)

  await generate({
    input: data,
    output: output,
    exportCore: false,
    exportSchemas: false,
    exportServices: false,
    useUnionTypes: true
  })

  generateHooks(data, output)
}

async function getUrlAndData() {
  let urlInput = await inquirer.prompt({
    type: 'input',
    name: 'specUrl',
    message: 'What is the swagger OpenAPI specification url?'
  });

  try {
    ui.updateBottomBar(chalk`{blue Fetching OPENAPI config}`)
    let data: OpenAPIV3.Document<any> = await getOpenApiSpec(urlInput.specUrl);
    return {
      url: urlInput.specUrl,
      data
    }
  } catch (e) {
    ui.updateBottomBar(chalk.red("Could not fetch data for the given input. Please try again."))
    return getUrlAndData();
  }
}

export async function doEnhance() {
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

  let {storePath} = await inquirer.prompt({
    type: "input",
    name: 'storePath',
    message: "Where should the store be configured?",
    default: './src/store'
  });

  let {apiPath} = await inquirer.prompt({
    type: "input",
    name: 'apiPath',
    message: "Where should the api be configured?",
    default: './src/api'
  });

  let {packageManager} = await inquirer.prompt({
    type: "list",
    name: 'What is the package manager in use?',
    choices: ["npm", "yarn"]
  });

  let {path} = await inquirer.prompt({
    type: 'fuzzypath' as any,
    name: 'path',
    message: 'Please select the entry point',
    rootPath: '../example/src',
    default: './src/index.tsx'
  } as any);

  ui.updateBottomBar(chalk`{blue Installing mycoriza-runtime}`)
  execSync(packageManager === 'npm' ? 'npm i mycoriza-runtime' : 'yarn add mycoriza-runtime',)

  ui.updateBottomBar(chalk`{blue Installing mycoriza-cli, typedoc and rimraf}`)
  execSync(packageManager === 'npm' ? 'npm i -D mycoriza-cli typedoc rimraf' : 'yarn add -D mycoriza-cli typedoc rimraf')

  ui.log.write(chalk`{green ${get('heavy_check_mark')} Add dependencies}`)
  ui.updateBottomBar(chalk`{blue Adding configurations to package json}`)
  let json = JSON.parse(fs.readFileSync("package.json", 'utf8'));
  json.mycoriza = {
    specUrl: url,
    storePath: storePath,
    apiPath: apiPath
  }
  json.scripts.updateApi = `./node_modules/mycoriza-cli/dist/cli.js generate:api && ${packageManager === 'npm' ? 'npm run updateDocs' : 'yarn updateDocs'}`
  json.scripts.updateDocs = `${packageManager === 'npm' ? 'npm run rimraf ./docs' : 'yarn rimraf ./docs'} && ./node_modules/typedoc/bin/typedoc ${apiPath}`
  fs.writeFileSync("package.json", JSON.stringify(json, null, '\t'))
  ui.log.write(chalk`{green ${get('heavy_check_mark')} Update package.json with configurations}`)

  ui.updateBottomBar(chalk`{blue Generating store setup}`)
  generateStarterSetup({
    setupDir: storePath,
    output: apiPath,
    devUrl: devBaseUrl,
    prodUrl: prodBaseUrl
  })
  ui.log.write(chalk`{green ${get('heavy_check_mark')} Setup redux}`)

  ui.updateBottomBar(chalk`{blue Generating API}`)
  await generateApi()
  ui.log.write(chalk`{green ${get('heavy_check_mark')} Generate API}`)

  ui.updateBottomBar(chalk`{blue }`)

  ui.updateBottomBar(chalk`{blue Updating ${path} with redux store}`)
  updateEntryPoint(path, storePath)
  ui.log.write(chalk`{green ${get('heavy_check_mark')} Update entry point}`)

  ui.updateBottomBar(chalk`{blue generating documentation}`)
  execSync(packageManager === 'npm' ? 'npm run updateDocs' : 'yarn updateDocs')
  ui.log.write(chalk`{green ${get('heavy_check_mark')} Generate docs}`)

  ui.updateBottomBar(chalk`{green completed}`)
}
