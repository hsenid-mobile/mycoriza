import Handlebars from "handlebars";
import fs from "fs";
import {OpenAPIV3} from "openapi-types";

const template = `
{
  "exclude": "**/*+(reducers)/**/index.ts",
  "mergeModulesMergeMode": "module",
  "mergeModulesRenameDefaults": true,
  "excludeNotDocumented": false,
  "excludeExternals": false,
  "readme": "./API_INFO.md",
  "pretty": true,
  "name": "{{title}} ({{version}})"
}

`

export function addTypedocConfig(openApi: OpenAPIV3.Document<any>) {
    let content = Handlebars.compile(template)({
        title: openApi.info.title,
        version: openApi.info.version
    });

    if (!fs.existsSync("./typedoc.json")) {
        fs.writeFileSync("./typedoc.json", content)
    }
}
