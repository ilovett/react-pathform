# react-pathform

Pathform was built to scratch an itch for recursive, nested, dynamic forms.
Using paths as an array, we can spread nested fields around like butter.

We can derive a lot from the [path](#PathFormPath)... [Why is this useful?](#But-Y-Tho)

## Quick Start

```bash
npm install --save react-pathform

# or

yarn add react-pathform
```

```jsx
import React from 'react';
import { PathFormProvider, PathForm, PathFormField } from 'react-pathform';
import { Button, TextField } from '@material-ui/core';

function App() {
  return (
    <PathFormProvider
      initialRenderValues={{
        nested: {
          items: [{ name: "Joey Joe Joe Jr." }]
        }
      }}
    >
      <PathForm onSubmit={(values) => alert(JSON.stringify(values, null, 2))}>
        <PathFormField
          path={["nested", "items", 0, "name"]}
          defaultValue=""
          render={({ inputProps, meta }) => {
            return (
              <TextField
                label="Name"
                error={!!meta.error}
                helperText={meta.error?.message}
                {...inputProps}
              />
            );
          }}
        />

        <Button type="submit">Submit</Button>
      </PathForm>
    </PathFormProvider>
  );
}
```
[Try It on CodeSandbox](https://codesandbox.io/s/immutable-pond-qrkrn?file=/src/App.tsx)

<br/><br/>

## Example Code

Check out the [Example App](./example/README.md)

### CodeSandbox Examples

- [Simplest Example](https://codesandbox.io/s/immutable-pond-qrkrn?file=/src/App.tsx)

<br/><br/>

## API

- Components
  - [PathFormProvider (required)](#PathFormProvider-(required))
  - [PathForm](#PathForm)
  - [PathFormField](#PathFormField)
  - [PathFormArray](#PathFormArray)
  - [PathFormErrors](#PathFormErrors)
- Hooks
  - [usePathForm](#usePathForm)
  - [usePathFormValue](#usePathFormValue)

  <br/><br/>

### PathFormProvider (required)

The store context provider for your form.  You must place it at the root of your form to be able to use `usePathForm`, and `PathForm*` components.
The data in the store will remain until the `PathFormProvider` is unmounted.

#### PathFormProvider `initialRenderValues: values`

The initial data for your form on the *initial render only*.

#### PathFormProvider `mode?: 'onSubmit' | 'onChange'`

Set the mode in which the validation will happen.

- onSubmit (default): will run the validation when the form is submitted.
- onChange: Validation will trigger on the change event with each input, this may trigger multiple rerenders. The PathForm.onValidate will continue to be triggered on the submit event.

<br/><br/>

### PathForm

Renders a browser native `form` element and allows you to hook into `onValidate` and `onSubmit`.

#### PathForm `onValidate: (values: any)`

Called just before submitting.  Throw an error to stop `onSubmit` from triggering.

#### PathForm `onSubmit: (values: any)`

Called on successful submission after validation.

<br/><br/>

### PathFormField

Binds to a value at the given path in the store from.

#### PathFormField `path: PathFormPath`

The path selector to the item in your store.

#### PathFormField `defaultValue: any[]`

The value use on the initial render, if the store item does not already exist.

#### PathFormField `render(props: PathFormFieldProps)`

The callback to render the field.

#### PathFormField `prevs: PathFormValidation[]`

Register [validations](#PathFormValidation) for this field.

```tsx
<PathFormField
  path={['person', 0, 'name']}
  defaultValue=""
  validations={[
    { type: 'required', message: 'This person must have a name.' },
    { type: 'maxLength', value: 16, message: 'This must be less than 16 characters.' },
    { type: 'custom', value: (value) => value.trim().toLowerCase() !== 'joe', message: 'This person can\'t be Joe.' },
  ]}
  render={({ inputProps, meta }) => {
    return (
      <TextField
        label="Name"
        error={!!meta.error}
        helperText={meta.error?.message}
        {...inputProps}
      />
    );
  }}
/>
```

<br/><br/>

### PathFormArray

Binds to an array at the given path in the store from.  The `render` callback will be called for
each item in the array.<br/>
Use the `meta.uuid` on your root item `key`.<br/>

```tsx
<PathFormArray
  path={['path', 'to', 'array']}
  defaultValue={[]}
  renderItem={({ arrayPath, itemPath, index, totalRows, meta }) => (
    <div key={meta.uuid}>
      <NameField key={meta.uuid} path={[...itemPath, 'name']} />
      <button onClick={() => array.remove(arrayPath, index)} disabled={totalRows <= 1}>Delete</button>
    </div>
  )}
  renderEmpty={() => <>No Items!</>}
/>
```

### PathFormErrors

Provides an outlet to render all errors in the form in one place.
The `errors` given back are [flattened store items](#PathFormStoreItemFlat),
which wraps each store item with `path`, `dotpath`, and `storeItem`, which
you could use to pick or omit certain fields from rendering.

```tsx
<PathFormErrors
  render={(errors: Array<PathFormStoreItemFlat>) => {
    // you can pick or filter specific errors if you want
    return (
      <>
        {errors.map((error) => {
          return <AlertError message={error.storeItem.meta.error.message}>;
        }}
      </>
    );
  }}
/>
```

#### PathFormArray `path: PathFormPath`

The path selector to the item in your store.

#### PathFormArray `defaultValue: any[]`

The value use on the initial render, if the store item does not already exist.

#### PathFormArray `renderItem(props: PathFormArrayItemProps)`

The callback to render an item in the array.

#### PathFormArray `renderEmpty(props: PathFormArrayEmptyProps)`

The callback of what to render when the array is empty.

<br/><br/>

### usePathForm

Use this hook from any child component scope to access the context of your form.

Returns the form context provider `object` with helper functions:

```ts
const { setValue, setTouched, addError, clearError, reset, isDirty, array } = usePathForm();
```

#### `setValue(path: PathFormPath, value: any)`

Sets the store item `value` at the given `path`.

#### `setTouched(path: PathFormPath, touched: boolean)`

Marks the store item at the given path as `touched`.

#### `addError(path: PathFormPath, error: PathFormError)`

Adds an `error` at the given `path`.

#### `clearError(path: PathFormPath)`

Clears an `error` at the given `path`.

#### `reset(options?: PathFormResetOptions)`

Resets the form to existing `defaultValues` (from `initialRenderValues`), or changes and resets to new `defaultValues` if provided in options.

#### `isDirty()`

Checks if any fields in the form have are dirty.  You could use this to check for unsaved changes before navigating away.

#### `array: PathFormArrayUtils`

An object of utilities for mutating array items in your form.

```tsx
const { array } = usePathForm();
```

##### `append function(path: PathFormPath, item: any)`

Appends an `item` to the end of the array at given `path`.

```tsx
array.append(["deeply", "nested", "items"], { "name": "Santa's Little Helper" });
```

##### `prepend function(path: PathFormPath, item: any)`

Prepends an `item` to the beginning of the array at given `path`.

```tsx
array.prepend(["deeply", "nested", "items"], { "name": "Santa's Little Helper" });
```

##### `move function(path: PathFormPath, fromIndex: number, toIndex: number)`

Moves an `item` in the array at given `path`, from the `fromIndex` to the `toIndex`.  Useful for reordering items.

```tsx
array.move(["deeply", "nested", "items"], 3, 4);
```

##### `remove function(path: PathFormPath, index: number)`

Removes an `item` from the array at given `path` at `index`.

```tsx
array.remove(["deeply", "nested", "items"], 2);
```

<br/><br/>

### usePathFormValue

Returns an array of `[value, meta]` at the given `path`.

```ts
const [nameValue, nameMeta] = usePathFormValue(['person', 'name']);
const [ageValue, ageMeta] = usePathFormValue(['person', 'age']);
```

<br/><br/>

## Validation

### Native

`react-pathform` has basic [validators](#PathFormValidation) which you can define on each field.

```tsx
<PathFormField
  path={['email']}
  defaultValue=""
  validators={[
    { type: 'required', message: 'Email is required' },
    { type: 'regex', value: REGEX_EMAIL, message: 'Email is invalid' },
  ]}
  render={({ inputProps, meta }) => {
    return (
      <TextField
        label="Email"
        placeholder="you@example.com"
        {...inputProps}
        error={!!meta.error}
        helperText={meta.error?.message}
      />
    )
  }}
/>
```

### Yup

You can validate against a `yup` schema with `validateYupSchema`.

```jsx
<PathForm
  onValidate={validateYupSchema(schema)}
  onSubmit={(values) => {
    // validated!
    console.log(values);
  }}
>
```

### Other

You can Bring Your Own Validator.
Take a look at [validateYupSchema](./src/validators.ts).


## Types

### PathFormPath

```ts
type PathFormPath = Array<string | number>;

const path: PathFormPath = ["deeply", "nested", "items", 0, "children", 0, "name"];
```

The path to an item in your form.<br/>Strings imply object property.<br/>Numbers imply array index.

### PathFormInputProps

The input props to hook your store into your component.

```ts
type PathFormInputProps = {
  name: string;
  value: any;
  onChange: (event?: any, value?: any) => any;
  onBlur: (event?: any) => any;
}
```

### PathFormValidation

```ts
type PathFormValidation =
  | { type: 'required'; message: string }
  | { type: 'minLength' | 'maxLength' | 'min' | 'max'; value: number; message: string }
  | { type: 'regex'; value: RegExp; message: string }
  | { type: 'custom'; value: (value: any, store?: any) => boolean; message: string };
```

### PathFormError

```ts
type PathFormError = {
  type: string;
  message: string;
  value: any;
};
```

### PathFormStoreMeta

```ts
type PathFormStoreMeta = {
  uuid: string;
  dirty: boolean;
  touched: boolean;
  error: null;
};
```

### PathFormStoreItemFlat

```ts
type PathFormStoreItemFlat = {
  dotpath: string;
  path: PathFormPath;
  storeItem: PathFormStoreItem;
};
```

### PathFormResetOptions

```ts
type PathFormResetOptions = {
  defaultValues?: any;
}
```

<br/><br/>

## But Y Tho?

I have loved many form react form libraries (*wow, holy **nerd** right?*).  I have gone from [redux-form](https://github.com/redux-form/redux-form)
to [react-final-form](https://github.com/final-form/react-final-form) to [formik](https://github.com/formium/formik)
to [react-hook-form](https://github.com/react-hook-form/react-hook-form).  They are all amazing libraries.  This project
aims to provide all the best things from each library: the global control of redux-form, the observable model of react-final-form,
the api of formik, and the performance of react-hook-form.

These libraries use the native input property `name` as a dot notation string to bind or select data:

```ts
const name = "deeply.nested.items[0].children[0].name";
```

Whereas this library *derives* the input `name` *from* the `path`.  The difference is,
you can easily spread arrays, not strings.

```ts
// name="deeply.nested.items"
const parentPath = ["deeply", "nested", "items"];

// name="deeply.nested.items[0].children"
const childPath = [...parentPath, itemIndex, "children"];

// name="deeply.nested.items[0].children[0].name"
const deepPath = [...childPath, childIndex, "name"];
```

This makes nested / recursive form components much cleaner.

![explaining pathform to people who prefer other form libraries](https://i.imgflip.com/4x9w4x.jpg)

The internal form store wraps the form structure alongside `meta` next to values.
Values in the store are either an object, array, or primitive.
Objects and Arrays can have both child items, but only array is iterable.<br />
Primitive values cannot have any children.

<br/><br/>

## TODO

- [ ] Reset to `defaultValues`
- [ ] Meta `dirty` / `touched`
- [ ] CONTRIBUTING.md
