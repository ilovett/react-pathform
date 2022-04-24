import lodashSet from 'lodash/set';
import lodashGet from 'lodash/get';
import lodashIsEqual from 'lodash/isEqual';
import lodashMapValues from 'lodash/mapValues';
import { ObjectIterator } from 'lodash';

import {
  PathFormPath,
  PathFormStore,
  PathFormStoreArray,
  PathFormStoreInput,
  PathFormStoreItem,
  PathFormStoreMeta,
  PathFormStoreObject,
  PathFormStorePrimitive,
  PathFormValuePrimitive,
  PathFormValueType,
} from './usePathForm';
import { uuidv4 } from './uuidv4';

// tree shakeable wrappers
// TODO eventually completely remove these 3rd party library dependencies
export const get = (store: PathFormStore, storePath: PathFormPath, defaultValue?: any) => {
  return lodashGet(store, storePath, defaultValue);
};

type PathFormSetStoreOptions = {
  validateParentPath?: boolean;
};

// TODO eventually this should recursively start from the root and update recursively
export const set = (store: PathFormStore, storePath: PathFormPath, value: any, options?: PathFormSetStoreOptions) => {
  const result = lodashSet(store, storePath, value);

  // ensure types and meta are set on parent paths
  // there is a bug here when setting on path where the last item is not 'value' -- IE: when set(.., [..., 'meta'])
  if (options?.validateParentPath === true) {
    validateNewStorePath(store, storePath);
  }

  return result;
};

/**
 * Recursively traverses up the path to root to ensure the newly created
 * path types are set at each level.
 *
 * @param store
 * @param storePath
 */
export const validateNewStorePath = (store: PathFormStore, storePath: PathFormPath) => {
  const storeItem = get(store, storePath);

  // assign the type if missing and create meta
  if (!storeItem.type) {
    storeItem.type = typeOf(storeItem.value);
    storeItem.meta = createStoreItemMeta();
  }

  // always go up the path to the root, stop at the root
  if (storePath.length > 2) {
    validateNewStorePath(store, storePath.slice(0, storePath.length - 2));
  }
};

export const mapValues = <T>(obj: object, callback: ObjectIterator<object, T>): any => {
  return lodashMapValues(obj, callback);
};

export const isEqual = (a: any, b: any) => {
  return lodashIsEqual(a, b);
};

/**
 * Sugar function for returning the value type, while differing between object and array.
 * Since an array is an object, checks if array first, then object, otherwise its a primitive value.
 *
 * @param value The value to check the type of.
 * @returns PathFormValueType
 */
export const typeOf = (value: any): PathFormValueType => {
  if (Array.isArray(value)) {
    return 'array';
  } else if (Object(value) === value) {
    return 'object';
  } else {
    return 'primitive';
  }
};

/**
 * Sugar function for comparing two values.
 *
 * @param a Any unknown value (object, array, primitive).
 * @param b Any unknown value (object, array, primitive).
 * @returns Returns `true` if the object types match, otherwise `false`.
 */
export const typesMatch = (a: any, b: any) => {
  return typeOf(a) === typeOf(b);
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

/**
 * Convert a `PathFormPath` to dotpath string.
 *
 * @example
 * toDotPath(['items', 0, 'firstName']);
 * // returns 'items[0].firstName'
 *
 * @param path An array of strings or numbers of nested objects and arrays.
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
 * @example
 * fromDotPath('nested.items[0].name');
 * // returns ['nested', 'items', 0, 'name']
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

export const createStoreItemMeta = (defaultValue?: any): PathFormStoreMeta => {
  return {
    uuid: uuidv4(),
    dirty: false,
    touched: false,
    error: null,
    validations: null,
    defaultValue,
  };
};

export const createStoreItemPrimitive = (item: any): PathFormStorePrimitive => {
  return {
    type: 'primitive',
    meta: createStoreItemMeta(item),
    value: item,
  };
};

export const createStoreItemArray = (item: any[]): PathFormStoreArray => {
  const value = item.map((i) => createStoreItem(i));
  const defaultFieldUuids = value.map((i) => i.meta.uuid);

  return {
    type: 'array',
    meta: { ...createStoreItemMeta(item), defaultFieldUuids },
    value,
  };
};

export const createStoreItemObject = (item: any): PathFormStoreObject => {
  return {
    type: 'object',
    meta: createStoreItemMeta(item),
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
  } else if (item.type === 'primitive') {
    return parseStoreItemPrimitive(item);
  } else {
    console.error('Unable to parse store item', item);
    throw new Error('Unable to parse store item.');
  }
};

export const parseStore = (store: PathFormStore): object => {
  return mapValues(store, (i) => parseStoreItem(i));
};

export type PathFormStoreItemFlat = {
  dotpath: string;
  path: PathFormPath;
  storeItem: PathFormStoreItem;
};

/**
 * Creates a flat collection of every store item associated
 * with a `path` and `dotpath` which can be iterated over.
 *
 * @param store
 * @returns
 */
export const flattenStore = (store: PathFormStore) => {
  const flattened: Array<PathFormStoreItemFlat> = [];

  Object.keys(store).forEach((key) => {
    const storeItem = store[key];
    const basePath = [key];
    flattenStoreItem(flattened, basePath, storeItem);
  });

  return flattened;
};

export const flattenStoreItem = (flattened: Array<PathFormStoreItemFlat>, basePath: PathFormPath, storeItem: PathFormStoreItem) => {
  if (storeItem.type === 'array') {
    flattenStoreItemArray(flattened, basePath, storeItem);
  } else if (storeItem.type === 'object') {
    flattenStoreItemObject(flattened, basePath, storeItem);
  } else {
    flattenStoreItemPrimitive(flattened, basePath, storeItem);
  }
};

export const flattenStoreItemArray = (flattened: Array<PathFormStoreItemFlat>, basePath: PathFormPath, storeItem: PathFormStoreArray) => {
  flattened.push({ dotpath: toDotPath(basePath), path: basePath, storeItem });

  storeItem.value.forEach((childItem, index) => {
    flattenStoreItem(flattened, [...basePath, index], childItem);
  });
};

export const flattenStoreItemPrimitive = (
  flattened: Array<PathFormStoreItemFlat>,
  basePath: PathFormPath,
  storeItem: PathFormStorePrimitive
) => {
  flattened.push({ dotpath: toDotPath(basePath), path: basePath, storeItem });
};

export const flattenStoreItemObject = (flattened: Array<PathFormStoreItemFlat>, basePath: PathFormPath, storeItem: PathFormStoreObject) => {
  flattened.push({ dotpath: toDotPath(basePath), path: basePath, storeItem });

  Object.keys(storeItem.value).forEach((key) => {
    const childStoreItem = storeItem.value[key];
    flattenStoreItem(flattened, [...basePath, key], childStoreItem);
  });
};
