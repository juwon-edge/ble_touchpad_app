import { blemanager } from "@/utils/ble-touchpad-manager";
import { BLEState } from "@/utils/types";
import React, { createContext, useEffect, useState } from "react";

type Props = { children: React.ReactNode };

export const BLEStateContext = createContext<BLEState>(BLEState.Unknown);

const BLEStateProvider = (props: Props) => {
  const [bleState, setBleState] = useState<BLEState>(BLEState.Unknown);

  useEffect(() => {
    const subscription = blemanager.onStateChange((state) => {
      setBleState(state);
    }, true);
    return () => {
      subscription.remove();
    };
  }, []);

  return <BLEStateContext value={bleState}>{props.children}</BLEStateContext>;
};

export default BLEStateProvider;
