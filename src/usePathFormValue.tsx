import { useEffect, useMemo } from 'react';
import {
  usePathForm,
  usePathFormDotPath,
  usePathFormStorePath,
  createStoreItem,
  get,
  parseStoreItem,
  set,
  PathFormPath,
  PathFormStoreItem,
  PathFormStoreMeta,
  usePathFormSubscription,
} from '.';

export function usePathFormValue<T = any>(path: PathFormPath = [], defaultValue?: T) {
  // internal state is how we force trigger re-render, by increase renders
  const { state } = usePathForm();
  const dotpath = usePathFormDotPath(path);
  const renders = usePathFormSubscription(dotpath);
  const storePath = usePathFormStorePath(path);
  const storeItem = get(state.current.store, storePath) as PathFormStoreItem;
  const defaultStoreItemValue = createStoreItem(defaultValue);

  // only on initial mount, if value does not exist, set the defaultValue
  // this happens asynchronously but the returned value on first render will be synced immediately
  useEffect(() => {
    // refetch `storeItem` in this `useEffect` scope as the outer closure `storeItem`
    // may be out of date, because it may have been set by another `defaultValue`
    // between multiple first render hook and `useEffect` on the same path
    const storeItem = get(state.current.store, storePath) as PathFormStoreItem;

    // if the store item is not there, create it
    if (storeItem?.value === undefined) {
      set(state.current.store, storePath, defaultStoreItemValue, { validateParentPath: true });
    }
    // thank you for looking out for us eslint
    // but we only want this to happen on the initial mount
    // eslint-disable-next-line
  }, []);

  // fallback to defaultValue meta and storeItem on first render -- `useEffect` triggers after first render
  const meta = storeItem?.meta || defaultStoreItemValue.meta;
  const value = !!storeItem?.type ? parseStoreItem(storeItem) : defaultValue;

  // renders is increased, but `value` and `meta` are pulled at the time of render
  return useMemo(() => {
    return [value, meta, renders] as [T, PathFormStoreMeta, number];
  }, [value, meta, renders]);
}
