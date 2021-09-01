import {renderHook} from "@testing-library/react-hooks";
import {useEager} from "./useEager";
import {useMockHook} from "./context.test";

describe("useEager", () => {
  it('should call the function upon loading', function () {
    let {result} = renderHook(() => useEager(useMockHook(), {state: "pending"}));

    expect(result.current[0].state).toBe("pending")
  });
})
