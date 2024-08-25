"use client";

import {
  KeyRound,
  MoreVertical,
  Pencil,
  RotateCcwIcon,
  Trash2Icon,
  Unlink,
} from "lucide-react";
import { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Link } from "@prisma/client";
import { toast } from "sonner";
import { revalidateHomepage } from "../actions/revalidate-homepage";
import { ChangeLinkPasswordModal } from "./change-link-password-modal";
import { deleteLinkHook, resetLink, toggleLink } from "./link-functions";
import UpdateLinkModal from "./update-link-modal";

type LinkActionsProps = {
  link: Link;
};

export const LinkActions = ({ link }: LinkActionsProps) => {
  const [loading, setLoading] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openChangePasswordModal, setOpenChangePasswordModal] = useState(false);
  const isLinkActive = !link.disabled!;

  const handleLinkToggle = async () => {
    setLoading(true);
    try {
      const result = await toggleLink(link.id);
      if (result) {
        toast.success("Link status toggled successfully");
        await revalidateHomepage();
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to toggle link status");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLink = async () => {
    setLoading(true);
    try {
      const result = await deleteLinkHook(link.id);
      if (result) {
        toast.success("Link deleted successfully");
        await revalidateHomepage();
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete link");
    } finally {
      setLoading(false);
    }
  };

  const handleResetLinkStatistics = async () => {
    setLoading(true);
    try {
      const result = await resetLink(link.id);
      if (result) {
        toast.success("Link statistics reseted successfully");
        await revalidateHomepage();
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to reset link statistics");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <MoreVertical className="size-4 cursor-pointer" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => setOpenEditModal(true)}>
              <Pencil className="mr-2 size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLinkToggle}>
              <Unlink className="mr-2 size-4" />
              {isLinkActive ? "Deactivate" : "Activate"} Link
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {link.passwordHash ? (
              <DropdownMenuItem
                className="text-red-500"
                onClick={() => setOpenChangePasswordModal(true)}
                disabled={loading}
              >
                <KeyRound className="mr-2 size-4" />
                Change Password
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                className="text-blue-500"
                onClick={() => setOpenChangePasswordModal(true)}
                disabled={loading}
              >
                <KeyRound className="mr-2 size-4" />
                Add Password
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className="text-red-500 hover:cursor-pointer"
              onClick={handleResetLinkStatistics}
              disabled={loading}
            >
              <RotateCcwIcon className="mr-2 size-4" />
              Reset Statistics
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-500"
              onClick={handleDeleteLink}
              disabled={loading}
            >
              <Trash2Icon className="mr-2 size-4" />
              Delete Link
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <UpdateLinkModal
        link={link}
        open={openEditModal}
        setOpen={setOpenEditModal}
      />
      <ChangeLinkPasswordModal
        open={openChangePasswordModal}
        setOpen={setOpenChangePasswordModal}
        id={link.id}
        hasPassword={!!link.passwordHash}
      />
    </>
  );
};
