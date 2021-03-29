import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { PathFormArray, PathFormField, PathFormProvider, usePathForm } from '../.';
import { Button, Checkbox, FormControlLabel, IconButton, TextField, Tooltip } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/DeleteRounded';

const fetchedData = {
  things: [
    {
      name: 'Joey Joe Joe Sr.',
      age: '46',
      kids: [
        {
          name: 'Joey Joe Joe Jr.',
          age: '23',
          kids: [
            {
              name: 'Joey Joe Joe II',
              age: '1',
              kids: [],
            },
          ],
        },
      ],
    },
    {
      name: 'Homer',
      age: '42',
      kids: [
        { name: 'Bart', age: '8', kids: [] },
        { name: 'Lisa', age: '7', kids: [] },
        { name: 'Maggie', age: '1', kids: [] },
      ],
    },
    { name: 'Duff Man', age: '34', kids: [] },
  ],
};

const App = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <PathFormProvider initialRenderValues={fetchedData}>
        <MyForm />
      </PathFormProvider>
    </div>
  );
};

const Person = ({ path, totalRows, arrayPath, index }) => {
  const { array, state, getValues } = usePathForm();

  (window as any).state = state;
  (window as any).getValues = getValues;

  return (
    <>
      <PathFormField
        path={[...path, 'name']}
        defaultValue=""
        render={({ inputProps, meta, renders }) => {
          console.count(`RENDER COUNT ${inputProps.name}`);
          console.info({ meta, renders });
          return <TextField label="Name" {...inputProps} />;
        }}
      />

      <PathFormField
        path={[...path, 'age']}
        defaultValue=""
        render={({ inputProps, meta, renders }) => {
          console.count(`RENDER COUNT ${inputProps.name}`);
          console.info({ meta, renders });
          return <TextField label="Age" {...inputProps} />;
        }}
      />

      <PathFormField
        path={[...path, 'someOption']}
        defaultValue={false}
        render={({ inputProps: { onChange, value, ...inputProps } }) => {
          return (
            <FormControlLabel
              label="Some Option"
              control={<Checkbox color="primary" checked={value} onChange={(event, value) => onChange(value)} {...inputProps} />}
              {...inputProps}
              style={{ maxWidth: 215 }}
            />
          );
        }}
      />

      <Tooltip title={totalRows > 1 ? 'Delete' : 'At least one required'}>
        <span>
          <IconButton
            disabled={totalRows <= 1}
            onClick={() => {
              if (window.confirm('Are you sure you want to remove this?')) {
                // TODO should take one full path or path and index
                array.remove(arrayPath, index);
              }
            }}
          >
            <DeleteIcon />
          </IconButton>
        </span>
      </Tooltip>
    </>
  );
};

const MyForm = () => {
  const { array } = usePathForm();

  return (
    <>
      <PathFormArray
        path={['things']}
        defaultValue={[]}
        renderItem={({ totalRows, arrayPath, itemPath, index, meta }) => {
          // TODO i should have meta.dotpath here?
          console.count(`RENDER COUNT ${meta.uuid}`);

          // open chrome dev tools and inspect the scope variables

          return (
            <div key={meta.uuid} style={{ display: 'flex', alignItems: 'center' }}>
              <Person path={itemPath} totalRows={totalRows} arrayPath={arrayPath} index={index} />
            </div>
          );
        }}
      />
      <Button size="small" variant="contained" onClick={() => array.append(['things'], {})}>
        Add
      </Button>
    </>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
