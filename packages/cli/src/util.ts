import BottomBar from "bottom-bar";
import inquirer from "inquirer";
import chalk from "chalk";
import {OpenAPIV3} from "openapi-types";
import {getOpenApiSpec} from "./openApi/getSpec";
import fuzzyPathPlugin from "inquirer-fuzzy-path";

inquirer.registerPrompt('fuzzypath', fuzzyPathPlugin)

export const ui = new BottomBar({
  format: "{value}"
})
export const apiPath = './src/api';

export const CONFIG_FILE = "mycoriza.config.json";

export async function getUrlAndData() {
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
