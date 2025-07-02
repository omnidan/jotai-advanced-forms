---
id: api
sidebar_position: 3
title: API Reference
---

# API Reference

## `createForm()`

Creates a new form instance. Returns an object with methods and atoms for managing form state.

### Returns

- `formFieldAtom(options)` – Create a single form field atom.
- `formFieldAtomFamily(options, areEqual?)` – Create a family of form field atoms (for dynamic fields).
- `multiFormField(options, areEqual?)` – Create and manage dynamic arrays of fields.
- `formAtom` – Atom representing the overall form state.
- `useForm(options)` – React hook for handling form submission and validation.

---

## Field Atoms

### `formFieldAtom(options)`

Creates a form field atom with validation and error state.

#### Options

- `initialState` – Initial value of the field.
- `validate` – Optional validation function.
- `debugLabel` – Optional label for debugging.

### `formFieldAtomFamily(options, areEqual?)`

Creates a family of form field atoms for dynamic fields (e.g., arrays).

#### Options

- `initialState` – Initial value for each field.
- `validate(param)` – Returns a validation function for each param.
- `debugLabel` – Optional label for debugging.
- `areEqual` – Optional function to compare params.

### `multiFormField(options, areEqual?)`

Creates a dynamic array of fields (e.g., for multiple emails).

#### Returns

- `atomFamily` – The atom family for the fields.
- `idCounterAtom` – Atom for generating unique IDs.
- `usedIdsAtom` – Atom for tracking used IDs.
- `valuesAtom` – Atom for the array of field values.

---

## Form State

### `formAtom`

Atom representing the form's state, including validity and error focus management.

### `useForm(options)`

React hook for handling form submission and validation.

#### Options

- `onValid` – Called when the form is valid.
- `onError` – Called when the form is invalid.

#### Returns

- `submitForm()` – Triggers form validation and submission.
- `isSubmitting` – Boolean indicating if the form is submitting.
- `resetValidation()` – Resets the form's validation state.

---

## Types

- `FormField<TValue, TErrorMessageKeys, TRef>` – State for a single field.
- `Form` – State for the whole form.
- `FormFieldAtom`, `FormFieldAtomFamily`, `MultiFormField` – Atom types for fields.

See the [source code](https://github.com/omnidan/jotai-advanced-forms/blob/main/src/form.ts) for full type definitions.
