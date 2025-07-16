// @vitest-environment happy-dom
import { describe, test, expect, vi } from "vitest";
import { createStore, useAtom, type Atom } from "jotai";
import { act, render, renderHook, waitFor } from "@testing-library/react";
import {
  type FormFieldAtom,
  type GenericErrorMessageKeys,
  internalCreateForm,
  internalFormAtom,
  internalFormFieldAtom,
  internalFormFieldAtomFamily,
  internalFormStateAtom,
  createForm,
} from "./form.js";
import { useFormField } from "./useFormField.js";

describe("formFieldAtom", () => {
  test("value should initially be set to initialValue", () => {
    const formStateAtom = internalFormStateAtom();
    const formFieldAtom = internalFormFieldAtom(formStateAtom, {
      initialState: "",
    });

    const { result } = renderHook(() => useAtom(formFieldAtom));
    const [{ value }] = result.current;
    expect(value).toBe("");
  });

  test("setting atom should set value", () => {
    const formStateAtom = internalFormStateAtom();
    const formFieldAtom = internalFormFieldAtom<string>(formStateAtom, {
      initialState: "",
    });

    const { result } = renderHook(() => useAtom(formFieldAtom));
    const [_, setValue] = result.current;
    act(() => {
      setValue("test value");
    });

    const { result: newResult } = renderHook(() => useAtom(formFieldAtom));
    const [{ value }] = newResult.current;
    expect(value).toBe("test value");
  });

  test("setting atom should set isDirty flag", () => {
    const formStateAtom = internalFormStateAtom();
    const formFieldAtom = internalFormFieldAtom<string>(formStateAtom, {
      initialState: "",
    });

    const { result } = renderHook(() => useAtom(formFieldAtom));
    const [{ isDirty }, setValue] = result.current;
    expect(isDirty).toBe(false);
    act(() => {
      setValue("test value");
    });

    const { result: newResult } = renderHook(() => useAtom(formFieldAtom));
    const [{ isDirty: newIsDirty }] = newResult.current;
    expect(newIsDirty).toBe(true);
  });

  test("validation errors should set isValid flag and error prop", () => {
    const formStateAtom = internalFormStateAtom();
    const formFieldAtom = internalFormFieldAtom<string, "required">(
      formStateAtom,
      {
        initialState: "",
        validate: (value) => {
          if (value.length === 0) return "required";
        },
      },
    );

    const { result } = renderHook(() => useAtom(formFieldAtom));
    const [{ error, isValid }, setValue] = result.current;
    expect(isValid).toBe(false);
    expect(error).toBe("required");
    act(() => {
      setValue("test value");
    });

    const { result: newResult } = renderHook(() => useAtom(formFieldAtom));
    const [{ error: newError, isValid: newIsValid }] = newResult.current;
    expect(newIsValid).toBe(true);
    expect(newError).toBe(undefined);
  });

  test("showError should only be true when form is submitted and there is a validation error", () => {
    const formStateAtom = internalFormStateAtom();
    const formFieldAtom = internalFormFieldAtom<string, "required">(
      formStateAtom,
      {
        initialState: "",
        validate: (value) => {
          if (value.length === 0) return "required";
        },
      },
    );

    // validation error, but form not submitted -> showError = false
    const { result } = renderHook(() => useAtom(formFieldAtom));
    const [{ showError }] = result.current;
    expect(showError).toBe(false);

    // validation error, and form submitted -> showError = true
    const { result: formState } = renderHook(() => useAtom(formStateAtom));
    const [_, setFormState] = formState.current;
    act(() => {
      setFormState({ submitted: true, isSubmitting: false });
    });
    const { result: resultAfterSubmit } = renderHook(() =>
      useAtom(formFieldAtom),
    );
    const [{ showError: afterSubmitShowError }, setValue] =
      resultAfterSubmit.current;
    expect(afterSubmitShowError).toBe(true);

    // no error, and form submitted -> showError = false
    act(() => {
      setValue("test value");
    });
    const { result: resultAfterSet } = renderHook(() => useAtom(formFieldAtom));
    const [{ showError: afterSetShowError }] = resultAfterSet.current;
    expect(afterSetShowError).toBe(false);
  });
});

