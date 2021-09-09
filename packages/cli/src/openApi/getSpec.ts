import { get as httpsGet } from 'https'
import { get as httpGet } from 'http'
import RefParser from 'json-schema-ref-parser'

async function readSpecFromHttps(url: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        let get = url.startsWith('https') ? httpsGet : httpGet;

        get(url, response => {
            let body = ''
            response.on('data', chunk => body += chunk)
            response.on('end', () => resolve(body))
            response.on('error', err => () => reject(`Could not read OpenApi spec: "${url}"`))
        })
    })
}

export async function getOpenApiSpec(input: string) {
    let response = await readSpecFromHttps(input);
    return await (RefParser as any).bundle(JSON.parse(response) as any)
}

