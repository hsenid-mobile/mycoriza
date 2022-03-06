import fs from "fs";
import chalk from "chalk";
import {get} from "node-emoji";
import {MycorizaConfig} from "../types";
import inquirer from "inquirer";
import {CONFIG_FILE, ui} from "../util";

export async function removeSource(source?: string) {
  if (!fs.existsSync(CONFIG_FILE)) {
    ui.log(chalk`{red ${get('x')} Cannot find mycoriza.config.json}`)
    return false
  }

  let json: MycorizaConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));

  if (!json.sources.length) {
    ui.log(chalk`{green ${get('heavy_check_mark')} There are no apis configured to be removed}`)
    return false
  }

  let choice = source
  if (choice === undefined) {
    let {choice: _choice} = await inquirer.prompt({
      type: "list",
      name: 'choice',
      message: 'What is the api you are going to remove?',
      default: json.sources[0]?.id,
      choices: json.sources.map(({id}) => id)
    });
    choice = _choice
  }

  json.sources = json.sources.filter(({id}) => id !== choice)

  fs.writeFileSync(CONFIG_FILE, JSON.stringify(json, null, '\t'))

  ui.log(chalk`{green ${get('heavy_check_mark')} Removed API '${choice}'}`)
}
