import * as React from 'react';

import { Button, CardActions, Checkbox, FormControlLabel, IconButton, TextField, Tooltip } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/DeleteRounded';
import ArrowUpIcon from '@material-ui/icons/ArrowUpwardRounded';
import ArrowDownIcon from '@material-ui/icons/ArrowDownwardRounded';

import { PathForm, PathFormArray, PathFormField, PathFormProvider, usePathForm, usePathFormValue } from '../../dist';
import { PathFormDevTools } from './ExamplePathFormDevTools';

const fetchedData = {
  characters: [
    { name: 'Bart', age: '10' },
    { name: 'Homer', age: '42' },
    { name: 'Duff Man', age: '34' },
  ],
};

export const ExampleApp = () => {
  return (
    <PathFormProvider initialRenderValues={fetchedData}>
      <div style={{ display: 'flex', height: '100vh' }}>
        <div style={{ width: 800, padding: 25 }}>
          <MyForm />
        </div>
        <aside style={{ flex: 1, overflowY: 'scroll' }}>
          <PathFormDevTools />
        </aside>
      </div>
    </PathFormProvider>
  );
};

const MyForm = () => {
  const { array, isDirty, reset } = usePathForm();

  return (
    <PathForm
      onSubmit={(values) => {
        console.log('onSubmit -> dirty', isDirty());
        console.log('onSubmit -> values', JSON.stringify(values, null, 2));
        // alert(JSON.stringify(values, null, 2));

        // update the form defaultValues
        reset({ defaultValues: values });
      }}
    >
      <PathFormArray
        path={['characters']}
        defaultValue={[]}
        renderItem={({ totalRows, arrayPath, itemPath, index, meta }) => {
          // uncomment, open chrome dev tools and inspect the scope variables
          // debugger;

          return (
            <div key={meta.uuid} style={{ display: 'flex', alignItems: 'center' }}>
              <PathFormField
                path={[...itemPath, 'name']}
                defaultValue=""
                validations={[{ type: 'required', message: 'Must give a name.' }]}
                render={({ inputProps, meta, renders }) => {
                  return (
                    <>
                      <TextField label="Name" {...inputProps} error={!!meta.error} helperText={meta.error?.message} />
                      {/* <pre style={{ fontSize: 10 }}>{JSON.stringify(meta, null, 2)}</pre> */}
                    </>
                  );
                }}
              />

              <PathFormField
                path={[...itemPath, 'age']}
                defaultValue=""
                validations={[{ type: 'min', value: 21, message: 'Must be at least 21 years old.' }]}
                render={({ inputProps, meta, renders }) => {
                  return <TextField label="Age" {...inputProps} error={!!meta.error} helperText={meta.error?.message} />;
                }}
              />

              <PathFormField
                path={[...itemPath, 'someOption']}
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
                  <IconButton disabled={totalRows <= 1} onClick={() => array.remove(arrayPath, index)}>
                    <DeleteIcon />
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip title="Move Down">
                <span>
                  <IconButton disabled={totalRows <= 1 || index + 1 === totalRows} onClick={() => array.move(arrayPath, index, index + 1)}>
                    <ArrowDownIcon />
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip title="Move Up">
                <span>
                  <IconButton
                    disabled={totalRows <= 1 || index === 0}
                    onClick={() => {
                      array.move(arrayPath, index, index - 1);
                    }}
                  >
                    <ArrowUpIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </div>
          );
        }}
      />

      <CardActions>
        <Button size="small" variant="outlined" color="primary" onClick={() => array.append(['characters'], {})}>
          Add Row
        </Button>
        <Button size="small" variant="outlined" color="primary" onClick={() => reset()}>
          Reset
        </Button>
        <Button size="small" variant="contained" color="primary" type="submit">
          Submit
        </Button>
      </CardActions>
    </PathForm>
  );
};
