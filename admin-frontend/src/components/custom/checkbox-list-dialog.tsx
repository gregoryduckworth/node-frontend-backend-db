import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export interface CheckboxListItem {
  id: string;
  name: string;
  description?: string;
  disabled?: boolean;
  disabledReason?: string;
}

interface CheckboxListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  warningMessage?: string;
  items: CheckboxListItem[];
  selectedItems: string[];
  onItemChange: (itemName: string) => void;
  onSave: () => void;
  onCancel: () => void;
  saveDisabled?: boolean;
  saving?: boolean;
  saveButtonText?: string;
  cancelButtonText?: string;
  maxHeight?: string;
}

export const CheckboxListDialog = ({
  open,
  onOpenChange,
  title,
  description,
  warningMessage,
  items,
  selectedItems,
  onItemChange,
  onSave,
  onCancel,
  saveDisabled = false,
  saving = false,
  saveButtonText = 'Save',
  cancelButtonText = 'Cancel',
  maxHeight = 'max-h-48',
}: CheckboxListDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
          {warningMessage && (
            <DialogDescription className="p-3 bg-yellow-50 text-yellow-800 rounded-md border border-yellow-200">
              {warningMessage}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className={`${maxHeight} overflow-y-auto space-y-3`}>
          {items.map((item) => (
            <label key={item.name} className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedItems.includes(item.name)}
                onChange={() => onItemChange(item.name)}
                disabled={item.disabled}
                className="mt-1"
                title={item.disabledReason}
              />
              <div className="flex-1">
                <div className={`font-medium ${item.disabled ? 'text-gray-400' : ''}`}>
                  {item.name}
                </div>
                {item.description && (
                  <div
                    className={`text-xs ${
                      item.disabled ? 'text-gray-300' : 'text-muted-foreground'
                    }`}
                  >
                    {item.description}
                  </div>
                )}
                {item.disabled && item.disabledReason && (
                  <div className="text-xs text-orange-600 mt-1">{item.disabledReason}</div>
                )}
              </div>
            </label>
          ))}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel}>
            {cancelButtonText}
          </Button>
          <Button onClick={onSave} disabled={saveDisabled || saving} className="min-w-20">
            {saving && (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
            )}
            {saveButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
