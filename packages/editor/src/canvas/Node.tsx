import { FC } from "react";
import { css } from "@linaria/core";
import { GNode, Turn } from "../types";

const hoverShow = css`
  &:hover > div:last-child {
    display: flex;
  }
`;

const Node: FC<{
  node: GNode;
  selected: boolean;
  onClick: () => void;
  onClickAdd: () => void;
}> = ({ node: { label, properties, turn }, selected, onClick, onClickAdd }) => {
  return (
    <div
      onClick={onClick}
      className={
        hoverShow +
        " relative m-15 border-rounded bg-white p-5 b-t-5 text-center " +
        (turn === Turn.USER ? "b-t-yellow" : "b-t-red")
      }
    >
      {label}
      <div className="absolute h-full w-10 left-full top-0 items-center justify-center display-none hover:flex">
        <i
          className="i-carbon:add-filled text-7 text-green bg-white"
          onClick={onClickAdd}
        />
      </div>
    </div>
  );
};

export default Node;
