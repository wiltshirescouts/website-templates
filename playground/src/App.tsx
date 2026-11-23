import { lazy, Suspense } from "react";
import { Link, Route, Routes } from "react-router-dom";

const pages = {
  content: lazy(() => import("./pages/Content")),
  form: lazy(() => import("./pages/Form")),
  table: lazy(() => import("./pages/Table")),
  "table-toolbar": lazy(() => import("./pages/TableToolbar")),
  library: lazy(() => import("./pages/Library")),
  info: lazy(() => import("./pages/Info")),
  "sign-in": lazy(() => import("./pages/SignIn")),
  "sign-in-not-allowed": lazy(() => import("./pages/SignInNotAllowed")),
  emails: lazy(() => import("./pages/Emails")),
  "emails-brevo-not-set-up": lazy(() => import("./pages/EmailsBrevoOff")),
  "email-edit": lazy(() => import("./pages/EmailEdit")),
} as const;

export function App() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <Routes>
        {Object.entries(pages).map(([path, Page]) => (
          <Route key={path} path={`/${path}`} element={<Page />} />
        ))}
        <Route
          path="*"
          element={
            <main style={{ padding: "2rem" }}>
              <h1>Theme playground</h1>
              <ul>
                {Object.keys(pages).map((p) => (
                  <li key={p}>
                    <Link to={`/${p}`}>{p}</Link>
                  </li>
                ))}
              </ul>
              <p>Add ?mode=light, dark or auto to any page.</p>
            </main>
          }
        />
      </Routes>
    </Suspense>
  );
}
