import { beforeEach, describe, expect, it, vi } from 'vitest';

const { toastMock } = vi.hoisted(() => ({
  toastMock: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    dismiss: vi.fn(),
  }),
}));

vi.mock('sonner', () => ({
  toast: toastMock,
}));

import { notify } from '@/shared/lib/notification';

describe('notify', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delegates success notifications to sonner', () => {
    notify.success('Saved', 'Description');
    expect(toastMock.success).toHaveBeenCalledWith('Saved', { description: 'Description' });
  });

  it('delegates error notifications to sonner', () => {
    notify.error('Failed', 'Something went wrong');
    expect(toastMock.error).toHaveBeenCalledWith('Failed', { description: 'Something went wrong' });
  });

  it('delegates info notifications to sonner', () => {
    notify.info('Note');
    expect(toastMock).toHaveBeenCalledWith('Note', { description: undefined });
  });

  it('delegates warning notifications to sonner', () => {
    notify.warning('Caution', 'Please review');
    expect(toastMock.warning).toHaveBeenCalledWith('Caution', { description: 'Please review' });
  });

  it('delegates dismiss calls to sonner', () => {
    notify.dismiss('toast-id');
    expect(toastMock.dismiss).toHaveBeenCalledWith('toast-id');
  });
});