describe("formFieldAtomFamily", () => {
  test("value should initially be set to initialValue", () => {
    const formStateAtom = internalFormStateAtom();
    const formFieldAtomFamily = internalFormFieldAtomFamily(formStateAtom, {
      initialState: "",
    });
    const formFieldAtom = formFieldAtomFamily("test");

    const { result } = renderHook(() => useAtom(formFieldAtom));
    const [{ value }] = result.current;
    expect(value).toBe("");
  });

  test("setting atom should set value", () => {
    const formStateAtom = internalFormStateAtom();
    const formFieldAtomFamily = internalFormFieldAtomFamily<string, string>(
      formStateAtom,
      {
        initialState: "",
      },
    );
    const formFieldAtom = formFieldAtomFamily("test");

    const { result } = renderHook(() => useAtom(formFieldAtom));
    const [_, setValue] = result.current;
    act(() => {
      setValue("test value");
    });

    const { result: newResult } = renderHook(() => useAtom(formFieldAtom));
    const [{ value }] = newResult.current;
    expect(value).toBe("test value");
  });

  test("setting atom should set isDirty flag", () => {
    const formStateAtom = internalFormStateAtom();
    const formFieldAtomFamily = internalFormFieldAtomFamily<string, string>(
      formStateAtom,
      {
        initialState: "",
      },
    );
    const formFieldAtom = formFieldAtomFamily("test");

    const { result } = renderHook(() => useAtom(formFieldAtom));
    const [{ isDirty }, setValue] = result.current;
    expect(isDirty).toBe(false);
    act(() => {
      setValue("test value");
    });

    const { result: newResult } = renderHook(() => useAtom(formFieldAtom));
    const [{ isDirty: newIsDirty }] = newResult.current;
    expect(newIsDirty).toBe(true);
  });

  test("validation errors should set isValid flag and error prop", () => {
    const formStateAtom = internalFormStateAtom();
    const formFieldAtomFamily = internalFormFieldAtomFamily<
      string,
      string,
      "required"
    >(formStateAtom, {
      initialState: "",
      validate: (_) => (value) => {
        if (value.length === 0) return "required";
      },
    });
    const formFieldAtom = formFieldAtomFamily("test");

    const { result } = renderHook(() => useAtom(formFieldAtom));
    const [{ error, isValid }, setValue] = result.current;
    expect(isValid).toBe(false);
    expect(error).toBe("required");
    act(() => {
      setValue("test value");
    });

    const { result: newResult } = renderHook(() => useAtom(formFieldAtom));
    const [{ error: newError, isValid: newIsValid }] = newResult.current;
    expect(newIsValid).toBe(true);
    expect(newError).toBe(undefined);
  });

  test("showError should only be true when form is submitted and there is a validation error", () => {
    const formStateAtom = internalFormStateAtom();
    const formFieldAtomFamily = internalFormFieldAtomFamily<
      string,
      string,
      "required"
    >(formStateAtom, {
      initialState: "",
      validate: (_) => (value) => {
        if (value.length === 0) return "required";
      },
    });
    const formFieldAtom = formFieldAtomFamily("test");

    // validation error, but form not submitted -> showError = false
    const { result } = renderHook(() => useAtom(formFieldAtom));
    const [{ showError }] = result.current;
    expect(showError).toBe(false);

    // validation error, and form submitted -> showError = true
    const { result: formState } = renderHook(() => useAtom(formStateAtom));
    const [_, setFormState] = formState.current;
    act(() => {
      setFormState({ submitted: true, isSubmitting: false });
    });
    const { result: resultAfterSubmit } = renderHook(() =>
      useAtom(formFieldAtom),
    );
    const [{ showError: afterSubmitShowError }, setValue] =
      resultAfterSubmit.current;
    expect(afterSubmitShowError).toBe(true);

    // no error, and form submitted -> showError = false
    act(() => {
      setValue("test value");
    });
    const { result: resultAfterSet } = renderHook(() => useAtom(formFieldAtom));
    const [{ showError: afterSetShowError }] = resultAfterSet.current;
    expect(afterSetShowError).toBe(false);
  });

  test("setting one atom in family should not set value of others", () => {
    const formStateAtom = internalFormStateAtom();
    const formFieldAtomFamily = internalFormFieldAtomFamily<string, string>(
      formStateAtom,
      {
        initialState: "initial",
      },
    );
    const formFieldAtom = formFieldAtomFamily("test");
    const secondFormFieldAtom = formFieldAtomFamily("second");

    const { result } = renderHook(() => useAtom(formFieldAtom));
    const [_, setValue] = result.current;
    act(() => {
      setValue("test value");
    });

    const { result: newResult } = renderHook(() =>
      useAtom(secondFormFieldAtom),
    );
    const [{ value }] = newResult.current;
    expect(value).toBe("initial");
  });
});

