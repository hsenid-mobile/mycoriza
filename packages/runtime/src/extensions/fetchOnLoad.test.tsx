import React from 'react';
import Enzyme from 'enzyme'
import Adapter from '@wojtekmaj/enzyme-adapter-react-17'
import {Provider, useDispatch, useSelector} from 'react-redux'
import {combineReducers} from 'redux'
import {testStore, TypedHookStub} from "../TestEnvironment";
import {
  isPending, isSuccess,
  MycorizaHookResultType,
  NetworkStateFamily,
  networkStateReducer,
  POST,
  reset,
  resolveFamily,
  useAspects
} from "../engine";
import {fetchOnLoad} from "./fetchOnLoad";

Enzyme.configure({adapter: new Adapter()})

function MockComponent() {
  useAspects(useMockData(), fetchOnLoad(""))
  return <></>;
}

interface TestRootState {
  mockData: NetworkStateFamily<string>
}

export function useMockData(entityKey: string = "default"):
  MycorizaHookResultType<string, (value: string) => void> {
  let dispatch = useDispatch();

  function execute(managedBrand: string) {
    dispatch(POST("test", entityKey, "/test/url", managedBrand))
  }

  return [
    resolveFamily(entityKey, useSelector<TestRootState, NetworkStateFamily<string>>(state => state.mockData)),
    execute,
    () => dispatch(reset("test", entityKey))
  ]
}

let rootReducer = combineReducers<TestRootState>({
  mockData: networkStateReducer<string>('test')
});

describe("fetchOnLoad", () => {

  it('should load the content upon loading', function () {

    let mockTester = new TypedHookStub<TestRootState, string>("test", state => state.mockData)
    Enzyme.mount(<Provider store={testStore({
      rootReducer: rootReducer,
      stubs: [mockTester]
    })}>
      <MockComponent/>
    </Provider>)

    expect(isPending(mockTester.currentState())).toBeTruthy()
    mockTester.toSuccessState("Test")
    expect(isSuccess(mockTester.currentState())).toBeTruthy()
  });
})
