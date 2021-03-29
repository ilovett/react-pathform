import React from 'react';
import {
  set,
  get,
  typeOf,
  toDotPath,
  toStorePath,
  createStoreItem,
  arrayMove,
  arrayRemove,
  createStore,
  eventEmitter,
  parseStore,
} from '.';
import { usePathFormDotPath } from './usePathFormDotPath';
import { usePathFormStorePath } from './usePathFormStorePath';

export type PathFormValuePrimitive = string | number | boolean | null;

export type PathFormState = {
  store: PathFormStore;
  defaults: object;
};

export type PathFormPath = Array<string | number>; // | string;

export type PathFormError = {
  type: string;
  message: string;
  value: any;
};

export type PathFormStoreMeta = {
  uuid: string;
  dirty: boolean;
  touched: boolean;
  error: null | PathFormError; // TODO
};

export type PathFormValueType = 'primitive' | 'object' | 'array';

export type PathFormStorePrimitive = {
  type: 'primitive';
  meta: PathFormStoreMeta;
  value: PathFormValuePrimitive;
};

export type PathFormStoreObject = {
  type: 'object';
  meta: PathFormStoreMeta;
  value: {
    [key: string]: PathFormStoreItem;
  };
};

export type PathFormStoreArray = {
  type: 'array';
  meta: PathFormStoreMeta;
  value: Array<PathFormStoreItem>;
};

export type PathFormStoreItem = PathFormStorePrimitive | PathFormStoreObject | PathFormStoreArray;

export type PathFormStoreInput = {
  [key: string]: any;
};

export type PathFormStore = {
  [key: string]: PathFormStoreItem;
};

type PathFormWatcher = Readonly<{
  on: (name: string, fn: (data?: any) => any) => any;
  emit: (name: string, data: any) => any;
}>;

type PathFormStateContextInitialized = {
  state: null;
  watchers: null;
};

type PathFormStateContext = {
  state: React.MutableRefObject<PathFormState>;
  watchers: React.MutableRefObject<PathFormWatcher>;
  array: PathFormArrayUtils;
  getValues: () => any;
  setValue: (path: PathFormPath, value: any) => any;
  setDirty: (path: PathFormPath, dirty: boolean) => any;
  setTouched: (path: PathFormPath, touched: boolean) => any;
  addError: (path: PathFormPath, error: PathFormError) => any;
  clearError: (path: PathFormPath) => any;
};

type PathFormArrayUtils = {
  append: (path: PathFormPath, item: any) => any;
  prepend: (path: PathFormPath, item: any) => any;
  remove: (path: PathFormPath, item: any) => any;
  move: (path: PathFormPath, fromIndex: number, toIndex: number) => any;
};

const PathFormStateContext = React.createContext<PathFormStateContextInitialized | PathFormStateContext>({
  state: null,
  watchers: null,
});

PathFormStateContext.displayName = 'PathFormStateContext';

interface PathFormProviderProps {
  initialRenderValues?: any; // TODO generics or something
  children: React.ReactNode;
}

