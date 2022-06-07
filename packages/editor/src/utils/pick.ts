const pick =
  <T, K extends keyof T>(...keys: K[]) =>
  (obj: T): Pick<T, K> => {
    const ret: any = {};
    keys.forEach((key) => {
      ret[key] = obj[key];
    });
    return ret;
  };

export default pick;
