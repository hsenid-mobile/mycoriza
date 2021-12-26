#!/usr/bin/env node

const {program} = require('commander')
const inquirer = require('inquirer')
const fuzzyPathPlugin = require('inquirer-fuzzy-path')
const path = require('path')

const {generateApi, addApi, removeApi} = require(path.resolve(__dirname, '../dist/index.js'))

inquirer.registerPrompt('fuzzypath', fuzzyPathPlugin)

let pkg = require("../package.json");

program
    .version(pkg.version)
    .command('generate:api')
    .usage('[options]')
    .action(() => {
        generateApi()
    });

program
    .version(pkg.version)
    .command('generate:api:lib')
    .usage('[options]')
    .action(() => {
        generateApi(true)
    });

program
    .version(pkg.version)
    .command("add")
    .usage("[options]")
    .action(async () => {
        await addApi()
    })

program
    .version(pkg.version)
    .command("remove")
    .usage("[options]")
    .action(async () => {
        await removeApi()
    });

(async function () {
    await program.parseAsync()
})()
