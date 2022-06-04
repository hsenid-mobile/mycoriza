import fs from "fs";
import path from "path";
import {applyTemplate} from "../resolveTemplate";

export interface StarterSetupProps {
    output: string
    setupDir: string,
    devUrl: string
    prodUrl: string
}

export function generateStarterSetup({setupDir, output, devUrl, prodUrl}: StarterSetupProps) {
    if (!fs.existsSync(`${setupDir}`)) {
        fs.mkdirSync(`${setupDir}`)
    }

    let context = {
        generatedPath: path.relative(setupDir, output),
        baseUrl: devUrl,
        prodBaseUrl: prodUrl
    };
    let content = applyTemplate('src/store/store.ts.hbs', context);

    fs.writeFileSync(`${setupDir}/store.ts`, content)
}
