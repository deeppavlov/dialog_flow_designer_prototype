import { useMemo } from "react";
import fuzzy from "fuzzysort";

const useFuzzyList = (query: string | null, options: string[]) => {
  const filtered = useMemo(
    () =>
      query
        ? fuzzy.go(query, options, {
            limit: 5,
          })
        : null,
    [query, options]
  );

  return filtered;
};

export default useFuzzyList;
