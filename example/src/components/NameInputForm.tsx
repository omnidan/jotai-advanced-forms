import { useFormField } from "jotai-advanced-forms";
import { firstNameAtom, lastNameAtom, useNameForm } from "../state.js";
import { StringInput } from "./StringInput.js";
import type { FormEvent } from "react";

export function NameInputForm() {
  const { submitForm, isSubmitting } = useNameForm({
    onValid: () => {
      alert("Name form is valid!");
    },
  });

  const firstNameProps = useFormField({
    atom: firstNameAtom,
    errors: {
      required: "First name is required!",
    },
  });

  const lastNameProps = useFormField({
    atom: lastNameAtom,
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    submitForm();
  };

  return (
    <div style={{ marginBottom: "2rem" }}>
      <h2>Name Form</h2>
      <form onSubmit={handleSubmit}>
        <label>
          First Name:
          <StringInput {...firstNameProps} />
        </label>
        <label>
          Last Name:
          <StringInput {...lastNameProps} />
        </label>
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: !isSubmitting ? "#4fc3e7" : "#ccc",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: !isSubmitting ? "pointer" : "not-allowed",
          }}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
