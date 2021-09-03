import Handlebars from "handlebars";
import fs from "fs";
import {OpenAPIV3} from "openapi-types";
import userName from 'git-user-name'
import {format} from 'date-fns'

const template = `
{{#if logoUrl}}
<div style="text-align: center">
<img src="{{server}}{{logoUrl}}" width="100" alt=""/>
</div>
{{/if}}

# _{{title}}_ <sup style="background-color:green;color:white;padding:5px;border-radius:20px;font-size:small">_{{version}}_</sup>
<small><a href="{{url}}" target="_blank">{{url}}</a></small>

This documentation contains the information about the API generated using **mycoriza network integration tool**.
The documentation can be discovered using following link.

* [modules](./modules.html)

---
<small>
API generated {{date}}{{#if user}}, by {{user}} {{/if}}
</small>
`

export function addTypedocReadme(openApi: OpenAPIV3.Document<any>, mycoriza: any) {
    let content = Handlebars.compile(template)({
        title: openApi.info.title,
        version: openApi.info.version,
        logoUrl: openApi.info["x-logo"]?.url,
        server: openApi.servers[0]?.url,
        user: userName(),
        date: format(new Date(), "do LLLL, yyyy, hh:mm aaa"),
        url: mycoriza.specUrl
    });

    if (fs.existsSync("./API_INFO.md")) {
        fs.unlinkSync("./API_INFO.md")
    }
    fs.writeFileSync("./API_INFO.md", content)
}
