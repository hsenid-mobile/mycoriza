import {act, renderHook} from "@testing-library/react-hooks";
import {useAsPromise} from "./useAsPromise";
import {useMockHook} from "./context.test";

describe("useAsPromise", () => {
  it('should generate promise which converts to a promise', function () {
    let {result} = renderHook(() => useAsPromise(useMockHook()));

    act(() => {
      let callback = jest.fn(a => console.log(a));
      let promise = result.current({state: "init"});
      promise.then(callback)
    })
  });
})
//TODO complete test
