import React from 'react';
import { set, get, mapValues, uuid } from './utils';

export type PathFormValuePrimitive = string | number | boolean | null;

export type PathFormState = {
  store: PathFormStore;
  defaults: object;
};

export type PathFormStoreMeta = {
  uuid: string;
  dirty: boolean;
  touched: boolean;
  error: null; // TODO
};

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

export const pubsub = () => {
  const subscribers = new Set();

  const sub = (fn: (event?: any) => any) => {
    subscribers.add(fn);

    return () => subscribers.delete(fn);
  };

  // TODO
  // Argument of type '(fn: (data?: any) => any) => any' is not assignable to parameter of type '(value: unknown, value2: unknown, set: Set<unknown>) => void'.
  // Types of parameters 'fn' and 'value' are incompatible.
  //   Type 'unknown' is not assignable to type '(data?: any) => any'
  // @ts-ignore
  const pub = (data: any) => subscribers.forEach((fn: (data?: any) => any) => fn(data));

  return Object.freeze({ pub, sub });
};

export const eventEmitter = () => {
  const events = new Map();

  const on = (name: string, fn: (data?: any) => any) => {
    if (!events.has(name)) events.set(name, pubsub());
    return events.get(name).sub(fn);
  };

  const emit = (name: string, data: any) => {
    return events.has(name) && events.get(name).pub(data);
  };

  return Object.freeze({ on, emit });
};

/** toDotPath
 *
 * Convert an array such as `['items', 0, 'firstName']` to `items[0].firstName`.
 *
 * @param array An array of strings or numbers of nested objects and arrays.
 */
export const toDotPath = (path: PathFormPath) => {
  if (typeof path === 'string') {
    return path;
  }

  return path
    .map((value, index) => {
      if (typeof value === 'number') {
        return `[${value}]`;
      }
      return (index > 0 ? '.' : '') + value;
    })
    .join('');
};

/** fromDotPath
 *
 * Convert a dotpath to an PathFormPath.
 *
 * @param path
 */

export const fromDotPath = (dotpath: string): PathFormPath => {
  // split by `.` first so integers surrounded by dots are treated as string keys
  // EG: `items.23.name` -> `['items', '23', 'name']`
  return dotpath.split('.').reduce((memo, current) => {
    // check if this item looks like an array with integer index
    const match = current.match(/^(\w+)\[(\d+)\]$/);
    if (match) {
      memo.push(match[1]);
      memo.push(parseInt(match[2], 10));
    } else {
      memo.push(current);
    }

    return memo;
  }, [] as PathFormPath);
};

/** toStorePath
 *
 * Convert an array such as `['items', 0, 'firstName']` to a path to be used to get the value in the store.
 *
 * @param array An array of strings or numbers of nested objects and arrays.
 */
export const toStorePath = (path: PathFormPath): PathFormPath => {
  return path.reduce((memo, current, index, arr) => {
    memo.push(current);

    // dont access the target items value,
    // we want the store item itself (the parent of the value)
    if (index + 1 < arr.length) {
      memo.push('value');
    }

    return memo;
  }, [] as PathFormPath);
};

/** arrayMove
 *
 * Move an item in an array from one index, to another index.
 *
 * @param arr the array to mutate
 * @param fromIndex the element index to move
 * @param toIndex the index to move the element to
 * @todo performance improvements
 */
export const arrayMove = (arr: any[], fromIndex: number, toIndex: number): void => {
  var element = arr[fromIndex];
  arr.splice(fromIndex, 1);
  arr.splice(toIndex, 0, element);
};

/** arrayRemove
 *
 * Remove an item in an array at a target index.
 *
 * @param arr the array to mutate
 * @param index the element index to remove
 * @todo performance improvements
 */
export const arrayRemove = (arr: any[], index: number): void => {
  arr.splice(index, 1);
};

export const createStoreItemMeta = (): PathFormStoreMeta => {
  return {
    uuid: uuid(),
    dirty: false,
    touched: false,
    error: null,
  };
};

export const createStoreItemPrimitive = (item: any): PathFormStorePrimitive => {
  return {
    type: 'primitive',
    meta: createStoreItemMeta(),
    value: item,
  };
};

export const createStoreItemArray = (item: any[]): PathFormStoreArray => {
  return {
    type: 'array',
    meta: createStoreItemMeta(),
    value: item.map((i) => createStoreItem(i)),
  };
};

export const createStoreItemObject = (item: any): PathFormStoreObject => {
  return {
    type: 'object',
    meta: createStoreItemMeta(),
    value: mapValues(item, createStoreItem),
  };
};

export const createStoreItem = (item: any): PathFormStoreItem => {
  if (Array.isArray(item)) {
    return createStoreItemArray(item);
  } else if (Object(item) === item) {
    return createStoreItemObject(item);
  } else {
    return createStoreItemPrimitive(item);
  }
};

