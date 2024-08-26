import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { toast } from "sonner";
import { revalidateHomepage } from "../actions/revalidate-homepage";
import { changeLinkPasswordHook } from "./link-functions";

type ChangePasswordModalProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;

  id: string;
  hasPassword: boolean;
};

const getComponentMessages = (hasPassword: boolean) => {
  // Return the appropriate messages based on whether the link has a password or not
  return {
    title: hasPassword ? "Change Password" : "Set Password",
    description: hasPassword
      ? "Change the password for the link."
      : "Set a password for the link.",
    buttonText: hasPassword ? "Update Password" : "Set Password",
    inputPlaceholder: hasPassword ? "New Password" : "Password",

    loading: hasPassword ? "Changing password..." : "Setting password...",
    loadingSuccess: hasPassword
      ? "Password changed successfully"
      : "Password set successfully",
    loadingError: hasPassword
      ? "Failed to change password"
      : "Failed to set password",
  };
};

export function ChangeLinkPasswordModal({
  open,
  setOpen,
  id,
  hasPassword,
}: ChangePasswordModalProps) {
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const componentMessages = getComponentMessages(hasPassword);

  const handlePasswordChange = async () => {
    if (!newPassword) return;

    setLoading(true);
    try {
      const result = await changeLinkPasswordHook(id, newPassword);
      if (result) {
        toast.success(componentMessages.loadingSuccess);
        await revalidateHomepage();
      }
    } catch (error) {
      console.log(error);
      toast.error(`componentMessages.loadingError: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{componentMessages.title}</DialogTitle>
          <DialogDescription>{componentMessages.description}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center">
          <input
            type="password"
            name="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder={componentMessages.inputPlaceholder}
            className="w-[85%] rounded-md border border-neutral-300 p-2 md:w-96"
          />
          <Button
            className="mt-4 w-full"
            onClick={handlePasswordChange}
            disabled={!newPassword || loading}
          >
            {componentMessages.buttonText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
