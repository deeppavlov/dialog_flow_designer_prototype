import cn from "classnames";
import { FC } from "react";
import { GNode, Turn } from "../types";
import IconAddFilled from "~icons/carbon/add-filled";

const Node: FC<{
  node: GNode;
  selected: boolean;
  onClick: () => void;
  onClickAdd: () => void;
}> = ({ node: { label, properties, turn }, selected, onClick, onClickAdd }) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative m-15 rounded bg-white p-5 border-t-5 text-center text-black group",
        turn === Turn.BOT ? "border-red-500" : "border-yellow-500"
      )}
    >
      {label}
      <div className="hidden h-full left-full top-0 w-10 absolute items-center justify-center display-none group-hover:flex hover:flex cursor-pointer">
        <IconAddFilled fill="white" fontSize="20" color="#10b981" onClick={onClickAdd} />
      </div>
    </div>
  );
};

export default Node;
