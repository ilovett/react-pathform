export type PathFormArrayItemProps = {
  arrayPath: PathFormPath;
  arrayUtils: PathFormArrayUtils;
  itemPath: PathFormPath;
  index: number;
  isLast: boolean;
  isFirst: boolean;
  totalRows: number;
  meta: PathFormStoreMeta;
};

export type PathFormArrayEmptyProps = {
  arrayPath: PathFormPath;
  arrayUtils: PathFormArrayUtils;
  meta: PathFormStoreMeta;
};

export interface PathFormArrayWrapperItemProps {
  itemProps: PathFormArrayItemProps;
  renderItem: (props: PathFormArrayItemProps) => React.ReactElement;
}

export interface PathFormArrayWrapperEmptyProps {
  emptyProps: PathFormArrayEmptyProps;
  renderEmpty: (props: PathFormArrayEmptyProps) => React.ReactElement;
}

export interface PathFormArrayProps {
  path: PathFormPath;
  defaultValue: any;
  renderItem: (props: PathFormArrayItemProps) => React.ReactElement;
  renderEmpty?: (props: PathFormArrayEmptyProps) => React.ReactElement;
}

export type PathFormValuePrimitive = string | number | boolean | null;

export type PathFormValidationMode = 'onSubmit' | 'onChange';

export type PathFormStoreItemFlat = {
  dotpath: string;
  path: PathFormPath;
  storeItem: PathFormStoreItem;
};

export type PathFormState = {
  store: PathFormStoreItem;
  dirtyUuids: string[];
  errors: PathFormStoreItemFlat[];
  defaultValues: any;
  mode: PathFormValidationMode;
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

// export type PathFormStore = {
//   [key: string]: PathFormStoreItem;
// };

export type PathFormResetOptions = {
  defaultValues?: any;
};

export type PathFormWatcher = Readonly<{
  on: (name: string, fn: (data?: any) => any) => any;
  emit: (name: string, data: any) => any;
}>;

export type PathFormStateContextInitialized = {
  state: null;
  watchers: null;
};

export type PathFormStateContext = {
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
  /**
   * Append an `item` to the end of a collection at the given `path`.
   *
   * @example
   * array.append([...path], 'last')
   *
   * @param path The path to the collection in the store.
   * @param item New item to append.
   */
  append: (path: PathFormPath, item: any) => any;

  /**
   * Insert `items` into a collection at the given `path` / `index`.
   *
   * @example
   * array.insert([...path], 4, 'new-1')
   *
   * @example
   * array.insert([...path], 4, 'new-1', 'new-2', 'new-3')
   *
   * @param path The path to the collection in the store.
   * @param index The index at which to insert the new items at the given path.
   * @param items New items to insert.
   */
  insert: (path: PathFormPath, index: number, ...items: any[]) => any;

  /**
   * Move an item in a collection at the given `path` from the
   * `fromIndex` to the `toIndex`.
   *
   * @example
   * array.move([...path], 1, 4)
   *
   * @param path The path to the collection in the store.
   * @param fromIndex The index to move the item from.
   * @param toIndex The index to move the item to.
   */
  move: (path: PathFormPath, fromIndex: number, toIndex: number) => any;

  /**
   * Prepend an `item` to the beginning of a collection at the given `path`.
   *
   * @example
   * array.prepend([...path], 'first')
   *
   * @param path The path to the collection in the store.
   * @param item New item to prepend.
   */
  prepend: (path: PathFormPath, item: any) => any;

  /**
   * Splice the array at the given `path`.
   *
   * @example
   * // replace 2 items at index 5
   * array.splice([...path], 5, 2, 'replace-1', 'replace-2')
   *
   * @param path The path to the collection in the store.
   * @param index The index the splice at.
   * @param deleteCount The number of items to remove.  Defaults to 0.
   * @param items New items to insert.
   */
  splice: (path: PathFormPath, index: number, deleteCount: number, ...items: any) => any;

  /**
   * Remove one or more items from a collection at the given `path` / `index`.
   * Remove N items by passing `deleteCount`, which defaults to 1.
   *
   * @example
   * // remove item at index 3
   * array.remove([...path], 3)
   *
   * @example
   * // remove 5 items starting at index 2
   * array.remove([...path], 2, 5)
   *
   * @param path The path to the collection in the store.
   * @param item New item to prepend.
   */
  remove: (path: PathFormPath, index: number, deleteCount?: number) => any;
};

export interface PathFormPublishOptions {
  path?: PathFormPath;
  // paths?: Array<PathFormPath?; // TODO publish to multiple paths
  // up?: number; // TODO publish parent / up N levels
  // down?: number; // TODO publish child / down N levels
}
