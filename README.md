# react-pathform

Pathform was built to scratch an itch for recursive, nested, dynamic forms.
Using paths as an array, we can spread dynamic paths around like butter.

We can derive a lot from the [path](#PathFormPath)... [Why?](#But-Y-Tho)

## Quick Start

```bash
npm install --save react-pathform
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
          render={(inputProps, meta) => {
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

## Example Code

Check out the [Example App](./example/README.md)

### CodeSandbox Examples

- [Simplest Example](https://codesandbox.io/s/immutable-pond-qrkrn?file=/src/App.tsx)

## API

- Components
  - [PathFormProvider (required)](#PathFormProvider-(required))
  - [PathForm](#PathForm)
  - [PathFormField](#PathFormField)
  - [PathFormArray](#PathFormArray)
- Hooks
  - [usePathForm](#usePathForm)
  - [usePathFormValue](#usePathFormValue)

### PathFormProvider (required)

The store context provider for your form.  You must place it at the root of your form to be able to use `usePathForm`, and `PathForm*` components.
The data in the store will remain until the `PathFormProvider` is unmounted.

|Prop|Type|Description
|-|-|-
|initialRenderValues|any|The data for your form on the *initial render only*.

### PathForm

Replaces a native `form` element and allows you to hook into `onValidate` and `onSubmit`.

|Prop|Type|Description
|-|-|-
|onValidate|callback(values) or Promise<callback(values)>|Called just before submitting.
|onSubmit|callback(values) or Promise<callback(values)>|Called if validation passes for submission.

### PathFormField

Binds to a value at the given path in the store from.

|Prop|Type|Required|Description
|------|---------|----------|----
|path*|PathFormPath|Yes|The path selector to the item in your store.
|render*|callback(inputProps, meta)|No|The callback to render your component.<br /><br/>**inputProps** The input props for your form component.<br />**meta** Meta properties of the store item.
|defaultValue|any|No|The value use on the initial render, if the store item does not already exist.<br />If not set, you may receive a warning about switching from uncontrolled to controlled.

### PathFormArray

Binds to an array at the given path in the store from.  The `render` callback will be called for
each item in the array.<br/>
Use the `meta.uuid` on your root item `key`.<br/>
EG: `key={meta.uuid}`

|Prop|Type|Required|Description
|------|---------|----------|----
|path*|PathFormPath|Yes|The path selector to the item in your store.
|render*|callback(arrayProps, meta)|No|The callback to render your component.<br/><br/>**inputProps** The input props for your form component.<br />**meta** Meta properties of the store item.
|defaultValue|any|No|The value use on the initial render, if the store item does not already exist.

<br/><br/><br/>

### usePathForm

Use this hook from any child component scope to access the context of your form.

Returns the form context provider `object` with helper functions:

#### `setValue(path: PathFormPath, value: any)`

Sets the store item `value` at the given `path`.

#### `setTouched(path: PathFormPath, touched: boolean)`

Marks the store item at the given path as `touched`.

#### `addError(path: PathFormPath, error: PathFormError)`

Adds an `error` at the given `path`.

#### `clearError(path: PathFormPath)`

Clears an `error` at the given `path`.

#### `array: PathFormArrayUtils`

An object of utilities for mutating array items in your form.

##### `append function(path: PathFormPath, item: any)`

Appends an `item` to the end of the array at given `path`.

```tsx
const { array } = usePathForm();
array.append(["deeply", "nested", "items"], { "name": "Santa's Little Helper" });
```

##### `prepend function(path: PathFormPath, item: any)`

Prepends an `item` to the beginning of the array at given `path`.

```tsx
const { array } = usePathForm();
array.prepend(["deeply", "nested", "items"], { "name": "Santa's Little Helper" });
```

##### `move function(path: PathFormPath, fromIndex: number, toIndex: number)`

Moves an `item` in the array at given `path`, from the `fromIndex` to the `toIndex`.  Useful for reordering items.

```tsx
const { array } = usePathForm();
array.move(["deeply", "nested", "items"], 3, 4);
```

##### `remove function(path: PathFormPath, index: number)`

Removes an `item` from the array at given `path` at `index`.

```tsx
const { array } = usePathForm();
array.move(["deeply", "nested", "items"], 3, 4);
```

<br/><br/><br/>

### usePathFormValue

Returns an array of `[value, meta]` at the given `path`.

```ts
const [nameValue, nameMeta] = usePathFormValue(['person', 'name']);
const [ageValue, ageMeta] = usePathFormValue(['person', 'age']);
```

## Types

### PathFormPath

```ts
type PathFormPath = Array<string | number>;

const path: PathFormPath = ["deeply", "nested", "items", 0, "children", 0, "name"];
```

The path to an item in your form.<br/>Strings imply object property.<br/>Numbers imply array index.

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

Whereas this library *derives* the `name` *from* a `path`.  The difference is,
you can easily spread arrays, not strings.

```ts
const parentPath = ["deeply", "nested", "items"]; // name = "deeply.nested.items"
const childPath = [...parentPath, itemIndex, "children"]; // name = "deeply.nested.items[0].children"
const deepPath = [...childPath, childIndex, "name"];  // name = "deeply.nested.items[0].children[0].name"
```

This makes nested / recursive form components much cleaner.

![explaining pathform to people who prefer other form libraries](https://i.imgflip.com/4x9w4x.jpg)

The internal form store wraps the form structure alongside `meta` next to values.
Values in the store are either an object, array, or primitive.
Objects and Arrays can have both child items, but only array is iterable.<br />
Primitive values cannot have any children.

## Feature Checklist

| Category | Criteria | Complete |
|----------|---------|----------|
| README | Feature Checklist | &#9745; |
| README | Quick Start | &#9745; |
| README | Simple CodeSandbox | &#9745; |
| README | API | &#9744; |
| Library | onValidate | &#9744; |
| Library | onSubmit | &#9744; |
| Library | reset | &#9744; |
| Library | touched & validation | &#9744; |
| Library | Built in validation | &#9744; |
| Examples | Example App | &#9744; |
| Examples | Codesandbox | &#9744; |
| Bundle Size | Optimize UUID | &#9744; |
| Bundle Size | Optimize Lodash | &#9744; |
| README | Contributing | &#9744; |
