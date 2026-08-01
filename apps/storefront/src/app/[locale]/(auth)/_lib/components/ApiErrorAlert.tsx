interface ApiErrorAlertProps {
  readonly message: string | null;
}

export function ApiErrorAlert({ message }: ApiErrorAlertProps): React.JSX.Element | null {
  if (message === null) {
    return null;
  }

  return <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{message}</div>;
}