describe("formAtom", () => {
  test("should be invalid if at least one field is invalid", () => {
    const formStateAtom = internalFormStateAtom();
    const firstFieldAtom = internalFormFieldAtom<string, "required">(
      formStateAtom,
      {
        initialState: "",
        validate: (value) => {
          if (value.length === 0) return "required";
        },
      },
    );
    const secondFieldAtom = internalFormFieldAtom<string, "required">(
      formStateAtom,
      {
        initialState: "",
        validate: (value) => {
          if (value.length === 0) return "required";
        },
      },
    );
    // we do not care which type the set has
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formFieldAtoms = new Set<FormFieldAtom<any, GenericErrorMessageKeys>>(
      [firstFieldAtom, secondFieldAtom],
    );

    // FIXME: these types don't match because we use `any` in some places,
    //        but it expects a PrimitiveValue
    const formAtom = internalFormAtom(formStateAtom, formFieldAtoms);

    const { result } = renderHook(() => useAtom(firstFieldAtom));
    const [_, setValue] = result.current;
    act(() => {
      setValue("test value");
    });

    const { result: formResult } = renderHook(() => useAtom(formAtom));
    const [{ isValid }] = formResult.current;
    expect(isValid).toBe(false);
  });

  test("should be valid if all fields are valid", () => {
    const formStateAtom = internalFormStateAtom();
    const firstFieldAtom = internalFormFieldAtom<string, "required">(
      formStateAtom,
      {
        initialState: "",
        validate: (value) => {
          if (value.length === 0) return "required";
        },
      },
    );
    const secondFieldAtom = internalFormFieldAtom<string, "required">(
      formStateAtom,
      {
        initialState: "",
        validate: (value) => {
          if (value.length === 0) return "required";
        },
      },
    );
    // we do not care which type the set has
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formFieldAtoms = new Set<FormFieldAtom<any, GenericErrorMessageKeys>>(
      [firstFieldAtom, secondFieldAtom],
    );

    // FIXME: these types don't match because we use `any` in some places,
    //        but it expects a PrimitiveValue
    const formAtom = internalFormAtom(formStateAtom, formFieldAtoms);

    const { result } = renderHook(() => useAtom(firstFieldAtom));
    const [_, setValue] = result.current;
    act(() => {
      setValue("test value");
    });

    const { result: secondResult } = renderHook(() => useAtom(secondFieldAtom));
    const [_2, setSecondValue] = secondResult.current;
    act(() => {
      setSecondValue("test value");
    });

    const { result: formResult } = renderHook(() => useAtom(formAtom));
    const [{ isValid }] = formResult.current;
    expect(isValid).toBe(true);
  });
});

