import {Action, Reducer} from "redux";
import format from "string-format";

// @ts-ignore
export interface NetworkAction<T> extends Action {}

export interface NetworkPendingAction<T> extends NetworkAction<T> {
  readonly type: string;
  readonly payload: {
    request: {
      method: "get" | "post" | "put" | "delete";
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
  return `${format(url, params.path ?? {})}${queryString ? `?${encodeURIComponent(queryString)}` : ""}`
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
 *                 ┌──────┐
 *   ┌─────────────► Init ◄────────────┐
 *   │             └▲────┬┘            │
 *   │              │    │             │
 *   │           Reset  Execute        │
 * Reset            │    │           Reset
 *   │           ┌──┴────┴──┐          │
 *   │      ┌────► Pending  ◄────┐     │
 *   │      │    └──┬────┬──┘    │     │
 *   │   Execute    │    │    Execute  │
 *   │      │       │    │       │     │
 *   │      │ OnSuccess OnError  │     │
 *   │ ┌────┴──┐    │    │    ┌──┴───┐ │
 *   └─┤Success◄────┘    └────►Error ├─┘
 *     └───────┘              └──────┘
 *
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
      let newState: ErrorState<T> = {
        state: "error",
        error: action.error,
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

export function pendingKey(domain: string, entityKey: string) {
  return `${domain}:${entityKey}`;
}

export function successKey(domain: string, entityKey: string) {
  return `${domain}_SUCCESS:${entityKey}`;
}

export function errorKey(domain: string, entityKey: string) {
  return `${domain}_FAIL:${entityKey}`;
}

export function resetKey(domain: string, entityKey: string) {
  return `${domain}_RESET:${entityKey}`;
}

/**
 * Issues a get request for the given url.
 * @param domain unique key to identify the call
 * @param entityKey
 * @param url rest endpoint
 * @param params query and path parameters for the request.
 * @constructor
 */
export function GET<Resp>(
  domain: string,
  entityKey: string,
  url: string,
  params: Params = {}
): NetworkFamilyPendingAction<Resp> {
  return {
    type: undefined,
    types: [pendingKey(domain, entityKey), successKey(domain, entityKey), errorKey(domain, entityKey)],
    payload: {
      request: {
        method: "get",
        url: createUrl(url, params),
      },
    },
    family: entityKey
  };
}

/**
 * Issues a post request for the given url.
 * @param domain unique key to identify the call
 * @param entityKey
 * @param url rest endpoint
 * @param body request body
 * @param params query and path parameters for the request.
 * @constructor
 */
export function POST<Req, Resp>(
  domain: string,
  entityKey: string,
  url: string,
  body: Req,
  params: Params = {}
): NetworkFamilyPendingAction<Resp> {
  return {
    type: undefined,
    types: [pendingKey(domain, entityKey), successKey(domain, entityKey), errorKey(domain, entityKey)],
    payload: {
      request: {
        url: createUrl(url, params),
        method: "post",
        data: body,
      },
    },
    family: entityKey
  };
}

/**
 * Issues a put request for the given url.
 * @param domain unique key to identify the call
 * @param entityKey
 * @param url rest endpoint
 * @param body request body
 * @param params query and path parameters for the request.
 * @constructor
 */
export function PUT<Req, Resp>(
  domain: string,
  entityKey: string,
  url: string,
  body: Req,
  params: Params = {}
): NetworkFamilyPendingAction<Resp> {
  return {
    type: undefined,
    types: [pendingKey(domain, entityKey), successKey(domain, entityKey), errorKey(domain, entityKey)],
    payload: {
      request: {
        url: createUrl(url, params),
        method: "put",
        data: body,
      },
    },
    family: entityKey
  };
}

/**
 * Issues a dlete request for the given url.
 * @param domain unique key to identify the call
 * @param entityKey
 * @param url rest endpoint
 * @param params query and path parameters for the request.
 * @constructor
 */
export function DELETE<Resp>(
  domain: string,
  entityKey: string,
  url: string,
  params: Params = {}
): NetworkFamilyPendingAction<Resp> {
  return {
    type: undefined,
    types: [pendingKey(domain, entityKey), successKey(domain, entityKey), errorKey(domain, entityKey)],
    payload: {
      request: {
        method: "delete",
        url: createUrl(url, params),
      },
    },
    family: entityKey
  };
}

export interface NetworkFamilyResetAction<T> extends NetworkFamilyAction<T> {
  readonly type: string;
}

/**
 * Reset network state to init. Can be used as the cleanup.
 * @param domain unique key to identify the call
 * @param entityKey
 */
export function reset<Resp>(domain: string, entityKey: string): NetworkFamilyResetAction<Resp> {
  return {
    family: entityKey,
    type: resetKey(domain, entityKey)
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
 * @param entityKey
 * @param state
 */
export function resolveFamily<T>(entityKey: string, state: NetworkStateFamily<T>): NetworkState<T> {
  return state[entityKey] || initState()
}

export type MycorizaHookPropsContent<T,  F extends (...args: any) => void> = {
  entityKey: string,
  extend: MycorizaAspect<T, F>[]
}

export function resolveProps<T,  F extends (...args: any) => void>(props?: MycorizaPropsType<T, F>): MycorizaHookPropsContent<T, F> {
  if (!props) {
    return {
      entityKey: 'default',
      extend: []
    }
  } else if (typeof props === "string") {
    return {
      entityKey: props,
      extend: []
    }
  } else return {
    entityKey: props.entityKey ?? 'default',
    extend: props.extend ?? []
  };
}

export type MycorizaHookResultType<T,  F extends (...args: any) => void> = [NetworkState<T>, F, () => void]

export type MycorizaAspect<T,  F extends (...args: any) => void> = {
  useLogic(entry: MycorizaHookResultType<T, F>): MycorizaHookResultType<T, F>
}

export function useAspects<T,  F extends (...args: any) => void>(data: MycorizaHookResultType<T, F>, ...extensions: MycorizaAspect<T, F>[]): MycorizaHookResultType<T, F>{
  return extensions.reduce((a, b) => ({
    useLogic(entry: MycorizaHookResultType<T, F>): MycorizaHookResultType<T, F> {
      return b.useLogic(a.useLogic(entry))
    }
  })).useLogic(data)
}

export type MycorizaPropsType<T, F extends (...args: any) => void> = Partial<MycorizaHookPropsContent<T, F>> | string;

export type MycorizaHookType<T,  F extends (...args: any) => void> =
    (props: MycorizaPropsType<T, F>) => MycorizaHookResultType<T, F>
