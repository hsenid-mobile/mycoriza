
import {combineReducers, ReducersMapObject} from 'redux'

/**
 * @ignore
 */
export type MycorizaState<T> = {

} & T

/**
 * @ignore
 * Generates a mycoriza generated state empowered redux state.
 *
 * @param reducers
 */
export function mycorizaState<T>(reducers: ReducersMapObject<T>) {
    return combineReducers< MycorizaState<T>>({
        ...reducers
    } as any)
}

export function baseUrl() {
    return process.env.API_URL ?? (!process.env.NODE_ENV || process.env.NODE_ENV === 'development' ? '' : '')
}
