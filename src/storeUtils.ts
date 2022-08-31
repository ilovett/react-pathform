import {
  PathFormPath,
  PathFormStoreArray,
  PathFormStoreInput,
  PathFormStoreItem,
  PathFormStoreItemFlat,
  PathFormStoreMeta,
  PathFormStoreObject,
  PathFormStorePrimitive,
  PathFormValuePrimitive,
  PathFormValueType,
} from '.';
import { uuidv4 } from './uuidv4';
import { getValue, mapValues, setValue } from './utils';

export const get = (store: PathFormStoreItem, storePath: PathFormPath, defaultValue?: any) => {
  return getValue(store, storePath, defaultValue);
};

type PathFormSetStoreOptions = {
  validateParentPath?: boolean;
};

// TODO eventually this should recursively start from the root and update recursively
export const set = (store: PathFormStoreItem, storePath: PathFormPath, value: any, options?: PathFormSetStoreOptions) => {
  const result = setValue(store, storePath, value);

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
export const validateNewStorePath = (store: PathFormStoreItem, storePath: PathFormPath) => {
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
  // for root store item return nothing
  if (path.length === 0) {
    return [];
  }

  return path.reduce(
    (memo, current, index, arr) => {
      memo.push(current);

      // dont access the target items value,
      // we want the store item itself (the parent of the value)
      if (index + 1 < arr.length) {
        memo.push('value');
      }

      return memo;
    },

    // start with root storeItem value
    ['value'] as PathFormPath
  );
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
 * @param [deleteCount=1] the number of items to delete. Default is 1.
 * @todo performance improvements
 */
export const arrayRemove = (arr: any[], index: number, deleteCount: number = 1): void => {
  arr.splice(index, deleteCount);
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

export const createStoreItemArray = (item: any[], { recursive = true }: { recursive?: boolean } = {}): PathFormStoreArray => {
  const value = recursive ? item.map((i) => createStoreItem(i, { recursive })) : item;
  const defaultFieldUuids = value.map((i) => i.meta.uuid);

  return {
    type: 'array',
    meta: { ...createStoreItemMeta(item), defaultFieldUuids },
    value,
  };
};

export const createStoreItemObject = (item: any, { recursive = true }: { recursive?: boolean } = {}): PathFormStoreObject => {
  const value = recursive ? mapValues(item, (i) => createStoreItem(i, { recursive })) : item;

  return {
    type: 'object',
    meta: createStoreItemMeta(item),
    value,
  };
};

export const createStoreItem = (item: any, { recursive = true }: { recursive?: boolean } = {}): PathFormStoreItem => {
  if (Array.isArray(item)) {
    return createStoreItemArray(item, { recursive });
  } else if (Object(item) === item) {
    return createStoreItemObject(item, { recursive });
  } else {
    return createStoreItemPrimitive(item);
  }
};

// // TODO optional iterator or maxDepth ?
// export const createStore = (input: PathFormStoreInput): PathFormStoreItem => {

//   // TODO why the fuck am i mapValues on object/array ???
//   // cant I not just pass `createStoreItem(input` ?)
//   const result = mapValues(input, (i) => createStoreItem(i));
//   debugger;
//   const root = createStoreItem(result);
//   debugger;
//   // avoid recursion at the room
//   if (Array.isArray(result)) {
//     // TODO
//     return createStoreItemArray(result, { convertValue: false });
//     // return createStoreItemArray(result);
//   } else if (Object(result) === result) {
//     // avoid
//     return {
//       type: 'object',
//       meta: createStoreItemMeta(result),
//       value: result,
//     };
//   } else {
//     return createStoreresultPrimitive(result);
//   }

//   return root;
// };

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

// TODO redundant?
// export const parseStore = (store: PathFormStore): object => {
//   return mapValues(store, (i) => parseStoreItem(i));
// };

// /**
//  * Creates a flat collection of every store item associated
//  * with a `path` and `dotpath` which can be iterated over.
//  *
//  * @param store
//  * @returns
//  */
// export const flattenStore = (store: PathFormStore) => {
//   const flattened: Array<PathFormStoreItemFlat> = [];

//   Object.keys(store).forEach((key) => {
//     const storeItem = store[key];
//     const basePath = [key];
//     flattenStoreItem(flattened, basePath, storeItem);
//   });

//   return flattened;
// };

export const flattenStoreItem = (storeItem: PathFormStoreItem, path: PathFormPath = [], flattened: Array<PathFormStoreItemFlat> = []) => {
  if (storeItem.type === 'array') {
    flattenStoreItemArray(storeItem, path, flattened);
  } else if (storeItem.type === 'object') {
    flattenStoreItemObject(storeItem, path, flattened);
  } else {
    flattenStoreItemPrimitive(storeItem, path, flattened);
  }

  return flattened;
};

export const flattenStoreItemArray = (storeItem: PathFormStoreArray, path: PathFormPath, flattened: Array<PathFormStoreItemFlat>) => {
  flattened.push({ dotpath: toDotPath(path), path: path, storeItem });

  storeItem.value.forEach((childItem, index) => {
    flattenStoreItem(childItem, [...path, index], flattened);
  });
};

export const flattenStoreItemPrimitive = (
  storeItem: PathFormStorePrimitive,
  path: PathFormPath,
  flattened: Array<PathFormStoreItemFlat>
) => {
  flattened.push({ dotpath: toDotPath(path), path, storeItem });
};

export const flattenStoreItemObject = (storeItem: PathFormStoreObject, path: PathFormPath, flattened: Array<PathFormStoreItemFlat>) => {
  flattened.push({ dotpath: toDotPath(path), path: path, storeItem });

  Object.keys(storeItem.value).forEach((key) => {
    const childStoreItem = storeItem.value[key];
    flattenStoreItem(childStoreItem, [...path, key], flattened);
  });
};
