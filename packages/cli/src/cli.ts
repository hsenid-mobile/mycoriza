import {Command} from "commander";
import {addSource} from "./operations/addSource";
import {removeSource} from "./operations/removeSource";
import {listSources} from "./operations/listSources";
import {generateContent} from "./operations/generate/generateContent";

let program = new Command();

let pkg = require("../package.json");

program.name('mycoriza')
  .description('Mycoriza CLI to conduct mycoriza operations')
  .version(pkg.version)

program
  .command("add")
  .description('Add api configuration to the mycoriza configuration')
  .usage("[options]")
  .action(async () => {
    await addSource()
  })

program
  .command("rm")
  .description('Remove an existing api configuration from the mycoriza configuration')
  .usage("[options]")
  .action(async () => {
    await removeSource()
  });

program
  .command("ls")
  .description('List api configurations')
  .usage("[options]")
  .action(async () => {
    listSources()
  });

program
  .command('generate:api')
  .usage('[options]')
  .action(async () => {
    await generateContent(false)
  });

program
  .command('generate:api:lib')
  .usage('[options]')
  .action(async () => {
    await generateContent(true)
  });

(async function () {
  await program.parseAsync()
})()
