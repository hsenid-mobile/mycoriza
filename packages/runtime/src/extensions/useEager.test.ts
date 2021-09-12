import {renderHook} from "@testing-library/react-hooks";
import {useEager} from "./fetchOnLoad";
import {useMockHook, useMockHook2} from "./context.test";

describe("useEager", () => {
  it('should call the function upon loading', function () {
    let {result} = renderHook(() => useEager(useMockHook(), {state: "pending"}));

    expect(result.current[0].state).toBe("pending")
  });

  it('should support multiple parameters', function () {
    let {result} = renderHook(() => useEager(useMockHook2(), {state: "pending"}, ''));

    expect(result.current[0].state).toBe("pending")
    expect((result.current[0] as any).data).toBe("")
  });
})
