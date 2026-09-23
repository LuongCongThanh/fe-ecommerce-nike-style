import { useState } from 'react';
import type { SyntheticEvent } from 'react';

import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { useTranslation } from 'react-i18next';

import { TASK_LABELS, TASK_PRIORITIES, TASK_STATUSES } from '@/features/tasks/types';
import type { Task, TaskInput, TaskLabel, TaskPriority, TaskStatus } from '@/features/tasks/types';

interface TaskFormProps {
  readonly initial?: Task;
  readonly submitLabel: string;
  readonly onSubmit: (input: TaskInput) => void;
}

export function TaskForm({ initial, submitLabel, onSubmit }: TaskFormProps): React.JSX.Element {
  const { t } = useTranslation('tasks');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [status, setStatus] = useState(initial?.status ?? 'todo');
  const [priority, setPriority] = useState(initial?.priority ?? 'medium');
  const [label, setLabel] = useState(initial?.label ?? 'feature');

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>): void => {
    e.preventDefault();
    onSubmit({ title, status, priority, label });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="task-title">{t('fields.title')}</Label>
        <Input
          id="task-title"
          required
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
          }}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label>{t('fields.status')}</Label>
          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v as TaskStatus);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TASK_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {t(`status.${s}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>{t('fields.priority')}</Label>
          <Select
            value={priority}
            onValueChange={(v) => {
              setPriority(v as TaskPriority);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TASK_PRIORITIES.map((p) => (
                <SelectItem key={p} value={p}>
                  {t(`priority.${p}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>{t('fields.label')}</Label>
          <Select
            value={label}
            onValueChange={(v) => {
              setLabel(v as TaskLabel);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TASK_LABELS.map((l) => (
                <SelectItem key={l} value={l}>
                  {t(`label.${l}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" className="w-full">
        {submitLabel}
      </Button>
    </form>
  );
}
