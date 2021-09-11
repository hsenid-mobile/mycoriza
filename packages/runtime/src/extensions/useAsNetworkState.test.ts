import {act, renderHook} from '@testing-library/react-hooks'
import {useAsNetworkState} from "./useAsNetworkState";
import {isError, isSuccess} from "../engine";

describe("useAsNetworkState", () => {
  it('should promise should be converted to network state', async function () {

    let resolve: (str: string) => void = () => {}

    let {result, waitForNextUpdate} = renderHook(() => useAsNetworkState(() => new Promise<string>((_resolve, _reject) => {
      resolve = _resolve
    } )));

    expect(result.current[0].state).toBe("init")

    act(() => result.current[1]())
    expect(result.current[0].state).toBe("pending")

    act(() => { resolve("Test") })
    await waitForNextUpdate()
    expect(result.current[0].state).toBe("success")
    if (isSuccess(result.current[0])) {
      expect(result.current[0].data).toBe("Test")
    }
  });

  it('should promise should be converted to network state and fail on error', async function () {

    let reject: (err: string) => void = () => {}

    let {result, waitForNextUpdate} = renderHook(() => useAsNetworkState(() => new Promise<string>((_resolve, _reject) => {
      reject = _reject
    } )));

    expect(result.current[0].state).toBe("init")

    act(() => result.current[1]())
    expect(result.current[0].state).toBe("pending")

    act(() => { reject("Error") })
    await waitForNextUpdate()
    expect(result.current[0].state).toBe("error")
    if (isError(result.current[0])) {
      expect(result.current[0].error).toBe("Error")
    }
  });
})
