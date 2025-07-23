import {
  useAtom,
  atom,
  type Atom,
  type PrimitiveAtom,
  type WritableAtom,
} from "jotai";
import { atomFamily } from "jotai/utils";
import { type AtomFamily } from "jotai/vanilla/utils/atomFamily";
import { useEffect, type RefObject } from "react";

// copied from jotai source as it is not exported
export type JotaiCallback<Param, AtomType> = (event: {
  type: "CREATE" | "REMOVE";
  param: Param;
  atom: AtomType;
}) => void;

// the internal map contains form field atoms that could have any value and any error strings
// at this point we cannot statically guarantee that it has the correct generic
// so, we need to use `any`, but after getting the value, we can return it with the generic
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyFormFieldAtom = FormFieldAtom<any, any, any>;

export type PrimitiveParam = string;
export type UnknownValue = unknown;

export type GenericErrorMessageKeys = string | undefined;

export const NO_VALUE = Symbol.for("@omnidan/jotai-advanced-forms/NO_VALUE");

export interface FormState {
  submitted: boolean;
  isSubmitting: boolean;
}

export interface FormField<
  TValue,
  TErrorMessageKeys extends GenericErrorMessageKeys = undefined,
  TRef extends HTMLElement = HTMLInputElement,
> {
  showError: boolean;
  value: TValue;
  isDirty: boolean;
  isValid: boolean;
  error?: TErrorMessageKeys;
  ref: RefObject<TRef> | null;
}

export type Getter = <Value>(atom: Atom<Value>) => Value;
export type ShouldRemove<Param extends PrimitiveParam> = (
  createdAt: number,
  param: Param,
) => boolean;

export interface FormFieldAtomOptions<
  TValue,
  TErrorMessageKeys extends GenericErrorMessageKeys = undefined,
> {
  initialState: TValue;
  validate?: (value: TValue, get: Getter) => TErrorMessageKeys | undefined;
  debugLabel?: string;
}

export interface FormFieldAtomFamilyOptions<
  TParam extends PrimitiveParam,
  TValue,
  TErrorMessageKeys extends GenericErrorMessageKeys = undefined,
> {
  initialState: TValue;
  validate?: (
    param: TParam,
  ) => (value: TValue, get: Getter) => TErrorMessageKeys | undefined;
  debugLabel?: string;
}

export type FormFieldAtom<
  TValue,
  TErrorMessageKeys extends GenericErrorMessageKeys = undefined,
  TRef extends HTMLElement = HTMLInputElement,
> = WritableAtom<
  FormField<TValue, TErrorMessageKeys, TRef>,
  | [TValue | typeof NO_VALUE]
  | [TValue | typeof NO_VALUE, RefObject<TRef> | null],
  void
>;

export type FormFieldAtomFamily<
  TParam extends PrimitiveParam,
  TValue,
  TErrorMessageKeys extends GenericErrorMessageKeys = undefined,
  TRef extends HTMLElement = HTMLInputElement,
> = AtomFamily<
  TParam,
  WritableAtom<
    FormField<TValue, TErrorMessageKeys, TRef>,
    | [TValue | typeof NO_VALUE]
    | [TValue | typeof NO_VALUE, RefObject<TRef> | null],
    void
  >
>;

export interface MultiFormField<
  TValue,
  TErrorMessageKeys extends GenericErrorMessageKeys = undefined,
  TRef extends HTMLElement = HTMLInputElement,
> {
  atomFamily: FormFieldAtomFamily<string, TValue, TErrorMessageKeys, TRef>;
  idCounterAtom: PrimitiveAtom<number>;
  usedIdsAtom: PrimitiveAtom<number[]>;
  valuesAtom: Atom<TValue[]>;
}

export interface Form extends FormState {
  isValid: boolean;
  focusableFormFieldsWithError: FormField<
    UnknownValue,
    GenericErrorMessageKeys,
    HTMLElement
  >[];
}

export type FormAtomType = WritableAtom<Form, Partial<FormState>[], void>;

export interface UseFormOptions {
  onValid: () => Promise<void> | void;
  onError?: () => void;
}

