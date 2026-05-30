import { useEffect, useRef, useState } from "react";

// When `value` changes to a new non-empty value (e.g. a scenario fills the
// field), returns a fresh truthy token for the duration of one animation,
// then null. Use the token both as a re-mount key for the animated element
// and as a flag to know an animation is in flight. Manual typing of the
// same value won't retrigger.
const ANIMATION_MS = 750;

export function useSlotAnimation(value) {
  const [token, setToken] = useState(null);
  const prevRef = useRef(value);

  useEffect(() => {
    if (value !== prevRef.current && value) {
      prevRef.current = value;
      const id = Date.now();
      setToken(id);
      const t = setTimeout(() => {
        setToken((current) => (current === id ? null : current));
      }, ANIMATION_MS);
      return () => clearTimeout(t);
    }
    prevRef.current = value;
  }, [value]);

  return token;
}