export const PathFormProvider: React.FC<PathFormProviderProps> = ({ children, initialRenderValues }) => {
  const state = React.useRef({
    store: createStore(initialRenderValues),
    defaults: initialRenderValues,
  });
  const watchers = React.useRef(eventEmitter());

  const getValues = () => {
    return parseStore(state.current.store);
  };

  const setValue = (path: PathFormPath, value: any) => {
    const storePath = toStorePath(path);
    const storeItem = get(state.current.store, storePath) as PathFormStoreItem; // TODO default value based on value here?

    // only update store & emit to subscribers if value changed
    // TODO performance protect against non primitive types, EG: comparing `[] !== []` is true
    if (storeItem?.value !== value) {
      const newValueType = typeOf(value);

      // no store item exists at the given path, set it up!
      if (!storeItem) {
        set(state.current.store, storePath, createStoreItem(value));
      }
      // if new type is primitive, simply update the value
      else if (newValueType === 'primitive') {
        set(state.current.store, [...storePath, 'type'], 'primitive');
        set(state.current.store, [...storePath, 'value'], value);
      }
      // otherwise arrays items and object properties need to be converted to store items
      else if (newValueType === 'array' || newValueType === 'object') {
        const newStoreItem = createStoreItem(value);

        // keep the existing uuid but change the type and value
        set(state.current.store, [...storePath, 'type'], newValueType);
        set(state.current.store, [...storePath, 'value'], newStoreItem.value);
      } else {
        throw new Error('Unhandled setValue case.');
      }

      watchers.current.emit(toDotPath(path), value);
    }
  };

  const setDirty = (path: PathFormPath, dirty: boolean) => {
    const dotpath = toDotPath(path); // cant use hooks inside
    const storePath = toStorePath(path);
    const storeItem = get(state.current.store, storePath);

    // validate that the target store item exists
    if (storeItem === undefined) {
      throw new Error(`The target path "${dotpath}" does not exist.`);
    }

    // mutate the target store item
    set(state.current.store, [...storePath, 'meta', 'dirty'], dirty);

    // notify subscribers
    watchers.current.emit(dotpath, storeItem);
  };

  const setTouched = (path: PathFormPath, touched: boolean) => {
    const dotpath = toDotPath(path); // cant use hooks inside
    const storePath = toStorePath(path);
    const storeItem = get(state.current.store, storePath);

    // validate that the target store item exists
    if (storeItem === undefined) {
      throw new Error(`The target path "${dotpath}" does not exist.`);
    }

    // mutate the target store item
    set(state.current.store, [...storePath, 'meta', 'touched'], touched);

    // notify subscribers
    watchers.current.emit(dotpath, storeItem);
  };

  const addError = (path: PathFormPath, error: PathFormError) => {
    const dotpath = toDotPath(path);
    const storePath = toStorePath(path);
    const storeItem = get(state.current.store, storePath); // TODO default value based on value here?

    // validate that the target store item exists
    if (storeItem === undefined) {
      throw new Error(`The target path "${dotpath}" does not exist.`);
    }

    // mutate the target store item error
    set(state.current.store, [...storePath, 'meta', 'error'], error);

    // notify subscribers
    watchers.current.emit(dotpath, storeItem);
  };

  const clearError = (path: PathFormPath) => {
    const dotpath = toDotPath(path);
    const storePath = toStorePath(path);
    const storeItem = get(state.current.store, storePath);

    // validate that the target store item exists
    if (storeItem === undefined) {
      throw new Error(`The target path "${dotpath}" does not exist.`);
    }

    // mutate the target store item
    set(state.current.store, [...storePath, 'meta', 'error'], null);

    // notify subscribers
    watchers.current.emit(dotpath, storeItem);
  };

  // helper for mutating store arrays to keep the array utils DRY
  // validate that the storeItem is an array, do some callback action, and emit
  const mutateArray = (path: PathFormPath, mutate: (targetArrayStoreItem: PathFormStoreArray) => any) => {
    const dotpath = toDotPath(path);
    const targetArrayStoreItem = get(state.current.store, toStorePath(path));

    // validate that the target value is an array
    if (targetArrayStoreItem?.type !== 'array' || !Array.isArray(targetArrayStoreItem?.value)) {
      throw new TypeError(`The target path "${dotpath}" is not an array.`);
    }

    // do the mutation
    mutate(targetArrayStoreItem);

    // notify subscribers
    watchers.current.emit(dotpath, targetArrayStoreItem);
  };

  const array = {
    append: (path: PathFormPath, item: any) => {
      mutateArray(path, (targetArrayStoreItem: PathFormStoreArray) => {
        // push the new store item to the end of the array
        targetArrayStoreItem.value.push(createStoreItem(item));
      });
    },

    prepend: (path: PathFormPath, item: any) => {
      mutateArray(path, (targetArrayStoreItem: PathFormStoreArray) => {
        // unshift the new store item to the beginning of the array
        targetArrayStoreItem.value.unshift(createStoreItem(item));
      });
    },

    move: (path: PathFormPath, fromIndex: number, toIndex: number) => {
      mutateArray(path, (targetArrayStoreItem: PathFormStoreArray) => {
        // mutate the target array
        arrayMove(targetArrayStoreItem.value, fromIndex, toIndex);
      });
    },

    remove: (path: PathFormPath, index: number) => {
      mutateArray(path, (targetArrayStoreItem: PathFormStoreArray) => {
        // mutate the target array
        arrayRemove(targetArrayStoreItem.value, index);
      });
    },
  };

  return (
    <PathFormStateContext.Provider value={{ state, watchers, array, getValues, setValue, addError, clearError, setTouched, setDirty }}>
      {children}
    </PathFormStateContext.Provider>
  );
};

export function usePathForm() {
  const context = React.useContext(PathFormStateContext) as PathFormStateContext;
  if (!context) {
    throw new Error('`usePathForm` must be used within a `PathFormProvider`');
  }
  return context;
}
