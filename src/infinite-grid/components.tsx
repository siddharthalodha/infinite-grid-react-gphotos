import { Box, useBreakpointValue } from "@chakra-ui/react";
import { useComponentSize } from "react-use-size";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useSpring
} from "framer-motion";
import { autorun } from "mobx";
import * as React from "react";
import { Grid, Vector } from "./utils";
import { useWheel } from "./use-wheel";

const config = { mass: 0.2, damping: 40, stiffness: 200 };

const MotionBox = motion(Box);

const ItemComp = ({ item, children }) => {
  const x = useMotionValue(item.center.x);
  const y = useMotionValue(item.center.y);

  React.useEffect(() => {
    return autorun(() => {
      x.set(item.center.x);
      y.set(item.center.y);
    });
  }, []);

  return (
    <MotionBox pos="absolute" w={item.width} h={item.height} style={{ x, y }}>
      {children}
    </MotionBox>
  );
};

interface InfiniteGridProps {
  width?: number | string;
  height?: number | string;
  children: React.ReactNode;
}

export const InfiniteGrid = ({
  width = "100%",
  height = "100%",
  children
}: InfiniteGridProps) => {
  const content = useComponentSize();
  const panSensistivity = useBreakpointValue({ base: 12, md: 18, sm: 24 });

  const grid = React.useMemo(
    () =>
      new Grid({
        width: content.width,
        height: content.height
      }),
    [content.width, content.height]
  );

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springs = {
    x: useSpring(0, config),
    y: useSpring(0, config)
  };

  useMotionValueEvent(springs.x, "change", (val) => {
    grid.setCameraPosition(
      new Vector({
        x: val,
        y: springs.y.get()
      })
    );
  });

  useMotionValueEvent(springs.y, "change", (val) => {
    grid.setCameraPosition(
      new Vector({
        x: springs.x.get(),
        y: val
      })
    );
  });

  useWheel((e) => {
    springs.x.set(springs.x.get() + e.deltaX * 8);
    springs.y.set(springs.y.get() + e.deltaY * 8);
  });

  React.useEffect(() => {
    return autorun(() => {
      x.set(-grid.cameraPosition.x);
      y.set(-grid.cameraPosition.y);
    });
  }, [grid]);

  return (
    <MotionBox
      key={grid.id}
      w={width}
      h={height}
      overflow="hidden"
      onPan={(e, pointInfo) => {
        springs.x.set(springs.x.get() - pointInfo.delta.x * panSensistivity);
        springs.y.set(springs.y.get() - pointInfo.delta.y * panSensistivity);
      }}
    >
      <MotionBox
        w="100%"
        h="100%"
        pos="relative"
        display="flex"
        alignItems="center"
        justifyContent="center"
        style={{ x, y }}
      >
        <Box pos="absolute" inset={0}>
          <Box
            // to measure the size of the content
            ref={content.ref}
            display="inline-block"
            visibility="hidden"
            minH="100%"
            minW="100%"
          >
            {children}
          </Box>
        </Box>
        {grid.items.map((item) => (
          <ItemComp key={item.id} item={item}>
            {children}
          </ItemComp>
        ))}
      </MotionBox>
    </MotionBox>
  );
};