export interface UseFormResult {
  submitForm: () => void;
  isSubmitting: boolean;
  resetValidation: () => void;
}

export type UseFormFunction = (options: UseFormOptions) => UseFormResult;

/**
 * atom to store intrinsic form state
 *
 * for example: a "submitted" flag that tells us if the form has
 * already been submitted
 */
export function internalFormStateAtom(): PrimitiveAtom<FormState> {
  const formStateAtom = atom<FormState>({
    submitted: false,
    isSubmitting: false,
  });
  return formStateAtom;
}

/**
 * atom to store the value of a field with validation functionality
 *
 * inspired by jotai-form's atomWithValidate, extended to have props
 * such as "showError" that decides whether an error should be shown
 * or not depending on the form state (already submitted)
 */
export function internalFormFieldAtom<
  TValue,
  TErrorMessageKeys extends GenericErrorMessageKeys = undefined,
  TRef extends HTMLElement = HTMLInputElement,
>(
  formStateAtom: Atom<FormState>,
  options: FormFieldAtomOptions<TValue, TErrorMessageKeys>,
  partOfFamily = false,
): FormFieldAtom<TValue, TErrorMessageKeys, TRef> {
  const valueAtom = atom(options.initialState);
  const refAtom = atom<RefObject<TRef> | null>(null);
  const isDirtyAtom = atom(false);

  const formFieldAtom = atom(
    (get) => {
      const value = get(valueAtom);
      const isDirty = get(isDirtyAtom);
      const formState = get(formStateAtom);
      const ref = get(refAtom);
      const error = options.validate?.(value, get);
      const isValid = !error;
      return {
        value,
        isDirty,
        isValid,
        error,
        showError: formState.submitted ? !isValid : false,
        ref,
      };
    },
    (
      _,
      set,
      value: TValue | typeof NO_VALUE = NO_VALUE,
      ref: RefObject<TRef> | null = null,
    ) => {
      if (ref !== null) {
        set(refAtom, ref);
      }
      if (value !== NO_VALUE) {
        set(valueAtom, value);
        set(isDirtyAtom, true);
      }
    },
  );

  if (process.env.NODE_ENV !== "production") {
    if (partOfFamily) {
      formFieldAtom.debugLabel = options.debugLabel;
    } else {
      formFieldAtom.debugLabel = options.debugLabel
        ? `formField:${options.debugLabel}`
        : undefined;
    }
  }

  return formFieldAtom;
}

export function internalFormFieldAtomFamily<
  TParam extends PrimitiveParam,
  TValue,
  TErrorMessageKeys extends GenericErrorMessageKeys = undefined,
  TRef extends HTMLElement = HTMLInputElement,
>(
  formStateAtom: Atom<FormState>,
  options: FormFieldAtomFamilyOptions<TParam, TValue, TErrorMessageKeys>,
): FormFieldAtomFamily<TParam, TValue, TErrorMessageKeys, TRef> {
  return atomFamily((param: TParam) =>
    internalFormFieldAtom<TValue, TErrorMessageKeys, TRef>(
      formStateAtom,
      {
        ...options,
        validate: options.validate?.(param),
        debugLabel: options.debugLabel
          ? `formFieldFamily(${param}):${options.debugLabel}`
          : undefined,
      },
      true,
    ),
  );
}

/**
 * atom to store derived form props
 *
 * for example: an "isValid" flag that tells us if all fields
 * of the form are valid
 */
