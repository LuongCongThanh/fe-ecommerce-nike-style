import { Label } from './Label';
import { Switch } from './Switch';

export interface ToggleSettingsItem {
  readonly id: string;
  readonly checked: boolean;
  readonly label: string;
  readonly description: string;
  readonly onCheckedChange: (checked: boolean) => void;
}

export interface ToggleSettingsListProps {
  readonly description: string;
  readonly items: readonly ToggleSettingsItem[];
}

export function ToggleSettingsList({ description, items }: ToggleSettingsListProps): React.JSX.Element {
  return (
    <div className="max-w-md space-y-6">
      <p className="text-muted-foreground text-sm">{description}</p>

      {items.map((item) => (
        <div key={item.id} className="flex items-start justify-between gap-4 rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label htmlFor={item.id}>{item.label}</Label>
            <p className="text-muted-foreground text-sm">{item.description}</p>
          </div>
          <Switch id={item.id} checked={item.checked} onCheckedChange={item.onCheckedChange} />
        </div>
      ))}
    </div>
  );
}
