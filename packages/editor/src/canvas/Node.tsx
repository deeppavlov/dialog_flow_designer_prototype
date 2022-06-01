import cn from "classnames";
import { FC } from "react";
import { GNode, Turn } from "../types";
import IconAddFilled from "~icons/carbon/add-filled";

const Node: FC<{
  node: GNode;
  starter?: boolean;
  selected: boolean;
  onClick: () => void;
  onClickAdd: () => void;
}> = ({ node: { label, properties, turn }, starter = false, selected, onClick, onClickAdd }) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative p-5 w-40",
        "rounded border-t-5",
        "bg-white text-center text-black",
        starter ? "border-red-500" : turn === Turn.BOT ? "border-blue-500" : "border-yellow-500",
        selected && "ring ring-blue-500"
      )}
    >
      {label}
      <div className="cursor-pointer h-full left-full top-0 w-10 hidden absolute items-center justify-center display-none hover:flex group-hover:flex">
        <IconAddFilled
          fill="white"
          fontSize="20"
          color="#10b981"
          onClick={(ev) => (ev.stopPropagation(), onClickAdd())}
        />
      </div>
    </div>
  );
};

export default Node;
