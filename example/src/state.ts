import { createForm } from "jotai-advanced-forms";

// Create separate form contexts for each form
const nameFormContext = createForm();
const loginFormContext = createForm();

// Name form fields
export const firstNameAtom = nameFormContext.formFieldAtom<string, "required">({
  initialState: "",
  validate: (value) => {
    if (value.length === 0) return "required";
  },
  debugLabel: "firstName",
});

export const lastNameAtom = nameFormContext.formFieldAtom<string>({
  initialState: "",
  debugLabel: "lastName",
});

export const useNameForm = nameFormContext.useForm;

// Login form fields
export const emailField = loginFormContext.formFieldAtom<
  string,
  "required" | "invalid"
>({
  initialState: "",
  validate: (value) => {
    if (value.length === 0) return "required";
    if (!value.includes("@")) return "invalid";
  },
  debugLabel: "email",
});

export const passwordField = loginFormContext.formFieldAtom<
  string,
  "required" | "tooShort"
>({
  initialState: "",
  validate: (value) => {
    if (value.length === 0) return "required";
    if (value.length < 8) return "tooShort";
  },
  debugLabel: "password",
});

export const useLoginForm = loginFormContext.useForm;

// Search field (standalone, doesn't need a form context)
const searchFormContext = createForm();

export const searchField = searchFormContext.formFieldAtom<string>({
  initialState: "",
  debugLabel: "search",
});