export const createStore = (input: PathFormStoreInput): PathFormStore => {
  return mapValues(input, createStoreItem);
};

export const parseStoreItemPrimitive = (item: PathFormStorePrimitive): PathFormValuePrimitive => {
  return item.value;
};

export const parseStoreItemArray = (item: PathFormStoreArray): any[] => {
  return item.value.map((i) => parseStoreItem(i));
};

export const parseStoreItemObject = (item: PathFormStoreObject): any => {
  return mapValues(item.value, (i) => parseStoreItem(i));
};

export const parseStoreItem = (item: PathFormStoreItem): any => {
  if (item.type === 'array') {
    return parseStoreItemArray(item);
  } else if (item.type === 'object') {
    return parseStoreItemObject(item);
  } else {
    return parseStoreItemPrimitive(item);
  }
};

export const parseStore = (store: PathFormStore): object => {
  return mapValues(store, (i) => parseStoreItem(i));
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

export type PathFormPath = Array<string | number>; // | string;

export type PathFormError = {
  type: string;
  message: string;
  value: any;
};

interface PathFormFieldProps {
  path: PathFormPath;
  defaultValue: any; // TODO generics?
  render: (props: any, meta: any) => React.ReactElement; // TODO React.ReactNode vs ReactElement ???
}

export const PathFormProvider: React.FC<PathFormProviderProps> = ({ children, initialRenderValues }) => {
  const state = React.useRef({
    store: createStore(initialRenderValues),
    defaults: initialRenderValues,
  });
  const watchers = React.useRef(eventEmitter());

  // TODO consider proxy OR passed to `handleSubmit`
  (state.current as any).asSubmitData = () => parseStore(state.current.store);

  return <PathFormStateContext.Provider value={{ state, watchers }}>{children}</PathFormStateContext.Provider>;
};

export function usePathForm() {
  const context = React.useContext(PathFormStateContext) as PathFormStateContext;
  if (!context) {
    throw new Error('`usePathForm` must be used within a `PathFormProvider`');
  }
  return context;
}

export const usePathFormDotPath = (path: PathFormPath) => React.useMemo(() => toDotPath(path), [path]);
export const usePathFormStorePath = (path: PathFormPath) => React.useMemo(() => toStorePath(path), [path]);

export const usePathFormValue = (path: PathFormPath, defaultValue?: any) => {
  // internal state is how we force trigger re-render, by increase renders
  const [, setRenders] = React.useState(0);
  const { state, watchers } = usePathForm();
  const dotpath = usePathFormDotPath(path);
  const storePath = usePathFormStorePath(path);
  const storeItem = get(state.current.store, storePath);
  const defaultStoreItemValue = createStoreItem(defaultValue);

  // only on initial mount, if value does not exist, set the defaultValue
  // this happens asynchronously but the returned value on first render will be synced immediately
  React.useEffect(() => {
    // if the store item is not there, create it
    if (storeItem?.value === undefined) {
      set(state.current.store, storePath, defaultStoreItemValue);
    }
    // thank you for looking out for us eslint
    // but we only want this to happen on the initial mount
    // eslint-disable-next-line
  }, []);

  React.useEffect(() => {
    // subscribe to updates on this dotpath to trigger re-render by increasing internal renders
    const unsubscribe = watchers.current.on(dotpath, () => {
      setRenders((r) => r + 1);
    });

    // on unmount, unsubscribe by calling the function
    return () => unsubscribe();
  }, [dotpath, watchers]);

  const { meta, value = defaultValue } = storeItem || {};

  // renders is increased, but `value` and `meta` are pulled at the time of render
  return React.useMemo(() => {
    return { value, meta };
  }, [value, meta]);
};

export function usePathFormActions() {
  const { state, watchers } = usePathForm();

  return React.useMemo(() => {
    return {
      getValues: () => {
        return parseStore(state.current.store);
      },

      setValue: (path: PathFormPath, value: any) => {
        const storePath = toStorePath(path);
        const storeItem = get(state.current.store, storePath); // TODO default value based on value here?

        // TODO if storeItem not found / setup new storeItem

        // only update store & emit to subscribers if value changed
        if (storeItem?.value !== value) {
          set(state.current.store, [...storePath, 'value'], value);
          watchers.current.emit(toDotPath(path), value);
        }
      },

      setTouched: (path: PathFormPath, touched: boolean) => {
        const dotpath = toDotPath(path);
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
      },

      clearError: (path: PathFormPath) => {
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
      },

      addError: (path: PathFormPath, error: PathFormError) => {
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
      },

      // TODO dry-ify these target array mutations
      // validate that the storeItem is an array, do some callback action, and emit
      array: {
        // TODO a lot of repeated code here can be DRY-ified
        append: (path: PathFormPath, item: any) => {
          const dotpath = toDotPath(path);
          const targetArrayStoreItem = get(state.current.store, toStorePath(path));

          // validate that the target value is an array
          if (targetArrayStoreItem?.type !== 'array' || !Array.isArray(targetArrayStoreItem?.value)) {
            throw new TypeError(`The target path "${dotpath}" is not an array.`);
          }

          // mutate the target store item
          targetArrayStoreItem.value.push(createStoreItem(item));

          // notify subscribers
          watchers.current.emit(dotpath, targetArrayStoreItem);
        },

        prepend: (path: PathFormPath, item: any) => {
          const dotpath = toDotPath(path);
          const targetArrayStoreItem = get(state.current.store, toStorePath(path));

          // validate that the target value is an array
          if (targetArrayStoreItem?.type !== 'array' || !Array.isArray(targetArrayStoreItem?.value)) {
            throw new TypeError(`The target path "${dotpath}" is not an array.`);
          }

          // mutate the store item
          targetArrayStoreItem.value.unshift(createStoreItem(item));

          // notify subscribers
          watchers.current.emit(dotpath, targetArrayStoreItem);
        },

        move: (path: PathFormPath, fromIndex: number, toIndex: number) => {
          const dotpath = toDotPath(path);
          const targetArrayStoreItem = get(state.current.store, toStorePath(path));

          // validate that the target value is an array
          if (targetArrayStoreItem?.type !== 'array' || !Array.isArray(targetArrayStoreItem?.value)) {
            throw new TypeError(`The target path "${dotpath}" is not an array.`);
          }

          // mutate the target array
          arrayMove(targetArrayStoreItem.value, fromIndex, toIndex);

          // notify subscribers
          watchers.current.emit(dotpath, targetArrayStoreItem);
        },

        remove: (path: PathFormPath, index: number) => {
          const dotpath = toDotPath(path);
          const targetArrayStoreItem = get(state.current.store, toStorePath(path));

          // validate that the target value is an array
          if (targetArrayStoreItem?.type !== 'array' || !Array.isArray(targetArrayStoreItem?.value)) {
            throw new TypeError(`The target path "${dotpath}" is not an array.`);
          }

          // mutate the target array
          arrayRemove(targetArrayStoreItem.value, index);

          // notify subscribers
          watchers.current.emit(dotpath, targetArrayStoreItem);
        },
      },
    };
  }, [state, watchers]);
}

export const PathFormField: React.FC<PathFormFieldProps> = ({ path, render, defaultValue }) => {
  const name = usePathFormDotPath(path);
  const { value, meta } = usePathFormValue(path, defaultValue); // TODO defaultValue needed?

  const { setValue, setTouched, clearError } = usePathFormActions();

  const onChange = React.useCallback(
    (event: any) => {
      // TODO handle all sorts of values
      const value = event?.target?.value ?? event;
      setValue(path, value); // TODO { shouldValidate: shouldValidate, shouldDirty: true }

      // TODO dirty ? or do that in setValue ?
    },
    [path, setValue]
  );

  // TODO onBlur, ref
  const onBlur = React.useCallback(
    (event: any) => {
      // TODO handle all sorts of values
      const blurValue = event?.target?.value ?? event;

      // if the field has an error, and our blur value is different than the error value, clear the error
      if (Boolean(meta?.error) && blurValue !== meta?.error?.value) {
        clearError(path);
      }

      // TODO why is meta not updating correctly on some of these?
      if (meta?.touched === false) {
        setTouched(path, true);
      }
    },
    [path, clearError, setTouched, meta]
  );

  return render(
    {
      name,
      value,
      onChange,
      onBlur,
      key: meta?.uuid, // not sure about using key on everything yet...
    },
    meta
  );
};

export const PathFormArray: React.FC<PathFormFieldProps> = ({ path, render }) => {
  const { state } = usePathForm();
  const { value: rows } = usePathFormValue(path);

  return rows?.length
    ? rows.map((row: any, index: number) => {
        const isLast = index + 1 === rows.length;
        const isFirst = index === 0;
        const totalRows = rows.length;
        const arrayPath = path;
        const itemPath = [...arrayPath, index];
        const storeItem = get(state.current.store, toStorePath(itemPath));
        const { meta } = storeItem || {}; // TODO default

        return (
          <PathFormArrayRow
            key={meta?.key || index}
            {...{
              arrayPath,
              itemPath,
              index,
              isLast,
              isFirst,
              totalRows,
              meta,
              render,
            }}
          />
        );
      })
    : null;
};

type PathFormArrayRowProps = {
  arrayPath: PathFormPath;
  itemPath: PathFormPath;
  index: number;
  isLast: boolean;
  isFirst: boolean;
  totalRows: number;
  meta: PathFormStoreMeta; // TODO
  render: (props: any, meta: any) => React.ReactElement; // TODO React.ReactNode vs ReactElement ???
};

const PathFormArrayRow: React.FC<PathFormArrayRowProps> = ({ render, meta, ...props }) => {
  return render(props, meta);
};
