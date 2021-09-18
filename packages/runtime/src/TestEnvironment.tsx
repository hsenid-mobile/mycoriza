/**
 * @module test
 */
import {applyMiddleware, createStore, Dispatch, Middleware, MiddlewareAPI, Reducer,} from "redux";
import {
  errorKey,
  NetworkAction,
  NetworkFailAction,
  NetworkPendingAction,
  NetworkResetAction,
  NetworkStateFamily,
  NetworkSuccessAction,
  pendingKey,
  resetKey,
  resolveFamily,
  successKey
} from "./engine";

/**
 * Stub for generated hooks
 */
export interface HookStub {
  configure(api: MiddlewareAPI<Dispatch<NetworkAction<unknown>>>, next: Dispatch<NetworkAction<unknown>>): void
}

/**
 * This stub provides the necessary functionalities to interact with a saved network state. The instance
 * is created along side the generated hooks in api generation.
 */
export class TypedHookStub<RootState, T> implements HookStub {
  private api?: MiddlewareAPI<Dispatch<NetworkAction<T>>, RootState>
  private domain: string;
  private selector: (state: RootState) => NetworkStateFamily<T>;

  /**
   *
   * @param domain
   * @param selector
   */
  constructor(domain: string, selector: (state: RootState) => NetworkStateFamily<T>) {
    this.domain = domain;
    this.selector = selector;
  }

  /**
   * This is the integration point of the test redux store. Upon integration, this method
   * is invoked to provide the redux context.
   * @internal
   * @param api
   */
  configure(api: MiddlewareAPI<Dispatch<NetworkAction<T>>>) {
    this.api = api
  }

  /**
   * This method provides the current state of the given network state.
   *
   * @param entityKey is used to identify individual entities.
   */
  currentState(entityKey: string = "default") {
    if (!this.api) throw "Tester is not configured in the test environment"
    return resolveFamily(entityKey, this.selector(this.api.getState()))
  }

  /**
   * Resets the network state to init state.
   *
   * @param entityKey is used to identify individual entities.
   */
  reset(entityKey: string = "default") {
    const action: NetworkResetAction<T> = {
      type: resetKey(this.domain, entityKey)
    }
    this.api?.dispatch(action)
  }

  /**
   * Sends the network state to pending state.
   *
   * @param entityKey is used to identify individual entities.
   */
  toPendingState(entityKey: string = "default") {
    const action: NetworkPendingAction<T> = {
      type: pendingKey(this.domain, entityKey),
      payload: {
        request: {
          url: '',
          data: '',
          headers: '',
          method: 'get'
        }
      }
    }
    this.api?.dispatch(action)
  }

  /**
   * Sends the network state to success state and attaches the given data as the success data.
   *
   * @param data success data.
   * @param entityKey is used to identify individual entities.
   */
  toSuccessState(data: T, entityKey: string = "default") {
    const action: NetworkSuccessAction<T> = {
      type: successKey(this.domain, entityKey),
      payload: {
        data
      }
    }
    this.api?.dispatch(action)
  }

  /**
   * Sends the network state to error state.
   *
   * @param error emulated error.
   * @param entityKey is used to identify individual entities.
   */
  toErrorState(error: any, entityKey: string = "default") {
    const action: NetworkFailAction<T> = {
      type: errorKey(this.domain, entityKey),
      error
    }
    this.api?.dispatch(action)
  }
}

function mycorizaTestingMiddleware(testers: HookStub[]): Middleware {
  return api => next => {
    testers.forEach(tester => tester.configure(api, next))
    return action => {
      return next({...action, type: action.type ?? action.types[0]});
    };
  }
}

/**
 * @ignore
 */
export interface TestStoreProps<T> {
  rootReducer: Reducer<T>,
  stubs: HookStub[],
  middlewares?: Middleware[]
}

/**
 * Creates the store for testing.
 *
 * @param stubs instances of the `TypedHookStub` which are attached to the store.
 * @param rootReducer root reducer instance for the application.
 * @param middlewares external middlewares, Please avoid adding async middlewares like `thunk middleware` and `redux-axios-middleware`
 */
export function testStore<T>({stubs, rootReducer, middlewares}: TestStoreProps<T>) {
  return createStore(rootReducer, applyMiddleware(mycorizaTestingMiddleware(stubs), ...middlewares ?? []))
}
