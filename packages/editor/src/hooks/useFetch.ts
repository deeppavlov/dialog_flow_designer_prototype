import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import getHash from "object-hash";

type Data = string | Array<any> | object | number | boolean | null;

const useFetch = <D, T extends Data = string>(
  url: string,
  data: T | null = null,
  wrapper: (val: T) => any,
  defaultReturn: D | null = null
) => {
  const cache = useRef<Record<string, D>>({});
  const cancelRequest = useRef<boolean>(false);
  const [result, setResult] = useState<D | null>(defaultReturn);
  const [error, setError] = useState<Error | null>(null);

  const hash = useMemo(() => url + getHash(data), [url, data]);

  useEffect(() => {
    if (!data) return;

    const fetchData = async () => {
      setError(null);
      setResult(defaultReturn);

      if (cache.current[hash]) {
        setResult(cache.current[hash]);
        return;
      }

      try {
        const fetchResp = await fetch(url, {
          method: "POST",
          body: JSON.stringify(wrapper(data)),
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!fetchResp.ok) {
          throw new Error(fetchResp.statusText);
        }

        const newRes: D = await fetchResp.json();
        cache.current[hash] = newRes;

        if (cancelRequest.current) return;
        setResult(newRes);
      } catch (err) {
        if (cancelRequest.current) return;
        setError(err as Error);
      }
    };

    void fetchData();

    return () => {
      cancelRequest.current = true;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hash]);

  return {
    result,
    error,
  };
};

export type FetchReturn = ReturnType<typeof useFetch>;

export default useFetch;
