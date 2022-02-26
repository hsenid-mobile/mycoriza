
import type { PetstoreState } from './petstore/reducers'
import { petstoreReducers } from './petstore/reducers'
import {combineReducers, ReducersMapObject} from "redux";

export type MycorizaState<T> = {
    petstore: PetstoreState
} & T

export function mycorizaMapObject<T>(reducers: ReducersMapObject<T>): ReducersMapObject<MycorizaState<T>> {
    return {
            petstore: petstoreReducers,
        ...reducers
    } as any
}

export function mycorizaState<T>(reducers: ReducersMapObject<T>) {
    return combineReducers<MycorizaState<T>>(mycorizaMapObject(reducers))
}
