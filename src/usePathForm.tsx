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
import { flattenStore, PathFormStoreItemFlat } from './storeUtils';

export type PathFormValuePrimitive = string | number | boolean | null;

export type PathFormState = {
  store: PathFormStore;
  errors: PathFormStoreItemFlat[];
  defaults: object;
};

export type PathFormPath = Array<string | number>; // | string;

export type PathFormError = {
  type: string;
  message: React.ReactNode;
  value?: any;
};

export type PathFormErrorOptions = {
  publish?: boolean;
};

export type PathFormStoreMeta = {
  uuid: string;
  dirty: boolean;
  touched: boolean;
  error: null | PathFormError;
  validations: null | Array<PathFormValidation>;
};

// TODO omit error?
export type PathFormStoreSetMeta = Partial<Omit<PathFormStoreMeta, 'uuid'>>;

export type PathFormValidation =
  | { type: 'required'; message: string }
  | { type: 'minLength' | 'maxLength' | 'min' | 'max'; value: number; message: string }
  | { type: 'regex'; value: string; flags?: string; message: string };

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
  setMeta: (path: PathFormPath, meta: PathFormStoreSetMeta) => any;
  addError: (path: PathFormPath, error: PathFormError) => any;
  clearError: (path: PathFormPath) => any;
  clearErrors: (paths?: PathFormPath[]) => any;
  forEachStoreItem: (callback: (item: PathFormStoreItemFlat) => any) => any;
  validate: (path: PathFormPath) => any;
  validateStore: () => any; // TODO throws?
};

export type PathFormArrayUtils = {
  append: (path: PathFormPath, item: any) => any;
  prepend: (path: PathFormPath, item: any) => any;
  remove: (path: PathFormPath, index: number) => any;
  move: (path: PathFormPath, fromIndex: number, toIndex: number) => any;
};

export interface PathFormPublishOptions {
  path?: PathFormPath;
  // paths?: Array<PathFormPath?; // TODO publish to multiple paths
  // up?: number; // TODO publish parent / up N levels
  // down?: number; // TODO publish child / down N levels
}

