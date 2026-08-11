import { toast } from 'sonner';

interface NotifyOptions {
  readonly description?: string;
  /** Optional action button on the toast (e.g. "Hoàn tác" after removing a cart line). */
  readonly action?: {
    readonly label: string;
    readonly onClick: () => void;
  };
}

function toSonnerOptions(options?: string | NotifyOptions): NotifyOptions | undefined {
  return typeof options === 'string' ? { description: options } : options;
}

export const notify = {
  success: (message: string, options?: string | NotifyOptions) => toast.success(message, toSonnerOptions(options)),
  error: (message: string, options?: string | NotifyOptions) => toast.error(message, toSonnerOptions(options)),
  info: (message: string, options?: string | NotifyOptions) => toast(message, toSonnerOptions(options)),
  warning: (message: string, options?: string | NotifyOptions) => toast.warning(message, toSonnerOptions(options)),
  dismiss: (id?: string | number) => toast.dismiss(id),
};
