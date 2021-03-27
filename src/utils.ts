import lodashSet from 'lodash/set';
import lodashGet from 'lodash/get';
import lodashMapValues from 'lodash/mapValues';
import { v4 as uuidv4 } from 'uuid';
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

// tree shakeable wrappers
// TODO eventually completely remove these 3rd party library dependencies
export const get = (obj: object, path: PathFormPath, defaultValue?: any) => {
  return lodashGet(obj, path, defaultValue);
};

export const set = (obj: object, path: PathFormPath, value: any) => {
  return lodashSet(obj, path, value);
};

export const mapValues = <T>(obj: object, callback: ObjectIterator<object, T>): any => {
  return lodashMapValues(obj, callback);
};

export const uuid = () => {
  return uuidv4();
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
