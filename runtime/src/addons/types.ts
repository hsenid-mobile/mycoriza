import {NetworkState} from "../engine";

export type MycorizaHookResultType<T,  F extends (...args: any) => void> = [NetworkState<T>, F, () => void]
