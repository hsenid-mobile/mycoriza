import fs from "fs";
import {ExportContent} from "../types";
import {applyTemplate} from "../resolveTemplate";


export function addTypedocConfig(exportContents: ExportContent[]) {
    let context = {
        entryPoints: exportContents
    };
    let content = applyTemplate(`typedoc.json.hbs`, context);
    //Handlebars.compile(template)(context);

    if (fs.existsSync("./typedoc.json")) {
        fs.unlinkSync("./typedoc.json")
    }
    fs.writeFileSync("./typedoc.json", content)
}
