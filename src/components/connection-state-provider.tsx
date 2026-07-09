import { BLEConnectionState } from "@/utils/types";
import {
  createContext,
  type Dispatch,
  type SetStateAction,
  useState,
} from "react";

type Props = { children: React.ReactNode };

export const ConnectionStateContext = createContext<BLEConnectionState>("idle");
export const ConnectionStateDispatchContext = createContext<Dispatch<
  SetStateAction<BLEConnectionState>
> | null>(null);

const ConnectionStateProvider = (props: Props) => {
  const [connectionState, setConnectionState] =
    useState<BLEConnectionState>("idle");

  return (
    <ConnectionStateContext value={connectionState}>
      <ConnectionStateDispatchContext value={setConnectionState}>
        {props.children}
      </ConnectionStateDispatchContext>
    </ConnectionStateContext>
  );
};

export default ConnectionStateProvider;
