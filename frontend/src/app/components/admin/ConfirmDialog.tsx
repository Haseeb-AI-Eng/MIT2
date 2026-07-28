import { AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Button } from '../ui/button';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
}

export function ConfirmDialog({
  open, onOpenChange, title, description, confirmLabel = 'Confirm', destructive = true, onConfirm,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <div className="text-center">
          <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${destructive ? 'bg-red-100' : 'bg-slate-100'}`}>
            <AlertTriangle className={`w-6 h-6 ${destructive ? 'text-red-600' : 'text-slate-600'}`} />
          </div>
          <AlertDialogTitle className="text-xl font-bold text-gray-900">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600 mt-2 text-sm">{description}</AlertDialogDescription>
        </div>
        <div className="flex gap-3 justify-center mt-6">
          <AlertDialogCancel className="border-slate-300 text-gray-700 hover:bg-slate-50">Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              onClick={onConfirm}
              className={destructive ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'}
            >
              {confirmLabel}
            </Button>
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
