import useFetch from "./useFetch";

type Result = [
  {
    batch: [{ prediction: string; confidence: number }[]];
  }
];

const URL = "http://dream.deeppavlov.ai:8107/annotation";

const useSfPredictor = (phrase: string | null = null) => {
  const { result, error } = useFetch<Result>(URL, phrase, (val) => ({
    phrase: [val],
  }));

  return { result: result?.[0].batch[0] ?? [], error };
};

export default useSfPredictor;
