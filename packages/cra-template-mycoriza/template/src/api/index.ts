
import {combineReducers, ReducersMapObject} from "redux";

export type MycorizaState<T> = {
} & T

export function mycorizaMapObject<T>(reducers: ReducersMapObject<T>): ReducersMapObject<MycorizaState<T>> {
    return {
        ...reducers
    } as any
}

export function mycorizaState<T>(reducers: ReducersMapObject<T>) {
    return combineReducers<MycorizaState<T>>(mycorizaMapObject(reducers))
}
