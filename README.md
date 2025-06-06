<h1 align="center">Jotai Advanced Forms</h1>

<p align="center">📋 collection of atoms, utility functions and hooks to easily create forms with jotai and react</p>

<p align="center">
	<!-- prettier-ignore-start -->
	<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
	<a href="#contributors" target="_blank"><img alt="👪 All Contributors: 1" src="https://img.shields.io/badge/%F0%9F%91%AA_all_contributors-1-21bb42.svg" /></a>
<!-- ALL-CONTRIBUTORS-BADGE:END -->
	<!-- prettier-ignore-end -->
	<a href="https://github.com/omnidan/jotai-advanced-forms/blob/main/.github/CODE_OF_CONDUCT.md" target="_blank"><img alt="🤝 Code of Conduct: Kept" src="https://img.shields.io/badge/%F0%9F%A4%9D_code_of_conduct-kept-21bb42" /></a>
	<a href="https://codecov.io/gh/omnidan/jotai-advanced-forms" target="_blank"><img alt="🧪 Coverage" src="https://img.shields.io/codecov/c/github/omnidan/jotai-advanced-forms?label=%F0%9F%A7%AA%20coverage" /></a>
	<a href="https://github.com/omnidan/jotai-advanced-forms/blob/main/LICENSE.md" target="_blank"><img alt="📝 License: MIT" src="https://img.shields.io/badge/%F0%9F%93%9D_license-MIT-21bb42.svg"></a>
	<a href="http://npmjs.com/package/jotai-advanced-forms"><img alt="📦 npm version" src="https://img.shields.io/npm/v/jotai-advanced-forms?color=21bb42&label=%F0%9F%93%A6%20npm" /></a>
	<img alt="💪 TypeScript: Strict" src="https://img.shields.io/badge/%F0%9F%92%AA_typescript-strict-21bb42.svg" />
</p>

## 🚧 Work in Progress! 🚧

**Attention!** This library is currently under development and may not be fully functional yet! Please check back later for updates! Your patience is appreciated! Thank you for your understanding! 🎉

## Documentation

The docs can be found at https://omnidan.github.io/jotai-advanced-forms/

## Usage

```shell
npm i jotai-advanced-forms
```

In a directory co-located with the component/page that uses the form, place a `state.ts` file, with the following contents:

```ts
import { createForm } from "jotai-advanced-forms";

const { formFieldAtom, useForm } = createForm();
export { useForm };

// required field
export const firstNameAtom = formFieldAtom<string, "required">({
  initialState: "",
  validate: (value) => {
    if (value.length === 0) return "required";
  },
});

// optional field
export const lastNameAtom = formFieldAtom<string, undefined>({
  initialState: "",
});
```

Then, it is advisable to create custom input components that can deal with the props that this library provides:

```tsx
import type { UseFormFieldProps } from "jotai-advanced-forms";

export function StringInput({
  value,
  onChange,
  onBlur,
  ref,
  hasError,
  errorCode,
  errorText,
}: UseFormFieldProps<string>) {
  return (
    <div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        ref={ref}
      />
      {hasError && (
        <p>
          {errorText} ({errorCode})
        </p>
      )}
    </div>
  );
}
```

Now, in a React component that contains the form, you can do the following:

```tsx
import { useFormField } from "jotai-advanced-forms";
import { firstNameAtom, lastNameAtom, useForm } from "./state.js";
import { StringInput } from "./StringInput.js";

export function NameInputForm() {
  const firstNameField = useFormField({
    atom: firstNameAtom,
    errors: {
      // if you do not specify this, it will cause a type error, forcing you to handle error messages!
      required: "First name is required!",
    },
  });

  const lastNameField = useFormField({
    atom: lastNameAtom,
  });

  const { submitForm, isSubmitting } = useForm({
    onValid: () => alert("success!"),
  });

  function handleSubmit(e) {
    e.preventDefault();
    submitForm();
  }

  return (
    <form onSubmit={handleSubmit}>
      <StringInput {...firstNameField} />
      <StringInput {...lastNameField} />
      <input type="submit" value="Submit" disabled={isSubmitting} />
    </form>
  );
}
```

## Development

See [`.github/CONTRIBUTING.md`](./.github/CONTRIBUTING.md), then [`.github/DEVELOPMENT.md`](./.github/DEVELOPMENT.md).
Thanks! 💖

<!-- You can remove this notice if you don't want it 🙂 no worries! -->

> 💝 This package was templated with [`create-typescript-app`](https://github.com/JoshuaKGoldberg/create-typescript-app) using the [`create` engine](https://create.bingo).
