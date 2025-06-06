import type { ReactNode } from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";

import styles from "./index.module.css";

function HomepageHeader() {
  return (
    <header className={clsx("hero hero--primary", styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          jotai-advanced-forms
        </Heading>
        <p className="hero__subtitle">
          Advanced, type-safe, and composable form state management for React &
          Jotai.
        </p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/getting-started"
          >
            Get Started
          </Link>
          <Link
            className="button button--outline button--lg"
            to="/docs/api"
            style={{ marginLeft: 16 }}
          >
            API Reference
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="jotai-advanced-forms: Advanced, type-safe forms for Jotai"
      description="Advanced, type-safe, and composable form state management for React & Jotai. Validation, dynamic fields, and more."
    >
      <HomepageHeader />
      <main>
        <section className={styles.marketingSection}>
          <div className="container">
            <h2>Why jotai-advanced-forms?</h2>
            <ul className={styles.marketingList}>
              <li>
                🔒 <b>Type-safe</b> form state and validation
              </li>
              <li>
                ⚛️ <b>Composable</b> with Jotai atoms and atom families
              </li>
              <li>
                🧩 <b>Dynamic fields</b> and field arrays
              </li>
              <li>
                ✅ <b>Built-in validation</b> and error management
              </li>
              <li>
                🦾 <b>Accessible</b> focus and error handling
              </li>
              <li>
                📝 <b>Easy integration</b> with any UI library
              </li>
            </ul>
          </div>
        </section>
      </main>
    </Layout>
  );
}
