import { useEffect, useRef, useState } from "react";

export function useSlotAnimation(value) {
  const [flash, setFlash] = useState(null);
  const prevRef = useRef(value);

  useEffect(() => {
    if (value !== prevRef.current && value) {
      prevRef.current = value;
      setFlash(value);
      const t = setTimeout(() => setFlash(null), 450);
      return () => clearTimeout(t);
    }
  }, [value]);

  return flash;
}
