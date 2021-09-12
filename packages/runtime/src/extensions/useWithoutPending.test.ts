import {act, renderHook} from '@testing-library/react-hooks'
import {useCacheTerminalResult} from "./cacheTerminalResult";
import {useMockHook} from "./context.test";

describe("useWithoutPending", () => {
  it('should not render pending state if at least one terminated call is present', async function () {

    let {result} = renderHook(() => useCacheTerminalResult(useMockHook()));

    expect(result.current[0].state).toBe("init")

    act(() => { result.current[1]({state: "pending"}) })
    expect(result.current[0].state).toBe("pending")

    act(() => { result.current[1]({state: "success"}) })
    expect(result.current[0].state).toBe("success")

    act(() => { result.current[1]({state: "pending"}) })
    expect(result.current[0].state).toBe("success")

    act(() => { result.current[1]({state: "error"}) })
    expect(result.current[0].state).toBe("error")
  })
});
