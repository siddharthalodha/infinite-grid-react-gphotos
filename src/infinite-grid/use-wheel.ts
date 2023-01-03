import { useEventListener } from "@chakra-ui/hooks";
// @ts-ignore
import { Lethargy } from "lethargy";

const lethargy = new Lethargy(10, 14, 0.05);

type WheelListener = (e: WheelEvent) => void;

export const useWheel = (listener: WheelListener) => {
  useEventListener("wheel", (e) => {
    if (lethargy.check(e) !== false) {
      listener(e);
    }
  });
};
