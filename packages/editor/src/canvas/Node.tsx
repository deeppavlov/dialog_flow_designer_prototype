import cn from "classnames";
import { FC } from "react";
import { GNode, Turn } from "../types";
import IconAddFilled from "~icons/carbon/add-filled";

export const nodeWidth = 160;
export const nodeHeight = 69;

/**
 * Purely representational node component.
 */
const Node: FC<{
  node: GNode;
  starter?: boolean;
  selected: boolean;
  onClickAdd: () => void;
}> = ({ node: { label, properties, turn }, starter = false, selected, onClickAdd }) => (
  <div
    className={cn(
      "group relative p-5 w-40",
      "rounded border-t-5",
      "bg-white text-center text-black",
      "select-none",
      starter ? "border-red-500" : turn === Turn.BOT ? "border-blue-500" : "border-yellow-500",
      selected && "ring ring-blue-500"
    )}
  >
    {label}
    <div className="h-full left-full top-0 w-10 hidden absolute items-center justify-center display-none hover:flex group-hover:flex">
      <div
        className="bg-white cursor-pointer rounded-1 h-[18px] w-[18px] relative"
        onClick={(ev) => (ev.stopPropagation(), onClickAdd())}
      >
        <IconAddFilled
          style={{
            transform: "translate(-3px, -3px)",
          }}
          fontSize="22"
          color="#10b981"
        />
      </div>
    </div>
  </div>
);

export default Node;
