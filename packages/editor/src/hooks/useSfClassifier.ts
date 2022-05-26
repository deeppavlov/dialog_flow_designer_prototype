import useFetch from "./useFetch";

const URL = "http://dream.deeppavlov.ai:8108/model";

const useSfClassifier = (phrase: string | null = null) => {
  const { result, error } = useFetch<string[][]>(URL, phrase, (val) => ({
    phrase: [val],
  }));

  return { result: result?.flat() ?? [], error };
};

export default useSfClassifier;