// eslint-disable-next-line
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
  const state = React.useRef<PathFormState>({
    store: createStore(initialRenderValues),
    errors: [],
    defaults: initialRenderValues,
  });
  const watchers = React.useRef(eventEmitter());

  const getValues = () => {
    return parseStore(state.current.store);
  };

  const validateStore = () => {
    const flattenedStoreItems = flattenStore(state.current.store);

    // validate at every path
    flattenedStoreItems.forEach(({ path }) => {
      validate(path);
    });

    // look for at least one error
    const errors = flattenedStoreItems.filter(({ storeItem }) => {
      return !!storeItem.meta.error;
    });

    // throw to stop submission
    if (errors.length) {
      throw errors;
    }
  };

  const forEachStoreItem = (callback: (item: PathFormStoreItemFlat) => any) => {
    const flattenedStoreItems = flattenStore(state.current.store);
    flattenedStoreItems.forEach(callback);
  };

  const validate = (path: PathFormPath) => {
    const dotpath = toDotPath(path); // cant use hooks inside
    const storePath = toStorePath(path);
    const storeItem = get(state.current.store, storePath) as PathFormStoreItem;

    // validate that the target store item exists
    if (storeItem === undefined) {
      throw new Error(`The target path "${dotpath}" does not exist.`);
    }

    if (storeItem.meta.validations) {
      storeItem.meta.validations.forEach((validation) => {
        if (storeItem.type === 'primitive') {
          if (validation.type === 'required') {
            if (storeItem.value === null || (typeof storeItem.value === 'string' && storeItem.value === '')) {
              addError(path, validation);
            }
          } else if (validation.type === 'min') {
            if (Number(storeItem.value) < validation.value) {
              addError(path, validation);
            }
          } else if (validation.type === 'max') {
            if (Number(storeItem.value) > validation.value) {
              addError(path, validation);
            }
          } else if (validation.type === 'minLength') {
            if (typeof storeItem.value === 'string' && storeItem.value.length < validation.value) {
              addError(path, validation);
            }
          } else if (validation.type === 'maxLength') {
            if (typeof storeItem.value === 'string' && storeItem.value.length > validation.value) {
              addError(path, validation);
            }
          } else if (validation.type === 'regex') {
            try {
              const regex = new RegExp(validation.value, validation.flags);

              if (typeof storeItem.value === 'string' && !regex.test(storeItem.value)) {
                addError(path, validation);
              }
            } catch (err) {
              // could not compile regex
            }
          }
        } else if (storeItem.type === 'array') {
          if (validation.type === 'minLength') {
            if (storeItem.value.length < validation.value) {
              addError(path, validation);
            }
          } else if (validation.type === 'maxLength') {
            if (storeItem.value.length > validation.value) {
              addError(path, validation);
            }
          }
        }
      });
    } else {
      // clearError(path);
    }
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

  const setMeta = (path: PathFormPath, meta: PathFormStoreSetMeta) => {
    const dotpath = toDotPath(path); // cant use hooks inside
    const storePath = toStorePath(path);
    const storeItem = get(state.current.store, storePath);

    // validate that the target store item exists
    if (storeItem === undefined) {
      throw new Error(`The target path "${dotpath}" does not exist.`);
    }

    // mutate the target store item meta with updated values
    const existing = get(state.current.store, [...storePath, 'meta']) as PathFormStoreMeta;
    Object.assign(existing, meta);

    // notify subscribers
    watchers.current.emit(dotpath, storeItem);
  };

  const addError = (path: PathFormPath, error: PathFormError, options?: PathFormErrorOptions) => {
    const dotpath = toDotPath(path);
    const storePath = toStorePath(path);
    const storeItem = get(state.current.store, storePath); // TODO default value based on value here?

    // validate that the target store item exists
    if (storeItem === undefined) {
      throw new Error(`The target path "${dotpath}" does not exist.`);
    }

    // mutate the target store item error
    set(state.current.store, [...storePath, 'meta', 'error'], error);

    // add to errors if not already added
    if (!state.current.errors.find((flatStoreItem) => flatStoreItem.dotpath === dotpath)) {
      state.current.errors.push({ dotpath, path, storeItem });

      // TODO if (options.publish !== false)
      // notify the errors subscribers
      if (options?.publish !== false) {
        watchers.current.emit('errors', state.current.errors);
      }
    }

    // notify each the dotpath subscribers
    watchers.current.emit(dotpath, storeItem);
  };

  /**
   * Remove the error at a given path.If a specific error is given,
   * then only that error will be removed.
   */
  function clearError(path: PathFormPath, error?: PathFormError, options?: PathFormErrorOptions) {
    const dotpath = toDotPath(path);
    const storePath = toStorePath(path);
    const storeItem = get(state.current.store, storePath);

    // validate that the target store item exists
    if (storeItem === undefined) {
      throw new Error(`The target path "${dotpath}" does not exist.`);
    }

    // mutate the target store item
    set(state.current.store, [...storePath, 'meta', 'error'], null);

    // remove from the errors array if found
    const errorIndex = state.current.errors.findIndex((flatStoreItem) => flatStoreItem.dotpath === dotpath);
    if (errorIndex > -1) {
      arrayRemove(state.current.errors, errorIndex);

      // TODO if (options.publish !== false)
      // notify the errors subscribers
      if (options?.publish !== false) {
        watchers.current.emit('errors', state.current.errors);
      }
    }

    // notify subscribers
    watchers.current.emit(dotpath, storeItem);
  }

  const clearErrors = () => {
    const flattenedStoreItems = flattenStore(state.current.store);

    // TODO filter all paths if given

    // validate at every path
    flattenedStoreItems.forEach(({ path }) => clearError(path));
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
    <PathFormStateContext.Provider
      value={{
        state,
        watchers,
        array,
        getValues,
        setValue,
        addError,
        clearError,
        clearErrors,
        setMeta,
        forEachStoreItem,
        validate,
        validateStore,
      }}
    >
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
