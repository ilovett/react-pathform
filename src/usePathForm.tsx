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
import { noDifference } from './utils';

export type PathFormValuePrimitive = string | number | boolean | null;

export type PathFormState = {
  store: PathFormStore;
  dirtyUuids: string[];
  errors: PathFormStoreItemFlat[];
  defaultValues: any;
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
  defaultValue: any;
};

// TODO omit error?
export type PathFormStoreSetMeta = Partial<Omit<PathFormStoreMeta, 'uuid'>>;

export type PathFormValidation =
  | { type: 'required'; message: string }
  | { type: 'minLength' | 'maxLength' | 'min' | 'max'; value: number; message: string }
  | { type: 'regex'; value: RegExp; message: string }
  | { type: 'custom'; value: (value: any, store?: any) => boolean; message: string };

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
  meta: PathFormStoreMeta & { defaultFieldUuids: string[] };
  value: Array<PathFormStoreItem>;
};

export type PathFormStoreItem = PathFormStorePrimitive | PathFormStoreObject | PathFormStoreArray;

export type PathFormStoreInput = {
  [key: string]: any;
};

export type PathFormStore = {
  [key: string]: PathFormStoreItem;
};

export type PathFormResetOptions = {
  defaultValues?: any;
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
  isDirty: () => boolean;
  reset: (options?: PathFormResetOptions) => any;
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

export interface PathFormProviderProps {
  initialRenderValues?: any; // TODO generics or something
  children: React.ReactNode;
}

export const PathFormProvider: React.FC<PathFormProviderProps> = ({ children, initialRenderValues }) => {
  const state = React.useRef<PathFormState>({
    store: createStore(initialRenderValues),
    dirtyUuids: [],
    errors: [],
    defaultValues: initialRenderValues,
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
        // do nothing if the store item already has a validation error
        // TODO this may eventually get eliminated once a field can have multiple errors
        if (storeItem.meta.error) {
          return;
        }

        if (validation.type === 'custom') {
          if (!(validation.value && validation.value(storeItem.value, getValues()))) {
            addError(path, validation);
          }
        } else if (storeItem.type === 'primitive') {
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
              const regex = validation.value;
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

      // check if field is dirty
      const dirty = storeItem?.meta.defaultValue !== value;

      // if dirty value changes, add or remove from dirtyFields
      if (!!storeItem && dirty !== storeItem.meta.dirty) {
        // determine if previously dirty
        const dirtyIndex = state.current.dirtyUuids.indexOf(storeItem.meta.uuid);

        // not dirty anymore, but previously dirty
        if (!dirty && dirtyIndex >= 0) {
          arrayRemove(state.current.dirtyUuids, dirtyIndex);
        }
        // dirty and not previously dirty
        else if (dirty && dirtyIndex < 0) {
          state.current.dirtyUuids.push(storeItem.meta.uuid);
        }

        watchers.current.emit('dirty', state.current.dirtyUuids);
      }

      set(state.current.store, [...storePath, 'meta', 'dirty'], dirty);

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
    const targetArrayStoreItem = get(state.current.store, toStorePath(path)) as PathFormStoreArray | undefined;

    // validate that the target value is an array
    if (targetArrayStoreItem?.type !== 'array' || !Array.isArray(targetArrayStoreItem?.value)) {
      throw new TypeError(`The target path "${dotpath}" is not an array.`);
    }

    // do the mutation
    mutate(targetArrayStoreItem);

    // dirty checks on array field
    // compare new array of fields uuid structure
    const currentFieldUuids = targetArrayStoreItem.value.map((storeItem) => storeItem.meta.uuid);
    const dirtyIndex = state.current.dirtyUuids.indexOf(targetArrayStoreItem.meta.uuid);

    // if current field state is equal to default state field uuids
    // unmark it as dirty
    if (noDifference(currentFieldUuids, targetArrayStoreItem.meta.defaultFieldUuids)) {
      targetArrayStoreItem.meta.dirty = false;

      // remove it from the dirty uuids if found
      if (dirtyIndex >= 0) {
        arrayRemove(state.current.dirtyUuids, dirtyIndex);
        watchers.current.emit('dirty', state.current.dirtyUuids);
      }
    }
    // fields look different
    else {
      targetArrayStoreItem.meta.dirty = true;

      // and not already dirty, save the array uuid to dirty fields
      if (dirtyIndex === -1) {
        state.current.dirtyUuids.push(targetArrayStoreItem.meta.uuid);
        watchers.current.emit('dirty', state.current.dirtyUuids);
      }
    }

    // notify subscribers
    watchers.current.emit(dotpath, targetArrayStoreItem);
  };

  /**
   * Returns `true` if at least one field has been modified in the form.
   */
  function isDirty() {
    return state.current.dirtyUuids.length > 0;
  }

  /**
   * Resets the form to defaultValues, or updates the defaultValues if given.
   *
   * @param options
   */
  function reset(options: PathFormResetOptions = {}) {
    // TODO currrently im being lazy and just recreating the entire store
    // which gives us new uuids -- this may lead to bugs
    // a future improvement (and/or option for reset)
    // may be to keep original uuid values in place, if possible, by merge
    const newDefaultValues = typeof options.defaultValues !== 'undefined' ? options.defaultValues : state.current.defaultValues;
    const newStore = createStore(newDefaultValues);

    state.current.store = newStore;
    state.current.defaultValues = newDefaultValues;
    state.current.dirtyUuids = [];
    state.current.errors = [];

    // notify every store item to re-render
    forEachStoreItem((flatStoreItem) => watchers.current.emit(flatStoreItem.dotpath, flatStoreItem.storeItem.value));

    // notify store meta dirty / errors
    watchers.current.emit('dirty', state.current.dirtyUuids);
    watchers.current.emit('errors', state.current.errors);
  }

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
        isDirty,
        reset,
      }}
    >
      {children}
    </PathFormStateContext.Provider>
  );
};

export function usePathForm() {
  const context = React.useContext(PathFormStateContext) as PathFormStateContext;

  if (!context || context.state === null || context.watchers === null) {
    throw new Error('`usePathForm` must be used within a `PathFormProvider`');
  }

  return context;
}
