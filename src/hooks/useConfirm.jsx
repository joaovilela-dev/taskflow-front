import { useState, useCallback } from "react";
import ConfirmDialog from "../components/ConfirmDialog";

export function useConfirm() {
  const [dialog, setDialog] = useState(null);

  const confirm = useCallback((opts) => new Promise(resolve => {
    setDialog({ ...opts, resolve });
  }), []);

  const handleConfirm = () => { dialog.resolve(true);  setDialog(null); };
  const handleCancel  = () => { dialog.resolve(false); setDialog(null); };

  const ConfirmNode = dialog ? (
    <ConfirmDialog
      title={dialog.title}
      description={dialog.description}
      confirmLabel={dialog.confirmLabel}
      danger={dialog.danger}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  ) : null;

  return { confirm, ConfirmNode };
}
