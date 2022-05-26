import { FC } from "react";
import cn from "classnames";
import { SuggestionData } from "../types";

const Suggestion: FC<{
  sugg: SuggestionData;
  selected: boolean;
  onClick: () => void;
}> = ({ sugg, selected, onClick }) => {
  return (
    <div
      className={cn(
        {
          "bg-light-900": selected,
          "bg-white": !selected,
        },
        "text-sm p-0.5 w-full truncate hover:bg-light-500 text-blue cursor-pointer select-none"
      )}
      onClick={onClick}
    >
      <span className="text-blue">{sugg.type ?? "..."}</span>{" "}
      <i className="i-codicon:arrow-right text-dark-500" />{" "}
      <span className="text-blue">{sugg.value ?? ""}</span>
    </div>
  );
};

export default Suggestion;