describe("useForm", () => {
  test("should not show errors for invalid fields before submission", () => {
    const { formFieldAtom } = createForm();
    const testString = formFieldAtom<string, "required">({
      initialState: "",
      validate: (value) => {
        if (value.length === 0) return "required";
      },
    });

    const { result: fieldResult } = renderHook(() => useAtom(testString));
    const [{ showError }] = fieldResult.current;
    expect(showError).toBe(false);
  });

  test("should show errors for invalid fields after submission", () => {
    const { formFieldAtom, useForm } = createForm();
    const testString = formFieldAtom<string, "required">({
      initialState: "",
      validate: (value) => {
        if (value.length === 0) return "required";
      },
    });

    const { result } = renderHook(() =>
      useForm({
        onValid: () => {
          /* do nothing */
        },
      }),
    );
    const { submitForm } = result.current;
    act(() => {
      submitForm();
    });

    const { result: fieldResult } = renderHook(() => useAtom(testString));
    const [{ showError }] = fieldResult.current;
    expect(showError).toBe(true);
  });

  test("should not show errors for invalid fields after submission and reset validation", () => {
    const { formFieldAtom, useForm } = createForm();
    const testString = formFieldAtom<string, "required">({
      initialState: "",
      validate: (value) => {
        if (value.length === 0) return "required";
      },
    });

    const { result } = renderHook(() =>
      useForm({
        onValid: () => {
          /* do nothing */
        },
      }),
    );
    const { submitForm, resetValidation } = result.current;
    act(() => {
      submitForm();
    });

    const { result: fieldResult } = renderHook(() => useAtom(testString));
    const [{ showError }] = fieldResult.current;
    expect(showError).toBe(true);

    act(() => {
      resetValidation();
    });
    const { result: newFieldResult } = renderHook(() => useAtom(testString));
    const [{ showError: newShowError }] = newFieldResult.current;
    expect(newShowError).toBe(false);
  });

  test("should not show errors if field is valid after submission", async () => {
    const { formFieldAtom, useForm } = createForm();
    const testString = formFieldAtom<string, "required">({
      initialState: "",
      validate: (value) => {
        if (value.length === 0) return "required";
      },
    });

    const { result } = renderHook(() =>
      useForm({
        onValid: () => {
          /* do nothing */
        },
      }),
    );
    const { submitForm } = result.current;
    const { result: fieldResult } = renderHook(() => useAtom(testString));
    const [_, setValue] = fieldResult.current;
    act(() => {
      setValue("test value");
    });
    await waitFor(() => {
      submitForm();
    });

    const { result: newFieldResult } = renderHook(() => useAtom(testString));
    const [{ showError }] = newFieldResult.current;
    expect(showError).toBe(false);
  });

  test("should call onValid if form is valid after submission", async () => {
    const { formFieldAtom, useForm } = createForm();
    const testString = formFieldAtom<string, "required">({
      initialState: "",
      validate: (value) => {
        if (value.length === 0) return "required";
      },
    });

    const mockOnValid = vi.fn();

    const { result } = renderHook(() =>
      useForm({
        onValid: mockOnValid,
      }),
    );
    const { submitForm } = result.current;
    const { result: fieldResult } = renderHook(() => useAtom(testString));
    const [_, setValue] = fieldResult.current;
    act(() => {
      setValue("test value");
    });
    await waitFor(() => {
      submitForm();
    });

    expect(mockOnValid).toBeCalled();
  });

  test("should not call onValid if form is invalid after submission", async () => {
    const { formFieldAtom, useForm } = createForm();
    formFieldAtom<string, "required">({
      initialState: "",
      validate: (value) => {
        if (value.length === 0) return "required";
      },
    });

    const mockOnValid = vi.fn();

    const { result } = renderHook(() =>
      useForm({
        onValid: mockOnValid,
      }),
    );
    const { submitForm } = result.current;
    await waitFor(() => {
      submitForm();
    });

    expect(mockOnValid).not.toBeCalled();
  });

  test("should not call onError if form is valid after submission", async () => {
    const { formFieldAtom, useForm } = createForm();
    const testString = formFieldAtom<string, "required">({
      initialState: "",
      validate: (value) => {
        if (value.length === 0) return "required";
      },
    });

    const mockOnError = vi.fn();

    const { result } = renderHook(() =>
      useForm({
        onValid: () => {
          /* do nothing */
        },
        onError: mockOnError,
      }),
    );
    const { submitForm } = result.current;
    const { result: fieldResult } = renderHook(() => useAtom(testString));
    const [_, setValue] = fieldResult.current;
    act(() => {
      setValue("test value");
    });
    await waitFor(() => {
      submitForm();
    });

    expect(mockOnError).not.toBeCalled();
  });

  test("should call onError if form is invalid after submission", () => {
    const { formFieldAtom, useForm } = createForm();
    formFieldAtom<string, "required">({
      initialState: "",
      validate: (value) => {
        if (value.length === 0) return "required";
      },
    });

    const mockOnError = vi.fn();

    const { result } = renderHook(() =>
      useForm({
        onValid: () => {
          /* do nothing */
        },
        onError: mockOnError,
      }),
    );
    const { submitForm } = result.current;
    act(() => {
      submitForm();
    });

    expect(mockOnError).toBeCalled();
  });
});

