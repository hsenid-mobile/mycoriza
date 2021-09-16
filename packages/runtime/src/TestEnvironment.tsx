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

export interface HookStub {
  configure(api: MiddlewareAPI<Dispatch<NetworkAction<unknown>>>, next: Dispatch<NetworkAction<unknown>>): void
}

export class TypedHookStub<RootState, T> implements HookStub {
  private api?: MiddlewareAPI<Dispatch<NetworkAction<T>>, RootState>
  private domain: string;
  private selector: (state: RootState) => NetworkStateFamily<T>;

  constructor(domain: string, selector: (state: RootState) => NetworkStateFamily<T>) {
    this.domain = domain;
    this.selector = selector;
  }

  configure(api: MiddlewareAPI<Dispatch<NetworkAction<T>>>) {
    this.api = api
  }

  currentState(entityKey: string = "default") {
    if (!this.api) throw "Tester is not configured in the test environment"
    return resolveFamily(entityKey, this.selector(this.api.getState()))
  }

  reset(entityKey: string = "default") {
    const action: NetworkResetAction<T> = {
      type: resetKey(this.domain, entityKey)
    }
    this.api?.dispatch(action)
  }

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

  toSuccessState(data: T, entityKey: string = "default") {
    const action: NetworkSuccessAction<T> = {
      type: successKey(this.domain, entityKey),
      payload: {
        data
      }
    }
    this.api?.dispatch(action)
  }

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

export interface TestStoreProps<T> {
  rootReducer: Reducer<T>,
  stubs: HookStub[],
  middlewares?: Middleware[]
}

export function testStore<T>({stubs, rootReducer, middlewares}: TestStoreProps<T>) {
  return createStore(rootReducer, applyMiddleware(mycorizaTestingMiddleware(stubs), ...middlewares ?? []))
}
