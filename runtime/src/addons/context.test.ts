import {MycorizaHookResultType} from "./types";
import {NetworkState} from "../engine";
import {useState} from "react";

export function useMockHook(): MycorizaHookResultType<string, (s: NetworkState<string>) => void> {
  let [state, setState] = useState<NetworkState<string>>({state: "init"});

  return [ state, setState, () => setState({state: "init"})]
}

it('default', function () {

});
