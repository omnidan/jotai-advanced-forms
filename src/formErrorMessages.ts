import type { GenericErrorMessageKeys } from "./form.js";

export type DefaultErrorMessageKeys = "required" | "invalid";

type DefaultErrorMessages<TDefaultErrorMessageKeys extends string> = Partial<
  Record<TDefaultErrorMessageKeys, string>
>;

type ErrorMessages<
  TRequiredErrorMessageKeys extends string,
  TDefaultErrorMessageKeys extends string,
> = Record<TRequiredErrorMessageKeys, string> &
  DefaultErrorMessages<TDefaultErrorMessageKeys>;

interface RequiredErrorMessagesObject<
  TRequiredErrorMessageKeys extends GenericErrorMessageKeys,
> {
  errors: [TRequiredErrorMessageKeys] extends [string]
    ? ErrorMessages<TRequiredErrorMessageKeys, DefaultErrorMessageKeys>
    : undefined;
}

export type ErrorMessagesObject<
  TRequiredErrorMessageKeys extends GenericErrorMessageKeys,
  TDefaultErrorMessageKeys extends string,
> =
  // if there are no required keys, you can still pass optional default keys
  [TRequiredErrorMessageKeys] extends [never]
    ? { errors?: DefaultErrorMessages<TDefaultErrorMessageKeys> }
    : // if there are no keys set in the atom, we don't take any errors
      [TRequiredErrorMessageKeys] extends [undefined]
      ? { errors?: undefined }
      : // otherwise, we combine the required errors with the default errors
        RequiredErrorMessagesObject<TRequiredErrorMessageKeys>;
