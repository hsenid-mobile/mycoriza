import {isSuccess, MycorizaHookResultType} from "../engine";
import {useEffect, useState} from "react";

/**
 * Unwraps network state in the result to a nullable value.
 *
 * If the state is success the value is returned else null is returned.
 * @param data result of a network hook.
 * @example
 * ```jsx
 * function MyComponent() {
 *   const [value, fetch, cleanup] = useAsNullable(useGeneratedHook())
 *
 *   //value is in type T? instead of NetworkState<T>
 *   return <>{value?.myProperty}</>
 * }
 * ```
 */
export function useAsNullable<T, F extends (...args: any) => void>(data: MycorizaHookResultType<T, F>): [T | undefined, F, () => void] {
  let [networkState, fetch, clean] = data
  let [state, setState] = useState<T>();

  useEffect(() => {
    if (isSuccess(networkState)) {
      setState(networkState.data)
    } else {
      setState(undefined)
    }
  }, [networkState])

  return [state, fetch, clean]
}
