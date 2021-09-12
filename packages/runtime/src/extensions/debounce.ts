import {useEffect, useState} from "react";
import {MycorizaAspect, MycorizaHookResultType} from "../engine";

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
      data[1].apply(null, debouncedParams)
    }
  }, [debouncedParams])

  return [
    data[0],
    ((...args: Parameters<typeof data[1]>) => setParams(args)) as F,
    data[2]
  ]
}

export function debounce<T, F extends (...args: any) => void>(delay: number): MycorizaAspect<T, F> {
  return {
    useLogic([state, fetch, cleanup]: MycorizaHookResultType<T, F>): MycorizaHookResultType<T, F> {
      let [params, setParams] = useState<Parameters<F>>();
      let [debouncedParams, setDebouncedParams] = useState<Parameters<F>>();

      useEffect(() => {
        let timeout = setTimeout(() => {
          setDebouncedParams(params)
        }, delay);
        return () => clearTimeout(timeout)
      }, [params])

      useEffect(() => {
        if (debouncedParams) {
          fetch.apply(null, debouncedParams)
        }
      }, [debouncedParams])

      return [
        state,
        ((...args: Parameters<F>) => setParams(args)) as F,
        cleanup
      ];
    }
  }
}
