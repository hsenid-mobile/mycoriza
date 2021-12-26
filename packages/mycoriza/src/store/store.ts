
import axios from 'axios'
import axiosMiddleware from "redux-axios-middleware";
import {applyMiddleware, createStore, Middleware} from 'redux'
import {mycorizaState} from "../api";

export const axiosInstance = axios.create({
    responseType: "json"
})

const backendConnectorMiddleware = axiosMiddleware(
    axiosInstance
)

export interface RootState {}

const rootState = mycorizaState({})

export function store(...middlewares: Middleware[]) {
    return createStore(rootState, applyMiddleware(backendConnectorMiddleware, ...middlewares));
}
