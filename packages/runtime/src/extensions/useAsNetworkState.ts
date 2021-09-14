import {useState} from "react";
import {ErrorState, MycorizaHookResultType, NetworkState, SuccessState} from "../engine";

/**
 * Converts promise generator function to network state result.
 * @param f promise generator function
 * @example
 * ```
 * function MyComponent() {
 *   const [state, execute] = useAsNetworkState(() => new Promise((resolve, reject) => { ... })
 *
 *   useEffect(() => {
 *     if(isSuccess(state)) {
 *       //do on success
 *     } else if (isError(state)) {
 *       //do on error
 *     }
 *   }, [state.state])
 *   return null;
 * }
 * ```
 */
export function useAsNetworkState<T>(f: (...args: any) => Promise<T>): MycorizaHookResultType<T, (...args: Parameters<typeof f>) => void> {
  let [state, setState] = useState<NetworkState<T>>({ state: "init"});

  return [
    state,
    args => {
      f(args).then(a => {
        let newState: SuccessState<T> = {state: "success", data: a};
        setState(newState);
        return a
      }).catch(e => {
        let newState: ErrorState<T> = {
          state: "error",
          error: e
        }
        setState(newState)
        return e
      });
      setState({state: "pending"})
    },
    () => {}
  ]
}
