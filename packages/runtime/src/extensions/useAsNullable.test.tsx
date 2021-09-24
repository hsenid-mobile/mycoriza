import React from 'react'
import Enzyme from "enzyme";
import Adapter from '@wojtekmaj/enzyme-adapter-react-17'
import {
  isInit,
  MycorizaHookResultType,
  NetworkStateFamily,
  networkStateReducer,
  POST,
  reset,
  resolveFamily
} from "../engine";
import {Provider, useDispatch, useSelector} from "react-redux";
import {combineReducers} from "redux";
import {testStore, TypedHookStub} from "../TestEnvironment";
import {useAsNullable} from "./useAsNullable";

Enzyme.configure({adapter: new Adapter()})


function MockComponent() {
  let [data] = useAsNullable(useMockData());
  return <div className={'label'}>{data ?? 'No Value'}</div>;
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

describe('useAsNullable', () => {
  it('should follow correct values', function () {
    let mockTester = new TypedHookStub<TestRootState, string>('test', state => state.mockData)

    let wrapper = Enzyme.mount(<Provider store={testStore({
      rootReducer: rootReducer,
      stubs: [mockTester]
    })}>
      <MockComponent/>
    </Provider>);

    expect(isInit(mockTester.currentState())).toBeTruthy();
    expect(wrapper.find('.label').text()).toBe("No Value")
    wrapper = wrapper.setProps({})

    mockTester.toPendingState()
    wrapper = wrapper.setProps({})
    expect(wrapper.find('.label').text()).toBe("No Value")

    mockTester.toSuccessState("Test")
    wrapper = wrapper.setProps({})
    expect(wrapper.find('.label').text()).toBe("Test")

    mockTester.toErrorState("Test")
    wrapper = wrapper.setProps({})
    expect(wrapper.find('.label').text()).toBe("No Value")
  });
})
