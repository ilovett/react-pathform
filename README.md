# pathform

Pathform was built to scratch an itch for recursive, nested, dynamic forms.
Using paths as an array, we can spread dynamic paths around like butter.
With a path we can select and mutate values in the store.

Values in the store are either an object, array, or primitive.  Objects and Arrays
can have child items.  Primitives are leaf nodes and do not have any children.

![explaining pathform to people who prefer other form libraries](https://i.imgflip.com/4x9w4x.jpg)

# Quick Start

```bash
npm install --save react-pathform
```

# TODO Checklist

- [ ] README: Quick Start
- [ ] README: API
- [ ] PERF: optimize or remove `lodash` and `uuid` dependencies
- [ ] provide example app
- [ ] FEAT: `reset` to defaults
- [ ] FEAT: `handleSubmit`
- [ ] PERF: `React.memo` re-rendering
- [ ] PERF: reconsiliation events (touched, changed, error, etc) to minimize re-rendering
- [ ] circular reference protection
- [ ] icon / project branding