describe("createForm", () => {
  test("should keep track of formFields", () => {
    const { formFieldAtom, formFields } = internalCreateForm();
    const testBool = formFieldAtom({
      initialState: false,
      debugLabel: "testBool",
    });
    const testNumber = formFieldAtom({
      initialState: 1,
      debugLabel: "testNumber",
    });
    const testString = formFieldAtom({
      initialState: "hello",
      debugLabel: "testString",
    });
    expect(Array.from(formFields)).toEqual([testBool, testNumber, testString]);
  });

  test("should track dynamically added fields to formFieldFamily in Set", () => {
    const { formFieldAtomFamily, formFields } = internalCreateForm();
    const testFamily = formFieldAtomFamily({
      initialState: 0,
      debugLabel: "testFamily",
    });
    const testOne = testFamily("one");
    const testTwo = testFamily("two");
    const testThree = testFamily("three");
    expect(Array.from(formFields)).toEqual([testOne, testTwo, testThree]);
  });

  test("should track dynamically removed fields from formFieldFamily in Set", () => {
    const { formFieldAtomFamily, formFields } = internalCreateForm();
    const testFamily = formFieldAtomFamily({
      initialState: 0,
      debugLabel: "testFamily",
    });
    const testOne = testFamily("one");
    const _testTwo = testFamily("two");
    const testThree = testFamily("three");
    testFamily.remove("two");
    expect(Array.from(formFields)).toEqual([testOne, testThree]);
  });

  test("should track dynamically added fields to formFieldFamily in Map", () => {
    const { formFieldAtomFamily, formFieldAtomFamilies } = internalCreateForm();
    const testFamily = formFieldAtomFamily({
      initialState: 0,
      debugLabel: "testFamily",
    });
    const testOne = testFamily("one");
    const testTwo = testFamily("two");
    const testThree = testFamily("three");
    expect(
      Array.from(Array.from(formFieldAtomFamilies)[0][1]).map(
        ([key, value]) => {
          // we do not care about the createdAt timestamp, so we only return the atom here
          return [key, value[0]];
        },
      ),
    ).toEqual([
      ["one", testOne],
      ["two", testTwo],
      ["three", testThree],
    ]);
  });

  test("should track dynamically removed fields from formFieldFamily in Map", () => {
    const { formFieldAtomFamily, formFieldAtomFamilies } = internalCreateForm();
    const testFamily = formFieldAtomFamily({
      initialState: 0,
      debugLabel: "testFamily",
    });
    const testOne = testFamily("one");
    const _testTwo = testFamily("two");
    const testThree = testFamily("three");
    testFamily.remove("two");
    expect(
      Array.from(Array.from(formFieldAtomFamilies)[0][1]).map(
        ([key, value]) => {
          // we do not care about the createdAt timestamp, so we only return the atom here
          return [key, value[0]];
        },
      ),
    ).toEqual([
      ["one", testOne],
      ["three", testThree],
    ]);
  });
});

