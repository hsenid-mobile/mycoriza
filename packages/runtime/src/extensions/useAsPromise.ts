import {useEffect, useState} from "react";
import {isError, isSuccess, MycorizaHookResultType} from "../engine";

interface PromiseCallback<T> {
  resolve(t: T): void
  reject(e: any): void
}


/**
 * Converts promise function from network state hook
 * @param data result of a network hook
 * @example
 * ```
 * function MyComponent() {
 *   const fetchData = useAsPromise(useDataAsNetworkState());
 *
 *   useEffect(() => {
 *     fetchData().then(data => {
 *       //Do on data
 *     }).catch(e => {
 *       //Do on error
 *     })
 *   }, [])
 * }
 * ```
 */
export function useAsPromise<T, F extends (...args: any) => void>(data: MycorizaHookResultType<T, F>): (...args: Parameters<F>) => Promise<T> {

  let [state, fun] = data

  let [callback, setCallback] = useState<PromiseCallback<T>>();

  useEffect(() => {
    if (isSuccess(state)) {
      callback?.resolve(state.data)
    } else if (isError(state)) {
      callback?.reject(state.error)
    }
  }, [state.state])

  return args => new Promise<T>((resolve, reject) => {
    fun(args)
    setCallback({ resolve, reject })
  })
}
