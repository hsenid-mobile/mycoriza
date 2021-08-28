import fs from "fs";
import path from "path";
import Handlebars from "handlebars";

const template=`
import axios from 'axios'
import axiosMiddleware from "redux-axios-middleware";
import {applyMiddleware, createStore} from 'redux'
import {mycorizaState, MycorizaState} from "{{generatedPath}}/reducers";

export const axiosInstance = axios.create({
    baseURL: process.env.API_URL ?? (!process.env.NODE_ENV || process.env.NODE_ENV === 'development' ? '{{baseUrl}}' : '{{prodBaseUrl}}'),
    responseType: "json"
})

const backendConnectorMiddleware = axiosMiddleware(
    axiosInstance
)

export type RootState = MycorizaState<{}>

const rootState = mycorizaState({})

export const store = createStore(rootState, applyMiddleware(backendConnectorMiddleware))
`

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

    let content = Handlebars.compile(template)({
        generatedPath: path.relative(setupDir, output),
        baseUrl: devUrl,
        prodBaseUrl: prodUrl
    });

    fs.writeFileSync(`${setupDir}/store.ts`, content)
}