export function internalFormAtom(
  formStateAtom: PrimitiveAtom<FormState>,
  formFieldAtoms: Set<FormFieldAtom<UnknownValue, GenericErrorMessageKeys>>,
): FormAtomType {
  const formAtom = atom(
    (get) => {
      const res = {
        ...get(formStateAtom),
        isValid: Array.from(formFieldAtoms.values()).every(
          (
            formFieldAtom: FormFieldAtom<UnknownValue, GenericErrorMessageKeys>,
          ) => {
            const { isValid } = get(formFieldAtom);
            return isValid;
          },
        ),
        focusableFormFieldsWithError: Array.from(formFieldAtoms.values())
          .map((formFieldAtom) => get(formFieldAtom))
          .filter((formField) => formField.showError && formField.ref?.current)
          .sort((a, b) => {
            if (!a.ref?.current || !b.ref?.current) {
              console.error(
                "inconsistent state: form fields without ref should have been filtered at this point",
              );
              return 0;
            }
            const relativePosition = a.ref.current.compareDocumentPosition(
              b.ref.current,
            );
            switch (relativePosition) {
              case Node.DOCUMENT_POSITION_PRECEDING:
                // b precedes a -> a > b
                return 1;
              case Node.DOCUMENT_POSITION_FOLLOWING:
                // b follows a -> a < b
                return -1;
              default:
                console.error(
                  `unknown relative position between form fields: ${String(relativePosition)}`,
                );
                return 0;
            }
          }),
      };
      return res;
    },
    (get, set, value: Partial<FormState>) => {
      const formState = get(formStateAtom);
      set(formStateAtom, { ...formState, ...value });
    },
  );

  return formAtom;
}

/**
 * hook creation function to create a "useForm" hook
 *
 * handles common form actions, such as a "submitForm" function
 */
export function internalCreateUseForm(formAtom: FormAtomType): UseFormFunction {
  return function useForm(options: UseFormOptions): UseFormResult {
    const [
      { isValid, isSubmitting, focusableFormFieldsWithError },
      setFormState,
    ] = useAtom(formAtom);

    const handleSubmit = async () => {
      if (isValid) await options.onValid();
      else options.onError?.();

      if (focusableFormFieldsWithError.length > 0) {
        // the helpertext needs to be rendered before we focus so that the screen reader reads it
        // -> we use setTimeout to push the focus event to the end of the queue
        // -> this ensures that all pending rendering tasks finish before we focus
        // -> add an focus event listener to scroll to the first input - this listener is needed
        //    because iOS has problems to handle the scroll to checkboxes
        setTimeout(() => {
          const fieldToFocus = focusableFormFieldsWithError[0].ref?.current;

          if (!fieldToFocus) {
            return;
          }

          fieldToFocus.addEventListener(
            "focus",
            (e) => {
              if (!(e.target instanceof HTMLElement)) {
                console.error(
                  "focus event target is not an HTMLElement, cannot scroll into view",
                );
                return;
              }

              e.target.scrollIntoView({
                block: "center",
              });
            },
            true,
          );
          fieldToFocus.focus();
        });
      }

      setFormState({ isSubmitting: false });
    };

    useEffect(() => {
      // we need to wait for the submitted state to change because that is what triggers
      // the form atom to re-evaluate its isValid state, but because submitted can only
      // change from false -> true and then not back to false, we need a separate state
      // to track if the submit button was pressed, which we can reset every time after
      // the respective handler (onValid or onError) was called
      if (isSubmitting) {
        void handleSubmit();
      }
    }, [isSubmitting]);

    return {
      submitForm: () => {
        setFormState({
          submitted: true,
          isSubmitting: true,
        });
      },
      isSubmitting,
      resetValidation: () => {
        setFormState({ submitted: false });
      },
    };
  };
}

/**
 * creates a new internal form
 *
 * this function is internal only, but exported so we can do unit tests on it
 *
 * the public version of this function does not expose the formFields and formFieldAtomFamilies,
 * which is a Set and a Map used only to internally track fields in a form
 */
