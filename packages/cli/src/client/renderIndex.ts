import {ExportContent} from "../types";
import fs from 'fs'
import path from 'path'
import {applyTemplate} from "../resolveTemplate";

export function renderIndex(exportContents: ExportContent[]) {
  let indexPath = './src/index.ts';
  let context = {
    exportContents: exportContents.map(({exports, type, path: p}, index, arr) => ({
      type: type === 'type',
      path: `./${path.relative('./src', p).replace('.ts', '')}`,
      exports: exports.map((value) => {
        let count = 0
        for (let i = 0; i < index; i++) {
          if (arr[i].exports.includes(value)) count ++
        }
        if (count) return ({value: `${value} as ${value}${count}`})
        return ({value});
      })
    }))
  };

  let content = applyTemplate('src/index.ts.hbs', context);

  if (fs.existsSync(indexPath)) {
    fs.unlinkSync(indexPath)
  }
  fs.writeFileSync(indexPath, content)
}
