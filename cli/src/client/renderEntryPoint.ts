import fs from 'fs'
import path from "path";
import beautify from 'xml-beautifier'

export function updateEntryPoint(entryPoint: string, storePath: string) {

    let lines = fs.readFileSync(entryPoint).toString().split('\n');

    let lastImportIndex = 0;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('import')) {
            lastImportIndex = i;
        }
    }

    lines.splice(lastImportIndex + 1, 0, "import {Provider} from 'react-redux';")
    lines.splice(lastImportIndex + 1, 0, `import {store} from './${path.relative(path.dirname(entryPoint), storePath)}/store';`)

    let file = lines.join('\n');
    let [, head, , content] = file.match('((.|[\n\r])*render\\()((.|[\n\r])*)');
    let [, startTag, tail] = content.match('<([^>]*)>((.|[\n\r])*)');

    let xml: string;
    if (startTag.endsWith('/')) {
        xml = `<${startTag}>`
    } else {
        let [, _xml, , _tail] = content.match(`^((.|[\n\r])*</${startTag}>)((.|[\n\r])*)`);
        xml = _xml
        tail = _tail
    }

    let fileContent = `${head}\n${beautify(`<Provider store={store}>${xml}</Provider>`)}${tail}`;

    fs.writeFileSync(entryPoint, fileContent)

}
