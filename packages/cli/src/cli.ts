import {listApis, generateApi, removeApi, addApi} from './index'
import {Command} from "commander";

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
    await addApi()
  })

program
  .command("rm")
  .description('Remove an existing api configuration from the mycoriza configuration')
  .usage("[options]")
  .action(async () => {
    await removeApi()
  });

program
  .command("ls")
  .description('List api configurations')
  .usage("[options]")
  .action(async () => {
    try {
      await listApis()
    } catch (e) {
      process.exit(1)
    }
  });

program
  .command('generate:api')
  .usage('[options]')
  .action(async () => {
    await generateApi(false)
  });

program
  .command('generate:api:lib')
  .usage('[options]')
  .action(async () => {
    await generateApi(true)
  });

(async function () {
  await program.parseAsync()
})()
