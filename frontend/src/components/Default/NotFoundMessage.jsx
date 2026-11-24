import { ButtonLink, Card } from "../ui";

// Mensagem para ids de URL que não existem (D02).
export default function NotFoundMessage({ title, listPath, listLabel }) {
  return (
    <Card padding={8} className="text-center">
      <h1 className="text-xl font-semibold text-ui-text-primary">{title}</h1>
      <p className="mt-2 text-sm text-ui-text-secondary">
        It may have been removed, or the link is incorrect.
      </p>
      <ButtonLink to={listPath} variant="primary" size="md" className="mt-4">
        Go to {listLabel}
      </ButtonLink>
    </Card>
  );
}
