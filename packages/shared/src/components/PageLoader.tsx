import { LoadingSpinner } from './LoadingSpinner';

export function PageLoader(): React.JSX.Element {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}
