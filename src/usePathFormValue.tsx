import { useState, useEffect, useMemo } from 'react';
import { PathFormPath, PathFormStoreItem, PathFormStoreMeta, usePathForm } from './usePathForm';
import { usePathFormDotPath } from './usePathFormDotPath';
import { usePathFormStorePath } from './usePathFormStorePath';
import { createStoreItem, get, parseStoreItem, set } from './utils';

export const usePathFormValue = (path: PathFormPath, defaultValue?: any) => {
  // internal state is how we force trigger re-render, by increase renders
  const [renders, setRenders] = useState(0);
  const { state, watchers } = usePathForm();
  const dotpath = usePathFormDotPath(path);
  const storePath = usePathFormStorePath(path);
  const storeItem = get(state.current.store, storePath) as PathFormStoreItem;
  const defaultStoreItemValue = createStoreItem(defaultValue);

  // only on initial mount, if value does not exist, set the defaultValue
  // this happens asynchronously but the returned value on first render will be synced immediately
  useEffect(() => {
    // if the store item is not there, create it
    if (storeItem?.value === undefined) {
      set(state.current.store, storePath, defaultStoreItemValue);
    }
    // thank you for looking out for us eslint
    // but we only want this to happen on the initial mount
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    // subscribe to updates on this dotpath to trigger re-render by increasing internal renders
    const unsubscribe = watchers.current.on(dotpath, () => {
      setRenders((r) => r + 1);
    });

    // on unmount, unsubscribe by calling the function
    return () => unsubscribe();
  }, [dotpath, watchers]);

  // TODO handle no storeItem set

  const meta = storeItem?.meta || defaultStoreItemValue.meta;
  const value = !!storeItem?.type ? parseStoreItem(storeItem) : defaultValue;

  // renders is increased, but `value` and `meta` are pulled at the time of render
  return useMemo(() => {
    return [value, meta, renders] as [any, PathFormStoreMeta, number];
  }, [value, meta, renders]);
};
