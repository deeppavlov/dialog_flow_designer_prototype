import { useDeferredValue, useEffect, useRef, useState } from "react";
import fuzzysort from "fuzzysort";
import objectHash from "object-hash";

import { AutocompArgs, SuggestionData, Turn } from "../types";
import sfList from "./sfList";

export type UseProviderArgs = Omit<AutocompArgs, "cache">;

type AutocompProvider = (args: AutocompArgs) => Promise<SuggestionData[]>;

const SF_CLASS_URL = "http://dream.deeppavlov.ai:8108/model";
const SF_PRED_URL = "http://dream.deeppavlov.ai:8107/annotation";

const TYPE_LIST = {
  [Turn.BOT]: ["MIDAS", "SF", "RESP"],
  [Turn.USER]: ["MIDAS", "SF"],
};

const isWs = (str: string): boolean => !!str.match(/^\s+$/);

const postData = async (url: string, data: object, cache: AutocompArgs["cache"]) => {
  const key = url + objectHash(data);
  if (cache[key]) return cache[key];

  const fetchResp = await fetch(SF_CLASS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const result = await fetchResp.json();
  cache[key] = result;

  return result;
};

const providers: Record<string, AutocompProvider> = {
  type: async ({ input, currentProp: { type }, turn, limit }) => {
    if (type) return [];
    if (input === "") return TYPE_LIST[turn].map((t) => ({ type: t, score: 0 }));

    return fuzzysort
      .go(input, TYPE_LIST[turn], { limit })
      .map(({ score, target }) => ({ score, type: target }));
  },

  sf: async ({ input, currentProp: { type }, limit }) => {
    if (type && type !== "SF") return [];
    if (input === "") return sfList.map((sf) => ({ type: "SF", value: sf, score: 0 }));

    return fuzzysort
      .go(input, sfList, { limit })
      .map(({ target, score }) => ({ type: "SF", value: target, score }));
  },

  sfClass: async ({ input, currentProp: { type }, cache }) => {
    if (type && type !== "SF") return [];

    const body = {
      phrase: [input],
    };
    const data: string[][] = await postData(SF_CLASS_URL, body, cache);
    return data.flat().map((sugg) => ({
      type: "SF",
      value: sugg,
      score: -1.1, // Beats every fuzzy match, except single char typos
    }));
  },

  sfPred: async ({ currentProp: { type }, previousProps, cache }) => {
    if (type && type !== "SF") return [];

    type Result = [
      {
        batch: [{ prediction: string; confidence: number }[]];
      }
    ];

    const prevSF = previousProps.find((prop) => prop.type === "SF")?.value;
    if (!prevSF) return [];
    const data: Result = await postData(SF_PRED_URL, [prevSF], cache);
    return data[0].batch[0].map((sugg) => ({
      type: "SF",
      value: sugg.prediction,
      score: (sugg.confidence - 1) * 5, // From -5 to 0
    }));
  },
};

const useProviders = (args: UseProviderArgs) => {
  const cache = useRef<AutocompArgs["cache"]>({}).current;
  const [results, setResults] = useState<SuggestionData[]>([]);
  const deferredInput = useDeferredValue(args.input);

  useEffect(() => {
    if (isWs(deferredInput)) setResults([]);

    const providerArgs: AutocompArgs = {
      ...args,
      input: deferredInput,
      cache,
    };

    Promise.all(Object.values(providers).map((getSuggs) => getSuggs(providerArgs))).then(
      (providerRes) => {
        const allSuggs = providerRes.flat();
        // Group by type and value
        const grouped = new Map<string, SuggestionData[]>();
        allSuggs.forEach((sugg) => {
          const key = (sugg.type ?? "") + (sugg.value ?? "");
          if (!grouped.has(key)) grouped.set(key, []);
          grouped.get(key)?.push(sugg);
        });
        // Avarage scores & combine
        const combined: SuggestionData[] = [];
        grouped.forEach((suggs) =>
          combined.push({
            score: suggs.reduce((sum, { score }) => sum + score, 0) / suggs.length,
            type: suggs[0].type,
            value: suggs[0].value,
          })
        );
        // Sort
        combined.sort((a, b) => a.score - b.score);

        setResults(combined.slice(0, args.limit));
      }
    );
  }, [deferredInput]);

  return results;
};

export default useProviders;