describe("compatibility of formFieldAtomFamily with Jotai atomFamily API", () => {
  test("should create a new atom instance for a new param", () => {
    const { formFieldAtomFamily } = internalCreateForm();
    const countAtomFamily = formFieldAtomFamily({
      initialState: 0,
      debugLabel: "testFamily",
    });
    const countAtomFirst = countAtomFamily("first");

    const { result } = renderHook(() => useAtom(countAtomFirst));
    const [{ value }] = result.current;
    expect(value).toBe(0);
  });

  test("changing an atom from the family should change its value", () => {
    const { formFieldAtomFamily } = internalCreateForm();
    const countAtomFamily = formFieldAtomFamily<string, number>({
      initialState: 0,
      debugLabel: "testFamily",
    });
    const countAtomFirst = countAtomFamily("first");

    const { result } = renderHook(() => useAtom(countAtomFirst));
    const [_, setValue] = result.current;
    act(() => {
      setValue(1);
    });

    const { result: newResult } = renderHook(() => useAtom(countAtomFirst));
    const [{ value }] = newResult.current;
    expect(value).toBe(1);
  });

  test("changing one atom from the family should not change others", () => {
    const { formFieldAtomFamily } = internalCreateForm();
    const countAtomFamily = formFieldAtomFamily<string, number>({
      initialState: 0,
      debugLabel: "testFamily",
    });
    const countAtomFirst = countAtomFamily("first");
    const countAtomSecond = countAtomFamily("second");

    const { result } = renderHook(() => useAtom(countAtomFirst));
    const [_, setValue] = result.current;
    act(() => {
      setValue(1);
    });

    const { result: secondResult } = renderHook(() => useAtom(countAtomSecond));
    const [_2, setSecondValue] = secondResult.current;
    act(() => {
      setSecondValue(2);
    });

    const { result: newResult } = renderHook(() => useAtom(countAtomSecond));
    const [{ value }] = newResult.current;
    expect(value).toBe(2);
  });

  test("getting atom from the family with the same param should result in the same atom", () => {
    const { formFieldAtomFamily } = internalCreateForm();
    const countAtomFamily = formFieldAtomFamily<string, number>({
      initialState: 0,
      debugLabel: "testFamily",
    });
    const countAtomFirst = countAtomFamily("first");

    const { result } = renderHook(() => useAtom(countAtomFirst));
    const [_, setValue] = result.current;
    act(() => {
      setValue(1);
    });

    const countAtomFirstAgain = countAtomFamily("first");
    const { result: newResult } = renderHook(() =>
      useAtom(countAtomFirstAgain),
    );
    const [{ value: newValue }] = newResult.current;
    expect(newValue).toBe(1);
  });

  test("calling remove should remove an atom from the family", () => {
    const { formFieldAtomFamily } = internalCreateForm();
    const countAtomFamily = formFieldAtomFamily<string, number>({
      initialState: 0,
      debugLabel: "testFamily",
    });
    const countAtomFirst = countAtomFamily("first");

    const { result } = renderHook(() => useAtom(countAtomFirst));
    const [_, setValue] = result.current;
    act(() => {
      setValue(1);
    });

    countAtomFamily.remove("first");

    const countAtomFirstAgain = countAtomFamily("first");
    const { result: newResult } = renderHook(() =>
      useAtom(countAtomFirstAgain),
    );
    const [{ value: newValue }] = newResult.current;
    expect(newValue).toBe(0);
  });

  test("should not remove atom when shouldRemove function returns false", () => {
    const { formFieldAtomFamily } = internalCreateForm();
    const countAtomFamily = formFieldAtomFamily<string, number>({
      initialState: 0,
      debugLabel: "testFamily",
    });
    const countAtomFirst = countAtomFamily("first");

    const { result } = renderHook(() => useAtom(countAtomFirst));
    const [_, setValue] = result.current;
    act(() => {
      setValue(1);
    });

    function shouldRemove(createdAt: number, param: string) {
      expect(createdAt).toBeGreaterThan(0);
      expect(createdAt).toBeLessThanOrEqual(Date.now());
      expect(param).toBe("first");
      return false;
    }
    countAtomFamily.setShouldRemove(shouldRemove);

    const countAtomFirstAgain = countAtomFamily("first");
    const { result: newResult } = renderHook(() =>
      useAtom(countAtomFirstAgain),
    );
    const [{ value: newValue }] = newResult.current;
    expect(newValue).toBe(1);
  });

  test("should remove atom when shouldRemove function returns true", () => {
    const { formFieldAtomFamily } = internalCreateForm();
    const countAtomFamily = formFieldAtomFamily<string, number>({
      initialState: 0,
      debugLabel: "testFamily",
    });
    const countAtomFirst = countAtomFamily("first");

    const { result } = renderHook(() => useAtom(countAtomFirst));
    const [_, setValue] = result.current;
    act(() => {
      setValue(1);
    });

    function shouldRemove(createdAt: number, param: string) {
      expect(createdAt).toBeGreaterThan(0);
      expect(createdAt).toBeLessThanOrEqual(Date.now());
      expect(param).toBe("first");
      return true;
    }
    countAtomFamily.setShouldRemove(shouldRemove);

    const countAtomFirstAgain = countAtomFamily("first");
    const { result: newResult } = renderHook(() =>
      useAtom(countAtomFirstAgain),
    );
    const [{ value: newValue }] = newResult.current;
    expect(newValue).toBe(0);
  });

  test("should notify listeners", () => {
    const { formFieldAtomFamily } = internalCreateForm();
    const aFamily = formFieldAtomFamily<string, number>({
      initialState: 0,
      debugLabel: "testFamily",
    });
    const listener = vi.fn(() => {
      /* do nothing */
    });
    interface JotaiEvent {
      type: "CREATE" | "REMOVE";
      param: number;
      atom: Atom<number>;
    }
    const unsubscribe = aFamily.unstable_listen(listener);
    const atom1 = aFamily("1");
    expect(listener).toHaveBeenCalledTimes(1);
    // FIXME: this is not a void expression, it actually returns the jotai event
    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    const eventCreate = listener.mock.calls[0]?.at(0) as unknown as JotaiEvent;
    expect(eventCreate.type).toEqual("CREATE");
    expect(eventCreate.param).toEqual("1");
    expect(eventCreate.atom).toEqual(atom1);
    listener.mockClear();
    aFamily.remove("1");
    expect(listener).toHaveBeenCalledTimes(1);
    // FIXME: this is not a void expression, it actually returns the jotai event
    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    const eventRemove = listener.mock.calls[0]?.at(0) as unknown as JotaiEvent;
    expect(eventRemove.type).toEqual("REMOVE");
    expect(eventRemove.param).toEqual("1");
    expect(eventRemove.atom).toEqual(atom1);
    unsubscribe();
    listener.mockClear();
    aFamily("2");
    expect(listener).toHaveBeenCalledTimes(0);
  });

  test("should return all params", () => {
    const store = createStore();

    const { formFieldAtomFamily } = internalCreateForm();
    const aFamily = formFieldAtomFamily<string, number>({
      initialState: 0,
      debugLabel: "testFamily",
    });

    expect(store.get(aFamily("1")).value).toEqual(0);
    expect(store.get(aFamily("2")).value).toEqual(0);
    expect(store.get(aFamily("3")).value).toEqual(0);
    expect(Array.from(aFamily.getParams())).toEqual(["1", "2", "3"]);
  });
});

