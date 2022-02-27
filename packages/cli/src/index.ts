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
  .argument('[sources...]', 'Sources to be fetched', 'all')
  .usage('[options]')
  .action(async (args) => {
    await generateContent(false, args)
  });

program
  .command('generate:api:lib')
  .argument('[sources...]', 'Sources to be fetched', 'all')
  .usage('[options]')
  .action(async (args) => {
    await generateContent(true, args)
  });

(async function () {
  await program.parseAsync()
})()
