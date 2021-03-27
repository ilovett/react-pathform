import { fromDotPath } from '.';

export const validateYupSchema = (schema: any) => async (values: any, addError: any) => {
  try {
    await schema?.validate(values, { abortEarly: false });
  } catch (err) {
    // inner is available when `abortEarly: false`
    err?.inner?.forEach?.((validationError: any) => {
      const path = fromDotPath(validationError.path);
      const { type, message, value } = validationError;
      try {
        addError(path, { type, message, value });
      } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(err);
        }
      }
    });

    // bubble up yup schema error, stops submission
    throw err;
  }
};
