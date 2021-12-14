
import {combineReducers, ReducersMapObject} from 'redux'

/**
 * @ignore
 */
export type MycorizaState<T> = {

} & T

export function mycorizaMapObject<T>(reducers: ReducersMapObject<T>): ReducersMapObject<MycorizaState<T>> {
    return {
        ...reducers
    } as any
}

/**
 * @ignore
 * Generates a mycoriza generated state empowered redux state.
 *
 * @param reducers
 */
export function mycorizaState<T>(reducers: ReducersMapObject<T>) {
    return combineReducers< MycorizaState<T>>(mycorizaMapObject(reducers))
}

export function baseUrl() {
    return process.env.API_URL ?? (!process.env.NODE_ENV || process.env.NODE_ENV === 'development' ? '' : '')
}
