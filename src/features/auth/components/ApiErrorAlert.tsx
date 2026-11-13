// Hallmark redesign · design-system: design.md · scope: app page (functional, no enrichment)
interface ApiErrorAlertProps {
  readonly message: string | null;
}

export function ApiErrorAlert({ message }: ApiErrorAlertProps): React.JSX.Element | null {
  if (message === null) {
    return null;
  }

  return (
    <div role="alert" aria-live="assertive" className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-4 py-3 text-sm">
      {message}
    </div>
  );
}
