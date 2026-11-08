import { Link } from "react-router-dom";

// Mensagem para ids de URL que não existem (D02).
export default function NotFoundMessage({ title, listPath, listLabel }) {
  return (
    <div className="rounded-lg border border-ui-border bg-ui-surface p-8 text-center">
      <h1 className="text-xl font-semibold text-ui-text-primary">{title}</h1>
      <p className="mt-2 text-sm text-ui-text-secondary">
        It may have been removed, or the link is incorrect.
      </p>
      <Link
        to={listPath}
        className="mt-4 inline-block rounded-md bg-accent-600 px-4 py-2 text-sm font-medium text-white hover:bg-accent-700"
      >
        Go to {listLabel}
      </Link>
    </div>
  );
}
