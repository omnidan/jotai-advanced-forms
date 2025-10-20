import { NameInputForm } from "./components/NameInputForm.js";
import { LoginForm } from "./components/LoginForm.js";
import { SearchBar } from "./components/SearchBar.js";

export function App() {
  return (
    <div style={{ maxWidth: "600px", margin: "2rem auto", padding: "1rem" }}>
      <h1 style={{ color: "#222" }}>Jotai Advanced Forms Examples</h1>
      <p style={{ color: "#666", marginBottom: "2rem" }}>
        This demo showcases the various features of the jotai-advanced-forms
        library.
      </p>

      <NameInputForm />
      <LoginForm />
      <SearchBar />
    </div>
  );
}
