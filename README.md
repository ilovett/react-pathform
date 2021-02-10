# pathform

Pathform was built to scratch an itch for recursive, nested, dynamic forms.
Using paths as an array, we can spread dynamic paths around like butter.
The path is your source of truth and can be thought of as the path to access
values in the form store.
The path is your store selector and binds your UI to the store.

You should be able to access and mutate your store from anywhere.

Values in the store are either object, array, or primitive.  Objects and arrays
can have child items.  Primitives are leaf nodes.

![explaining pathform to people who prefer other form libraries](https://i.imgflip.com/4x9w4x.jpg)

# Quick Start

```bash
npm install pathform
```

Wrap your form component with `Provider`


# TODO Checklist

- [ ] README: Quick Start section
- [ ] README: better documentation / API
- [ ] optimize or remove `lodash` and `uuid` dependencies
- [ ] provide example app
- [ ] `reset` to defaults
- [ ] `handleSubmit`
- [ ] performance - `React.memo` re-rendering
- [ ] performance - reconsiliation events (touched, changed, error, etc) to minimize re-rendering
- [ ] circular reference protection
- [ ] icon / project branding
