import { useState, useEffect } from "react";

export default function useAsyncValue<T>(input: T | Promise<T>): T | undefined {
  const [value, setValue] = useState<T | undefined>(undefined);

  useEffect(() => {
    if (input instanceof Promise) {
      // Se for Promise, espera resolver
      input.then(resolved => {
        setValue(resolved);
      });
    } else {
      // Se for valor direto
      setValue(input);
    }
  }, [input]);

  return value;
}