export function internalCreateForm() {
  // create form state atom (contains info about the form,
  // like if it was already submitted)
  const formStateAtom = internalFormStateAtom();

  // store a list of form fields created in the form,
  // used to validate the whole form later
  // in this case, we do not care about the actual value of form fields, just that they are form fields
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formFields = new Set<FormFieldAtom<any, GenericErrorMessageKeys, any>>(
    [],
  );

  // store a mapping from form field atom families to their instantiated form fields
  // we need this so we can track when form fields get removed from the family
  const formFieldAtomFamilies = new Map<
    // in this case, we do not care about the actual value of form field families, just that they are form field families
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    FormFieldAtomFamily<any, any, GenericErrorMessageKeys, any>,
    Map<
      PrimitiveParam,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [FormFieldAtom<any, GenericErrorMessageKeys, any>, number]
    >
  >();

  // atom creator function for a single form field
  function formFieldAtom<
    TValue,
    TErrorMessageKeys extends GenericErrorMessageKeys = undefined,
    TRef extends HTMLElement = HTMLInputElement,
  >(
    options: FormFieldAtomOptions<TValue, TErrorMessageKeys>,
  ): FormFieldAtom<TValue, TErrorMessageKeys, TRef> {
    const createdFormFieldAtom = internalFormFieldAtom<
      TValue,
      TErrorMessageKeys,
      TRef
    >(formStateAtom, options);
    formFields.add(createdFormFieldAtom);
    return createdFormFieldAtom;
  }

  // atom creator function for form field families
  function formFieldAtomFamily<
    TParam extends PrimitiveParam,
    TValue,
    TErrorMessageKeys extends GenericErrorMessageKeys = undefined,
    TRef extends HTMLElement = HTMLInputElement,
  >(
    options: FormFieldAtomFamilyOptions<TParam, TValue, TErrorMessageKeys>,
    areEqual?: (a: TParam, b: TParam) => boolean,
  ): FormFieldAtomFamily<TParam, TValue, TErrorMessageKeys, TRef> {
    const createdFormFieldAtomFamily = internalFormFieldAtomFamily<
      TParam,
      TValue,
      TErrorMessageKeys,
      TRef
    >(formStateAtom, options);
    formFieldAtomFamilies.set(createdFormFieldAtomFamily, new Map());
    let shouldRemove: ShouldRemove<TParam> | null = null;
    // we wrap the atom family to be able to add/remove fields on-the-fly from the form
    const formFieldAtomFamilyWrapper = (param: TParam) => {
      const formFieldFamilyMap = formFieldAtomFamilies.get(
        createdFormFieldAtomFamily,
      );
      let item: [AnyFormFieldAtom, number] | undefined;
      if (areEqual === undefined) {
        item = formFieldFamilyMap?.get(param);
      } else {
        // custom comparator defined (areEqual), iterate over all items
        for (const [key, value] of formFieldFamilyMap?.entries() ?? []) {
          const paramKey = key as TParam;
          if (areEqual(paramKey, param)) {
            item = value;
            break;
          }
        }
      }

      // if the item exists, check if it should be removed
      // otherwise, return the atom from it
      if (item !== undefined) {
        if (shouldRemove?.(item[1], param)) {
          formFieldAtomFamilyWrapper.remove(param);
        } else {
          return item[0];
        }
      }

      // item does not exist (anymore), we should (re-)create it
      const createdFormFieldAtom = createdFormFieldAtomFamily(param);
      formFields.add(createdFormFieldAtom);
      formFieldFamilyMap?.set(param, [createdFormFieldAtom, Date.now()]);
      notifyListeners("CREATE", param, createdFormFieldAtom);
      return createdFormFieldAtom;
    };

    formFieldAtomFamilyWrapper.remove = (param: TParam) => {
      const formFieldFamilyMap = formFieldAtomFamilies.get(
        createdFormFieldAtomFamily,
      );
      const deleteParam = (param: TParam) => {
        const instantiatedFormField = formFieldFamilyMap?.get(param);
        formFieldFamilyMap?.delete(param);
        createdFormFieldAtomFamily.remove(param);
        if (instantiatedFormField) {
          formFields.delete(instantiatedFormField[0]);
          return instantiatedFormField[0];
        } else {
          console.error(
            "inconsistent form field state, form field",
            JSON.stringify(param),
            "not in formFieldFamilyMap!",
          );
        }
      };
      if (areEqual === undefined) {
        const deletedAtom = deleteParam(param);
        if (deletedAtom) {
          notifyListeners("REMOVE", param, deletedAtom);
        }
      } else {
        for (const key of formFieldFamilyMap?.keys() ?? []) {
          const paramKey = key as TParam;
          if (areEqual(paramKey, param)) {
            // delete all atoms that are equal
            const deletedAtom = deleteParam(paramKey);
            if (deletedAtom) {
              notifyListeners("REMOVE", param, deletedAtom);
            }
            break;
          }
        }
      }
    };

    formFieldAtomFamilyWrapper.setShouldRemove = (
      fn: ShouldRemove<TParam> | null,
    ) => {
      shouldRemove = fn;
      if (!shouldRemove) return;
      const formFieldFamilyMap = formFieldAtomFamilies.get(
        createdFormFieldAtomFamily,
      );
      for (const [key, value] of formFieldFamilyMap?.entries() ?? []) {
        const paramKey = key as TParam;
        if (shouldRemove(value[1], paramKey)) {
          formFieldAtomFamilyWrapper.remove(paramKey);
        }
      }
    };

    formFieldAtomFamilyWrapper.getParams = (): Iterable<TParam> => {
      const formFieldFamilyMap = formFieldAtomFamilies.get(
        createdFormFieldAtomFamily,
      );
      const keyIterator = formFieldFamilyMap?.keys();
      if (keyIterator) {
        return keyIterator as IterableIterator<TParam>;
      }
      return {
        [Symbol.iterator]() {
          return {
            next() {
              return { value: undefined, done: true };
            },
          };
        },
      };
    };

    const listeners = new Set<JotaiCallback<TParam, AnyFormFieldAtom>>();

    function notifyListeners(
      type: "CREATE" | "REMOVE",
      param: TParam,
      atom: AnyFormFieldAtom,
    ) {
      for (const listener of listeners) {
        listener({ type, param, atom });
      }
    }

    formFieldAtomFamilyWrapper.unstable_listen = (
      callback: JotaiCallback<TParam, AnyFormFieldAtom>,
    ) => {
      listeners.add(callback);
      return () => {
        listeners.delete(callback);
      };
    };

    return formFieldAtomFamilyWrapper;
  }

  /**
   * creates a "multi form field", which is a way to dynamically add/remove
   * multiple instances of a specific form field. for example, to add multiple
   * first names.
   */
  function multiFormField<
    TValue,
    TErrorMessageKeys extends GenericErrorMessageKeys = undefined,
    TRef extends HTMLElement = HTMLInputElement,
  >(
    options: FormFieldAtomFamilyOptions<string, TValue, TErrorMessageKeys>,
    areEqual?: (a: string, b: string) => boolean,
  ): MultiFormField<TValue, TErrorMessageKeys, TRef> {
    const atomFamily = formFieldAtomFamily<
      string,
      TValue,
      TErrorMessageKeys,
      TRef
    >(options, areEqual);
    // initialize multi form field by adding one field by default
    // TODO: we could make this configurable
    const idCounterAtom = atom<number>(1);
    const usedIdsAtom = atom<number[]>([0]);
    const valuesAtom = atom<TValue[]>((get) => {
      const usedIds = get(usedIdsAtom);
      return usedIds.map((id) => {
        const field = get(atomFamily(id.toString()));
        return field.value;
      });
    });
    return {
      atomFamily,
      idCounterAtom,
      usedIdsAtom,
      valuesAtom,
    };
  }

  // create the form atom (contains derived info, like "isValid")
  // FIXME: these types don't match because we use `any` in some places,
  //        but it expects a PrimitiveValue
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const formAtom = internalFormAtom(formStateAtom, formFields);

  // create the form hook (used to handle submission, resetting validation, etc)
  const useForm = internalCreateUseForm(formAtom);

  return {
    formStateAtom,
    formFields,
    formFieldAtomFamilies,
    formFieldAtom,
    formFieldAtomFamily,
    multiFormField,
    formAtom,
    useForm,
  };
}

/**
 * creates a new form
 *
 * this function creates a form state atom, stores references to form fields,
 * creates a form atom, and finally creates a useForm hook
 *
 * overall it makes it easy to create new forms just by using this function
 */
export function createForm() {
  const { formFields, formFieldAtomFamilies, ...form } = internalCreateForm();
  return form;
}
