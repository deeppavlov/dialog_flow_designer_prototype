import { FC } from "react";
import Node from "./Node";

const FloatingNode: FC<{ x: number; y: number } & Parameters<typeof Node>[0]> = ({
  x,
  y,
  ...nodeProps
}) => {
  return (
    <div className="absolute" style={{ transform: `translate(${x}px, ${y}px)` }}>
      <Node {...nodeProps} />
    </div>
  );
};

export default FloatingNode;
