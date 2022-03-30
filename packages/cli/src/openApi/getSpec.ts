import { get as httpsGet } from 'https'
import { get as httpGet } from 'http'
import RefParser from 'json-schema-ref-parser'
import {OpenAPIV3} from "openapi-types";
import {MycorizaConfig} from "../types";

async function readSpecFromHttps(url: string, config: MycorizaConfig): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        let get = url.startsWith('https') ? httpsGet : httpGet;

        get(url, {rejectUnauthorized: config.rejectUnauthorized ?? true}, response => {
            let body = ''
            response.on('data', chunk => body += chunk)
            response.on('end', () => resolve(body))
            response.on('error', err => () => reject(`Could not read OpenApi spec: "${url}"`))
        })
    })
}

export async function getOpenApiSpec(input: string, config: MycorizaConfig): Promise<OpenAPIV3.Document> {
    let response = await readSpecFromHttps(input, config);
    return await (RefParser as any).bundle(JSON.parse(response) as any)
}

