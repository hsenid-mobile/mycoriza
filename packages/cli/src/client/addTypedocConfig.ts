import Handlebars from "handlebars";
import fs from "fs";
import {OpenAPIV3} from "openapi-types";
import {ExportContent} from "../types";

const template = `
{
  "excludeNotDocumented": false,
  "excludeExternals": false,
  "pretty": true,
  "name": "Mycoriza generated typedoc",
  "out": "./docs/api",
  "entryPoints": [
  {{#each entryPoints}}
    {{#if @last}}
    "{{path}}"
    {{else}}
    "{{path}}", 
    {{/if}}
  {{/each}}
  ],
  "entryPointStrategy": "Resolve",
  "tsconfig": "./tsconfig.json"
}
`

export function addTypedocConfig(exportContents: ExportContent[]) {
    let content = Handlebars.compile(template)({
        entryPoints: exportContents
    });

    if (!fs.existsSync("./typedoc.json")) {
        fs.unlinkSync("./typedoc.json")
    }
    fs.writeFileSync("./typedoc.json", content)
}
