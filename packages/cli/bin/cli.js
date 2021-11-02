#!/usr/bin/env node

const {program} = require('commander')
const inquirer = require('inquirer')
const fuzzyPathPlugin = require('inquirer-fuzzy-path')
const path = require('path')

const {doEnhance, generateApi} = require(path.resolve(__dirname, '../dist/index.js'))

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
    .command("enhance")
    .usage("[options]")
    .action(() => {
        doEnhance()
    })

program.parse(process.argv).opts()
