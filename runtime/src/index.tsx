import {Action, Reducer} from "redux";
import format from "string-format";
import {useEffect, useState} from "react";

// @ts-ignore
export interface NetworkAction<T> extends Action {}

export interface NetworkPendingAction<T> extends NetworkAction<T> {
  readonly type: string;
  readonly payload: {
    request: {
      method: "get" | "post";
      url: string;
      data?: any;
      headers?: any
    };
  };
}

export interface PathParams {
  [key: string]: any
}

export interface QueryParams {
  [key: string]: any
}

export interface Headers {
  [key: string]: any
}

export interface Params {
  path?: PathParams
  query?: QueryParams,
  headers?: Headers
}

function createUrl(url: string, params: Params): string {
  let queryString: string | undefined = !!params.query ? Object.entries(params.query).map(([key,value]) => `${key}=${encodeURIComponent(value)}`).join('&') : undefined
  return `${format(url, params.path ?? {})}${queryString ? `?${queryString}` : ""}`
}

export function isPendingAction<T>(
  action: NetworkAction<T>,
  domain: string
): action is NetworkPendingAction<T> {
  return action.type === domain;
}

export interface NetworkSuccessAction<T> extends NetworkAction<T> {
  readonly type: string;
  readonly payload: {
    data: T;
  };
}

export function isSuccessAction<T>(
  action: NetworkAction<T>,
  domain: string
): action is NetworkSuccessAction<T> {
  return action.type === `${domain}_SUCCESS`;
}

export interface NetworkFailAction<T> extends NetworkAction<T> {
  readonly type: string;
  readonly error: {
    data: string;
  };
}

export function isFailAction<T>(
  action: NetworkAction<T>,
  domain: string
): action is NetworkFailAction<T> {
  return action.type === `${domain}_FAIL`;
}

/**
 * State of an asynchronous call. Network state follows the state diagram given below.
 *
 *
 * <pre>
   *               ┌────┐
   *   ┌───────────►Init◄──────────┐
   *   │           └▲──┬┘          │
   *   │       Reset│  │Execute    │
   * Reset          │  │         Reset
   *   │          ┌─┴──▼──┐        │
   *   │      ┌───┤Pending├──┐     │
   *   │      │   └───────┘  │     │
   *   │    OnSuccess    OnError   │
   *   │      │              │     │
   *   │  ┌───▼───┐       ┌──▼──┐  │
   *   └──┤Success│       │Error├──┘
   *      └───────┘       └─────┘
 * </pre>
 */
// @ts-ignore
export interface NetworkState<T> {
  state: "init" | "pending" | "success" | "error";
}

/**
 * Network call is not yet started
 */
export interface InitState<T> extends NetworkState<T> {
  state: "init";
}

/**
 * Checks whether the state is init state
 * @param state
 */
export function isInit<T>(state: NetworkState<T>): state is InitState<T> {
  return state.state === "init";
}

/**
 * Network call is not yet completed
 */
export interface PendingState<T> extends NetworkState<T> {
  state: "pending";
}

/**
 * Checks whether the state is pending state
 * @param state
 */
export function isPending<T>(state: NetworkState<T>): state is PendingState<T> {
  return state.state === "pending";
}

/**
 * Network call is completed with success state
 */
export interface SuccessState<T> extends NetworkState<T> {
  state: "success";
  data: T;
}

/**
 * Checks whether the state is success response
 * @param state
 */
export function isSuccess<T>(state: NetworkState<T>): state is SuccessState<T> {
  return state.state === "success";
}

/**
 * Network call is completed with error response
 */
export interface ErrorState<T> extends NetworkState<T> {
  state: "error";
  error: any;
  statusCode?: string
}

/**
 * Checks whether the state is error state
 * @param state
 */
export function isError<T>(state: NetworkState<T>): state is ErrorState<T> {
  return state.state === "error";
}

export interface NetworkResetAction<T> extends NetworkAction<T> {
  readonly type: string
}

export function isResetAction<T>(action: NetworkAction<T>, domain: string): action is NetworkResetAction<any> {
  return action.type == `${domain}_RESET`
}

export function error<T>(domain: string, error: any): NetworkFailAction<T> {
  return {
    type: domain,
    error
  }
}

function initState<T>(): NetworkState<T> {
  return {
    state: "init",
  };
}

function _networkStateReducer<T>(
  domain: string
): Reducer<NetworkState<T>, NetworkAction<T>> {
  return (state = initState(), action) => {
    if (isPendingAction(action, domain)) {
      let newState: PendingState<T> = {
        state: "pending",
      };
      return newState;
    } else if (isSuccessAction(action, domain)) {
      let newState: SuccessState<T> = {
        state: "success",
        data: action.payload.data as T,
      };
      return newState;
    } else if (isFailAction(action, domain)) {
      console.log(action.error)
      let newState: ErrorState<T> = {
        state: "error",
        error: action.error.data,
        statusCode: (action.error as any)?.response?.status?.toString()
      };
      return newState;
    } else if (isResetAction(action, domain)) {
      return initState()
    }

    return state;
  };
}

// @ts-ignore
export interface NetworkFamilyAction<T> extends Action {
  readonly family: string
}

export interface NetworkFamilyPendingAction<T> extends NetworkFamilyAction<T> {
  readonly types: [string, string, string]
  readonly payload: {
    request: {
      method: "get" | "post" | "put" | "delete";
      url: string;
      data?: any;
    };
  };
}

/**
 * Issues a get request for the given url.
 * @param domain unique key to identify the call
 * @param familyKey
 * @param url rest endpoint
 * @param params query and path parameters for the request.
 * @constructor
 */
