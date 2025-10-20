import { useFormField } from "jotai-advanced-forms";
import { emailField, passwordField, useLoginForm } from "../state.js";
import { StringInput } from "./StringInput.js";
import type { FormEvent } from "react";

export function LoginForm() {
  const { submitForm, resetForm, isSubmitting } = useLoginForm({
    onValid: () => {
      alert("Login successful!");
    },
  });

  const emailProps = useFormField({
    atom: emailField,
    errors: {
      required: "Email is required!",
      invalid: "Please enter a valid email address.",
    },
  });

  const passwordProps = useFormField({
    atom: passwordField,
    errors: {
      required: "Password is required!",
      tooShort: "Password must be at least 8 characters.",
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    submitForm();
  };

  return (
    <div style={{ marginBottom: "2rem" }}>
      <h2>Login Form (with Reset)</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Email:
          <StringInput {...emailProps} />
        </label>
        <label>
          Password:
          <input
            type="password"
            value={passwordProps.value}
            onChange={(e) => {
              passwordProps.onChange(e.target.value);
            }}
            onBlur={passwordProps.onBlur}
            ref={passwordProps.ref}
            style={{
              padding: "0.5rem",
              border: passwordProps.hasError
                ? "2px solid red"
                : "1px solid #ccc",
              borderRadius: "4px",
              width: "100%",
              marginBottom: "0.5rem",
            }}
          />
          {passwordProps.hasError && (
            <p
              style={{
                color: "red",
                fontSize: "0.875rem",
                marginTop: "0.25rem",
              }}
            >
              {passwordProps.errorText}
            </p>
          )}
        </label>
        <div style={{ display: "flex", gap: "0.5rem" }}>
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
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
          <button
            type="button"
            onClick={resetForm}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#f44336",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Reset Form
          </button>
        </div>
      </form>
    </div>
  );
}
