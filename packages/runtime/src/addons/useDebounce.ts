import {useEffect, useState} from "react";
import {MycorizaHookResultType} from "./types";

/**
 *
 * @param data
 * @param delay
 */
export function useDebounce<T, F extends (...args: any) => void>(data: MycorizaHookResultType<T, F>, delay: number): MycorizaHookResultType<T, F> {

  let [params, setParams] = useState<Parameters<typeof data[1]>>();
  let [debouncedParams, setDebouncedParams] = useState<Parameters<typeof data[1]>>();

  useEffect(() => {
    let timeout = setTimeout(() => {
      setDebouncedParams(params)
    }, delay);
    return () => clearTimeout(timeout)
  }, [params])

  useEffect(() => {
    if (debouncedParams) {
      data[1](...debouncedParams)
    }
  }, [debouncedParams])

  return [
    data[0],
    ((...args: Parameters<typeof data[1]>) => setParams(args)) as F,
    data[2]
  ]
}
