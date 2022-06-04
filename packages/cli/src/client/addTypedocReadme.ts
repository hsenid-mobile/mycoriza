import fs from "fs";
import {OpenAPIV3} from "openapi-types";
import userName from 'git-user-name'
import {format} from 'date-fns'
import {applyTemplate} from "../resolveTemplate";

export function addTypedocReadme(openApi: OpenAPIV3.Document<any>, mycoriza: any) {
    let context = {
        title: openApi.info.title,
        version: openApi.info.version,
        logoUrl: openApi.info["x-logo"]?.url,
        server: openApi.servers?.[0]?.url,
        user: userName(),
        date: format(new Date(), "do LLLL, yyyy, hh:mm aaa"),
        url: mycoriza.specUrl
    };
    let content = applyTemplate(`docs/API_INFO.md.hbs`, context);

    if (!fs.existsSync("./docs")) {
        fs.mkdirSync("./docs")
    }

    if (fs.existsSync("./docs/API_INFO.md")) {
        fs.unlinkSync("./docs/API_INFO.md")
    }
    fs.writeFileSync("./docs/API_INFO.md", content)
}
