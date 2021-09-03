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
import BottomBar from "bottom-bar";
import {addTypedocConfig} from "./client/addTypedocConfig";
import {dots} from 'cli-spinners'
import {addTypedocReadme} from "./client/addTypedocReadme";

inquirer.registerPrompt('fuzzypath', fuzzyPathPlugin)

const ui = new BottomBar({
  format: "{value}"
})

export async function generateApi(complete: boolean = true) {

  let json = JSON.parse(fs.readFileSync("package.json", 'utf8'));
  let mycoriza = json.mycoriza;

  if (!mycoriza) {
    ui.update(chalk`{red Could not find the configuration. Have you initialized mycoriza?}`)
    return null;
  }

  ui.log(chalk`{green ${get('heavy_check_mark')} Detect mycoriza configuration}`)

  let data = await getOpenApiSpec(mycoriza.specUrl);

  ui.log(chalk`{green ${get('heavy_check_mark')} Fetch specification}`)

  let output = mycoriza.apiPath;

  rimraf.sync(output)

  ui.log(chalk`{green ${get('heavy_check_mark')} Remove api directory}`)

  await generate({
    input: data,
    output: output,
    exportCore: false,
    exportSchemas: false,
    exportServices: false,
    useUnionTypes: true
  })

  ui.log(chalk`{green ${get('heavy_check_mark')} Generate API}`)
  generateHooks(data, output)

  ui.log(chalk`{green ${get('heavy_check_mark')} Generate Hooks}`)
  if (complete) {
    ui.destroy()
  }

  addTypedocReadme(data, mycoriza)
}

async function getUrlAndData() {
  let urlInput = await inquirer.prompt({
    type: 'input',
    name: 'specUrl',
    message: 'What is the swagger OpenAPI specification url?'
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

export async function doEnhance() {
  let _json = JSON.parse(fs.readFileSync("package.json", 'utf8'));
  let mycoriza = _json.mycoriza;

  if (!!mycoriza) {
    ui.log(chalk`{red Mycoriza is already initiated. Running this command again will break the existing configurations}`)
    ui.destroy()
    return;
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

  let {path} = await inquirer.prompt({
    type: 'fuzzypath' as any,
    name: 'path',
    message: 'Please select the entry point',
    rootPath: '../example/src',
    default: './src/index.tsx'
  } as any);

  let {packageManager} = await inquirer.prompt({
    type: "list",
    name: "packageManager",
    message: 'What is the package manager in use?',
    choices: ["npm", "yarn", "pnpm"]
  });

  ui.update(chalk`{blue Installing mycoriza-runtime, redux and redux-axios-middleware}`, dots)
  execSync(await installPackage(packageManager, 'mycoriza-runtime', 'redux-axios-middleware', 'redux'), {
    stdio: "ignore"
  })

  ui.update(chalk`{blue Installing mycoriza-cli, typedoc, typedoc-plugin-merge-modules and rimraf }`, dots)
  execSync(await installPackageDev(packageManager, 'typedoc', 'rimraf', 'typedoc-plugin-merge-modules'), {
    stdio: "ignore"
  })

  ui.log(chalk`{green ${get('heavy_check_mark')} Add dependencies}`)
  ui.update(chalk`{blue Adding configurations to package json}`)
  let json = JSON.parse(fs.readFileSync("package.json", 'utf8'));
  json.mycoriza = {
    specUrl: url,
    storePath: storePath,
    apiPath: apiPath
  }
  json.scripts.updateApi = `npx mycoriza-cli generate:api && ${await runCommand(packageManager, 'updateDocs')}`
  json.scripts.updateDocs = `${await runCommand(packageManager, 'rimraf ./docs')} && ./node_modules/typedoc/bin/typedoc --options ./typedoc.json ${apiPath}`
  fs.writeFileSync("package.json", JSON.stringify(json, null, '\t'))
  ui.log(chalk`{green ${get('heavy_check_mark')} Update package.json with configurations}`)

  ui.log(chalk`{green ${get('heavy_check_mark')} Generating typedoc config}`)
  addTypedocConfig(data)

  ui.update(chalk`{blue Generating store setup}`)
  generateStarterSetup({
    setupDir: storePath,
    output: apiPath,
    devUrl: devBaseUrl,
    prodUrl: prodBaseUrl
  })
  ui.log(chalk`{green ${get('heavy_check_mark')} Setup redux}`)

  ui.update(chalk`{blue Generating API}`)
  await generateApi(false)

  ui.update(chalk`{blue }`)

  ui.update(chalk`{blue Updating ${path} with redux store}`)
  updateEntryPoint(path, storePath)
  ui.log(chalk`{green ${get('heavy_check_mark')} Update entry point}`)

  ui.update(chalk`{blue generating documentation}`)
  execSync(await runCommand(packageManager, 'updateDocs'), {
    stdio: "ignore"
  })
  ui.log(chalk`{green ${get('heavy_check_mark')} Generate docs}`)

  ui.update(chalk`{green completed}`)

  ui.destroy()
}

async function installPackage(packageManager: string, ...packages: string[]) {
  switch (packageManager) {
    case "pnpm":
      return `pnpm add ${packages.join(' ')}`
    case "npm":
      return `npm i ${packages.join(' ')}`
    case "yarn":
      return `yarn add ${packages.join(' ')}`
  }
}

async function installPackageDev(packageManager: string,...packages: string[]) {
  switch (packageManager) {
    case "pnpm":
      return `pnpm add -D ${packages.join(' ')}`
    case "npm":
      return `npm i -D ${packages.join(' ')}`
    case "yarn":
      return `yarn add -D ${packages.join(' ')}`
  }
}

async function runCommand(packageManager: string, command: string) {
  switch (packageManager) {
    case "pnpm":
      return `pnpm run ${command}`
    case "npm":
      return `npm run ${command}`
    case "yarn":
      return `yarn ${command}`
  }
}

