import { useDebugValue, useEffect, useMemo, useState } from 'react';
import { usePathForm } from '.';

/**
 * A hook which triggers a rerender when the subscription topic
 * receives an emitted event.
 *
 * @param topic The topic or field dotpath to subscribe to changes.
 * @returns The total number of renders or times this topic received an update.
 */
export function usePathFormSubscription(topic: string) {
  const [renders, setRenders] = useState(0);
  const { watchers } = usePathForm();

  useDebugValue(renders);

  // subscribe to errors, re-render when triggered
  useEffect(() => {
    const unsubscribe = watchers.current.on(topic, () => {
      setRenders((r) => {
        return r + 1;
      });
    });

    // on unmount, unsubscribe by calling the function
    return () => unsubscribe();
  }, [watchers]);

  // return new value when renders is increase
  return useMemo(() => renders, [renders]);
}