describe("compatibility of formFieldAtomFamily with Jotai atomFamily API (with areEqual)", () => {
  test("changing an atom should change another atom with an equal param", () => {
    function areEqual(_a: string, _b: string) {
      return true;
    }
    const { formFieldAtomFamily } = internalCreateForm();
    const countAtomFamily = formFieldAtomFamily<string, number>(
      {
        initialState: 0,
        debugLabel: "testFamily",
      },
      areEqual,
    );
    const countAtomFirst = countAtomFamily("first");
    const countAtomSecond = countAtomFamily("second");

    const { result } = renderHook(() => useAtom(countAtomFirst));
    const [_, setValue] = result.current;
    act(() => {
      setValue(1);
    });

    const { result: newResult } = renderHook(() => useAtom(countAtomSecond));
    const [{ value }] = newResult.current;
    expect(value).toBe(1);
  });

  test("changing an atom should NOT change another atom if the param is not equal", () => {
    function areEqual(_a: string, _b: string) {
      return false;
    }
    const { formFieldAtomFamily } = internalCreateForm();
    const countAtomFamily = formFieldAtomFamily<string, number>(
      {
        initialState: 0,
        debugLabel: "testFamily",
      },
      areEqual,
    );
    const countAtomFirst = countAtomFamily("first");
    const countAtomSecond = countAtomFamily("second");

    const { result } = renderHook(() => useAtom(countAtomFirst));
    const [_, setValue] = result.current;
    act(() => {
      setValue(1);
    });

    const { result: newResult } = renderHook(() => useAtom(countAtomSecond));
    const [{ value }] = newResult.current;
    expect(value).toBe(0);
  });

  test("calling remove should remove all atoms with equal params", () => {
    function transformParam(param: string) {
      // transform "second" to "first" so that they are equal
      if (param === "second") return "first";
      return param;
    }
    function areEqual(a: string, b: string) {
      return transformParam(a) === transformParam(b);
    }
    const { formFieldAtomFamily } = internalCreateForm();
    const countAtomFamily = formFieldAtomFamily<string, number>(
      {
        initialState: 0,
        debugLabel: "testFamily",
      },
      areEqual,
    );
    const countAtomFirst = countAtomFamily("first");
    const countAtomSecond = countAtomFamily("second");
    const countAtomThird = countAtomFamily("third");

    const { result } = renderHook(() => useAtom(countAtomFirst));
    const [_, setValue] = result.current;
    act(() => {
      setValue(1);
    });

    const { result: secondResult } = renderHook(() => useAtom(countAtomSecond));
    const [_2, setSecondValue] = secondResult.current;
    act(() => {
      setSecondValue(2);
    });

    const { result: thirdResult } = renderHook(() => useAtom(countAtomThird));
    const [_3, setThirdValue] = thirdResult.current;
    act(() => {
      setThirdValue(3);
    });

    countAtomFamily.remove("first");

    const countAtomFirstAgain = countAtomFamily("first");
    const { result: newResult } = renderHook(() =>
      useAtom(countAtomFirstAgain),
    );
    const [{ value: newValue }] = newResult.current;
    expect(newValue).toBe(0);

    const countAtomSecondAgain = countAtomFamily("second");
    const { result: newSecondResult } = renderHook(() =>
      useAtom(countAtomSecondAgain),
    );
    const [{ value: newSecondValue }] = newSecondResult.current;
    expect(newSecondValue).toBe(0);

    const countAtomThirdAgain = countAtomFamily("third");
    const { result: newThirdResult } = renderHook(() =>
      useAtom(countAtomThirdAgain),
    );
    const [{ value: newThirdValue }] = newThirdResult.current;
    expect(newThirdValue).toBe(3);
  });
});

describe("different ref types", () => {
  test("using a textarea with a formField", () => {
    const { formFieldAtom } = createForm();

    const atom = formFieldAtom<string, "required", HTMLTextAreaElement>({
      initialState: "",
      validate: (value) => {
        if (value.length === 0) return "required";
      },
    });

    const {
      result: {
        current: { ref },
      },
    } = renderHook(() =>
      useFormField({
        atom,
      }),
    );

    render(<textarea ref={ref} />);

    expect(ref.current.tagName).toBe("TEXTAREA");
  });

  test("using a textarea with a formFieldFamily", () => {
    const { formFieldAtomFamily } = createForm();

    const atomFamily = formFieldAtomFamily<
      string,
      string,
      undefined,
      HTMLTextAreaElement
    >({
      initialState: "",
    });

    const atomOne = atomFamily("one");

    const {
      result: {
        current: { ref },
      },
    } = renderHook(() =>
      useFormField({
        atom: atomOne,
      }),
    );

    render(<textarea ref={ref} />);

    expect(ref.current.tagName).toBe("TEXTAREA");
  });
});
