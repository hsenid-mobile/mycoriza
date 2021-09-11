import {renderHook, act} from "@testing-library/react-hooks";
import {useMockHook} from "./context.test";
import {useDebounce} from "./useDebounce";
import {isSuccess, SuccessState} from "../engine";

describe("useDebounce", () => {
  it('should debounce with the given delay', async function () {
    let {result, waitForNextUpdate} = renderHook(() => useDebounce(useMockHook(), 1000));

    expect(result.current[0].state).toBe("init")
    act(() => {
      let nextState: SuccessState<string> = {state: "success", data: "A"};
      result.current[1](nextState)
    })
    expect(result.current[0].state).toBe("init")
    await waitForNextUpdate()
    expect(result.current[0].state).toBe("success")
  });

  it('should debounce with the given delay with multiple calls', async function () {
    let {result, waitForNextUpdate} = renderHook(() => useDebounce(useMockHook(), 1000));

    expect(result.current[0].state).toBe("init")
    act(() => {
      let nextState: SuccessState<string> = {state: "success", data: "A"};
      result.current[1](nextState)
    })
    expect(result.current[0].state).toBe("init")
    act(() => {
      let nextState: SuccessState<string> = {state: "success", data: "AB"};
      result.current[1](nextState)
    })
    expect(result.current[0].state).toBe("init")
    act(() => {
      let nextState: SuccessState<string> = {state: "success", data: "ABC"};
      result.current[1](nextState)
    })
    expect(result.current[0].state).toBe("init")
    await waitForNextUpdate()
    expect(result.current[0].state).toBe("success")
    if (isSuccess(result.current[0])) {
      expect(result.current[0].data).toBe("ABC")
    }
  });
})
