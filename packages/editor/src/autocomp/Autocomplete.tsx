import { FC, KeyboardEventHandler, useEffect, useRef, useState } from "react";

import styles from "./Autocomplete.module.css";
import useProviders from "./useProviders";
import { NewNode, Property, Turn } from "../types";
import Suggestion from "./Suggestion";

const Autocomplete: FC<{
  turn: Turn;
  previousProps: Property[];
  onEnter: (newNode: NewNode) => void;
}> = ({ onEnter, turn, previousProps }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [currentProp, setCurrentProp] = useState<Partial<Property>>({});
  const [properties, setProperties] = useState<Property[]>([]);
  const [input, setInput] = useState("");
  const [selectedSugg, setSelectedSugg] = useState(0);

  const suggestions = useProviders({
    currentProp,
    input,
    limit: 10,
    otherProps: properties,
    turn,
    previousProps,
  });
  const active = suggestions.length > 0 && suggestions.every((sugg) => sugg.score !== 0);

  useEffect(() => {
    if (suggestions.length > 0) setSelectedSugg((sel) => Math.min(sel, suggestions.length - 1));
    else setSelectedSugg(0);
  }, [suggestions.length]);

  const acceptSugg = (suggIdx: number) => {
    console.log("accept", suggIdx);
    const { type, value } = suggestions[suggIdx];
    if (type && value) setProperties((p) => [...p, { type, value }]);
    else setCurrentProp({ type, value });
    setInput("");
  };

  const onKeyDown: KeyboardEventHandler = (ev) => {
    if (ev.key === "Enter") {
      if (ev.ctrlKey) {
        onEnter({ properties, label: "New Node", turn });
        setInput("");
        setProperties([]);
        setCurrentProp({});
      } else if (suggestions.length > 0) {
        acceptSugg(selectedSugg);
      } else if (input !== "" && currentProp.type) {
        setProperties((p) => [...p, { type: currentProp.type as string, value: input }]);
        setInput("");
      }
    } else if (ev.key === "Tab" && suggestions.length > 0) {
      acceptSugg(selectedSugg);
      ev.preventDefault();
    } else if (ev.key === "ArrowDown") {
      setSelectedSugg((sel) => (sel + 1) % suggestions.length);
      ev.preventDefault();
    } else if (ev.key === "ArrowUp") {
      setSelectedSugg((sel) => (sel === 0 ? suggestions.length - 1 : sel - 1));
      ev.preventDefault();
    }
  };

  return (
    <div className="flex items-center rounded bg-white p-2 ">
      {properties.map(({ type, value }, idx) => (
        <div key={idx}>
          <span className="text-green">{type.toUpperCase()}</span> is{" "}
          <span className="text-green">{value}</span>
        </div>
      ))}
      <div className={styles["autocomp-cont"] + " flex-1 min-w-30 relative"}>
        <input
          ref={inputRef}
          type="text"
          autoFocus
          value={input}
          onChange={(ev) => setInput(ev.currentTarget.value)}
          onKeyDown={onKeyDown}
          className={" w-full appearance-none m-l-1 b-none " + (active ? "rounded-b-none" : "")}
        />
        <div className="absolute top-full w-full">
          {suggestions.map((sugg, idx) => (
            <Suggestion
              key={idx}
              sugg={sugg}
              selected={idx === selectedSugg}
              onClick={() => (acceptSugg(idx), inputRef.current?.focus())}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Autocomplete;
