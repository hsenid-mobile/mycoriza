import {useEffect} from "react";
import {MycorizaAspect, MycorizaHookResultType} from "../engine";

/**
 * Executes the fetch call upon component load. Highly recommend using `useEager` instead if manual `useEffect` in favor of future optimizations.
 * @param data Mycoriza hook result.
 * @param params parameters for the network function.
 * @example
 * ```
 * function MyComponent() {
 *   //Assuming the network request param format is `{ id: string }`
 *   const [state, execute] = useEager(useDataAsNetworkState(), {id: ""})
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
export function useEager<T, F extends (...args: any) => void>(data: MycorizaHookResultType<T, F>, ...params: Parameters<F>): MycorizaHookResultType<T, F> {
  useEffect(() => {
    data[1].apply(null, params)
  }, [])
  return data;
}

export function fetchOnLoad<T, F extends (...args: any) => void>(...params: Parameters<F>): MycorizaAspect<T, F> {
  return {
    useLogic([state, fetch, cleanup]: MycorizaHookResultType<T, F>): MycorizaHookResultType<T, F> {
      useEffect(() => {
        fetch.apply(null, params)
      }, [])
      return [state, fetch, cleanup]
    }
  }
}
