import fs from "fs";
import chalk from "chalk";
import {get} from "node-emoji";
import {MycorizaConfig} from "../types";
import {CONFIG_FILE, ui} from "../util";

export async function listSources() {
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
