'use client';

import { useState } from 'react';
import type { SyntheticEvent } from 'react';

import type { StaffCreateInput, StaffRole } from '@repo/schemas/staff';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';

import { RoleCheckboxes } from './RoleCheckboxes';

interface CreateStaffFormProps {
  readonly isSubmitting: boolean;
  readonly errorMessage: string | null;
  readonly onSubmit: (input: StaffCreateInput) => void;
}

export function CreateStaffForm({ isSubmitting, errorMessage, onSubmit }: CreateStaffFormProps): React.JSX.Element {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [roles, setRoles] = useState<StaffRole[]>([]);

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (roles.length === 0) return;
    onSubmit({ email, password, name, roles });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMessage !== null ? (
        <p role="alert" className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-4 py-3 text-sm">
          {errorMessage}
        </p>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor="staff-name">Họ tên</Label>
        <Input
          id="staff-name"
          required
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="staff-email">Email</Label>
        <Input
          id="staff-email"
          type="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="staff-password">Mật khẩu</Label>
        <Input
          id="staff-password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
          }}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Role</Label>
        <RoleCheckboxes value={roles} onChange={setRoles} />
        {roles.length === 0 ? <p className="text-muted-foreground text-xs">Chọn ít nhất một Role.</p> : null}
      </div>

      <Button type="submit" disabled={isSubmitting || roles.length === 0}>
        {isSubmitting ? 'Đang tạo...' : 'Tạo nhân viên'}
      </Button>
    </form>
  );
}