export function GET<Resp>(
  domain: string,
  familyKey: string,
  url: string,
  params: Params = {}
): NetworkFamilyPendingAction<Resp> {
  return {
    type: undefined,
    types: [`${domain}:${familyKey}`, `${domain}_SUCCESS:${familyKey}`, `${domain}_FAIL:${familyKey}`],
    payload: {
      request: {
        method: "get",
        url: createUrl(url, params),
      },
    },
    family: familyKey
  };
}

/**
 * Issues a post request for the given url.
 * @param domain unique key to identify the call
 * @param familyKey
 * @param url rest endpoint
 * @param body request body
 * @param params query and path parameters for the request.
 * @constructor
 */
export function POST<Req, Resp>(
  domain: string,
  familyKey: string,
  url: string,
  body: Req,
  params: Params = {}
): NetworkFamilyPendingAction<Resp> {
  return {
    type: undefined,
    types: [`${domain}:${familyKey}`, `${domain}_SUCCESS:${familyKey}`, `${domain}_FAIL:${familyKey}`],
    payload: {
      request: {
        url: createUrl(url, params),
        method: "post",
        data: body,
      },
    },
    family: familyKey
  };
}

/**
 * Issues a put request for the given url.
 * @param domain unique key to identify the call
 * @param familyKey
 * @param url rest endpoint
 * @param body request body
 * @param params query and path parameters for the request.
 * @constructor
 */
export function PUT<Req, Resp>(
  domain: string,
  familyKey: string,
  url: string,
  body: Req,
  params: Params = {}
): NetworkFamilyPendingAction<Resp> {
  return {
    type: undefined,
    types: [`${domain}:${familyKey}`, `${domain}_SUCCESS:${familyKey}`, `${domain}_FAIL:${familyKey}`],
    payload: {
      request: {
        url: createUrl(url, params),
        method: "post",
        data: body,
      },
    },
    family: familyKey
  };
}

/**
 * Issues a dlete request for the given url.
 * @param domain unique key to identify the call
 * @param familyKey
 * @param url rest endpoint
 * @param params query and path parameters for the request.
 * @constructor
 */
export function DELETE<Resp>(
  domain: string,
  familyKey: string,
  url: string,
  params: Params = {}
): NetworkFamilyPendingAction<Resp> {
  return {
    type: undefined,
    types: [`${domain}:${familyKey}`, `${domain}_SUCCESS:${familyKey}`, `${domain}_FAIL:${familyKey}`],
    payload: {
      request: {
        method: "delete",
        url: createUrl(url, params),
      },
    },
    family: familyKey
  };
}

export interface NetworkFamilyResetAction<T> extends NetworkFamilyAction<T> {
  readonly type: string;
}

/**
 * Reset network state to init. Can be used as the cleanup.
 * @param domain unique key to identify the call
 * @param familyKey
 */
export function reset<Resp>(domain: string, familyKey: string): NetworkFamilyResetAction<Resp> {
  return {
    family: familyKey,
    type: `${domain}_RESET:${familyKey}`
  }
}

export interface NetworkStateFamily<T> {
  [k: string]: NetworkState<T>
}

/**
 * Creates a redux reducer executing a network call.
 * @param domain unique key to identify the call
 */
export function networkStateReducer<T>(domain: string): Reducer<NetworkStateFamily<T>, NetworkFamilyAction<T>> {
  let reducer = _networkStateReducer<T>(domain);
  return (state = {}, action) => {
    if (action.type.startsWith(domain)) {
      let [type, family] = action.type.split(":")
      return {
        ...state,
        [family]: reducer(state[family] || initState<T>(), {
          ...action,
          type
        })
      };
    } else return state
  }
}

/**
 * Unwraps network family to individual <code>NetworkState</code>
 * @param familyKey
 * @param state
 */
export function resolveFamily<T>(familyKey: string, state: NetworkStateFamily<T>): NetworkState<T> {
  return state[familyKey] || initState()
}

interface PromiseCallback<T> {
  resolve(t: T): void
  reject(e: any): void
}

type MycorizaHookResultType<T,  F extends (...args: any) => void> = [NetworkState<T>, F, () => void]

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
 * }
 * ```
 */
export function useAsNetworkState<T>(f: (...args: any) => Promise<T>): MycorizaHookResultType<T, (...args: Parameters<typeof f>) => void> {
  let [state, setState] = useState<NetworkState<T>>({ state: "init"});

  return [
    state,
    args => f(args).then(a => {
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
    }),
    () => {}
  ]
}

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
export function useWithoutPending<T, F extends (...args: any) => void>(data: MycorizaHookResultType<T, F>): [NetworkState<T>, F, () => void] {
  let [value, setValue] = useState<NetworkState<T>>(data[0]);

  useEffect(() => {
    if (!isPending(data[0])) {
      setValue(data[0])
    }
  }, [data[0].state])

  return [value, data[1], data[2]]
}

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
    data[1](params)
  }, [])
  return data;
}

export function useDebounce<T, F extends (...args: any) => void>(data: MycorizaHookResultType<T, F>, delay: number): MycorizaHookResultType<T, F> {

  let [params, setParams] = useState<Parameters<typeof data[1]>>();
  let [debouncedParams, setDebouncedParams] = useState<Parameters<typeof data[1]>>();

  useEffect(() => {
    let timeout = setTimeout(() => setDebouncedParams(params), delay);
    return () => clearTimeout(timeout)
  }, [params])

  useEffect(() => {
    if (debouncedParams) {
      data[1](debouncedParams)
    }
  }, [debouncedParams])

  return [
    data[0],
    ((...args: Parameters<typeof data[1]>) => setParams(args)) as F,
    data[2]
  ]
}
