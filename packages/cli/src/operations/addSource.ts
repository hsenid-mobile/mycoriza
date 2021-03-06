import {MycorizaConfig} from "../types";
import fs from "fs";
import inquirer from "inquirer";
import chalk from "chalk";
import {get} from "node-emoji";
import {CONFIG_FILE, ui, getUrlAndData} from "../util";
import simpleGit from "simple-git";

interface SourceConfig {
  source?: string
  devUrl?: string
  prodUrl?: string
  id?: string
}

export async function addSource(config: SourceConfig) {
  let json: MycorizaConfig = {
    sources: []
  }

  if (fs.existsSync(CONFIG_FILE)) {
    json = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"))
  }

  let {data, url} = await getUrlAndData(json, config.source);

  let serverUrl = data.servers?.[0]?.url;
  let devBaseUrl = config.devUrl
  if (devBaseUrl === undefined) {
    let {devBaseUrl: baseUrl} = await inquirer.prompt({
      type: "input",
      name: 'devBaseUrl',
      message: 'What is the development base url?',
      default: serverUrl
    });
    devBaseUrl = baseUrl
  }

  let prodBaseUrl = config.prodUrl
  if (prodBaseUrl === undefined) {
    let {prodBaseUrl: baseUrl} = await inquirer.prompt({
      type: "input",
      name: 'prodBaseUrl',
      message: 'What is the production base url?'
    });
    prodBaseUrl = baseUrl
  }

  let id = config.id
  if (id === undefined) {
    let {id: _id} = await inquirer.prompt({
      type: "input",
      name: 'id',
      message: 'Please enter an id for the API. The related sources will be generated in `${apiPath}/<api-id>` directory',
      async validate(input) {
        if (/([_a-zA-Z])([_a-zA-Z0-9])+/.test(input)) return true
        return 'Invalid format. the id should be an alphanumeric name starting with a letter.'
      }
    });
    id = _id
  }

  json.sources.push({
    id: id,
    name: data.info.title,
    devUrl: devBaseUrl,
    prodUrl: prodBaseUrl,
    specUrl: url
  })

  fs.writeFileSync(CONFIG_FILE, JSON.stringify(json, null, '\t'))

  ui.log(chalk`{green ${get('heavy_check_mark')} Api Added}`)

  if (json.addToGitOnUpdate !== false) {
    try {
      simpleGit().add(CONFIG_FILE)
      ui.log(chalk`{green ${get('heavy_check_mark')} Add ${CONFIG_FILE} to git}`)
    } catch (e) {
      console.log(e)
    }
  }
}
