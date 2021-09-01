import {useEffect, useState} from "react";
import {isInit, isPending, NetworkState} from "../engine";
import {MycorizaHookResultType} from "./types";

/**
 * Get rids of the intermediate pending states for a smooth transition support.
 *
 * @param data Mycoriza hook result.
 * @example
 * ```
 * function MyComponent() {
 *   const [state, execute] = useWithoutPending(useDataAsNetworkState())
 *
 *   useEffect(() => {
 *     if(isSuccess(state)) {
 *       //do on success
 *     } else if (isError(state)) {
 *       //do on error
 *     }
 *   }, [state.state])
 * }
 * ```
 */
export function useWithoutPending<T, F extends (...args: any) => void>(data: MycorizaHookResultType<T, F>): MycorizaHookResultType<T, F> {
  let [value, setValue] = useState<NetworkState<T>>({state: "init"});

  useEffect(() => {
    if (isInit(value)) {
      setValue(data[0])
    }
    if (!isPending(data[0])) {
      setValue(data[0])
    }
  }, [data[0].state])

  return [value ?? {state: "init"}, data[1], data[2]]
}
