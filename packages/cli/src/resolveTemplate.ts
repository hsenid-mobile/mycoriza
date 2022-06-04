import Handlebars from "handlebars";
import fs from "fs";

//applies handlebars template by path with the given context
export function applyTemplate(path: string, context: any) {
    let template = Handlebars.compile(fs.readFileSync(`${__dirname}/../templates/${path}`).toString());
    return template(context);
}
