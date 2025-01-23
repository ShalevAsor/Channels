"use client";
/**
 * Modal Management System
 * Centralizes all application modals and handles their mounting behavior
 * to prevent hydration mismatches and ensure proper client-side rendering.
 */
import { useState, useEffect } from "react";
import { CreateServerModal } from "@/components/modals/create-server-modal";
import { InviteModal } from "@/components/modals/invite-modal";
import { EditServerModal } from "@/components/modals/edit-server-modal";
import { MembersModal } from "@/components/modals/members-modal";
import { CreateChannelModal } from "@/components/modals/create-channel-modal";
import { LeaveServerModal } from "@/components/modals/leave-server-modal";
import { DeleteServerModal } from "@/components/modals/delete-server-modal";
import { DeleteChannelModal } from "@/components/modals/delete-channel-modal";
import { EditChannelModal } from "@/components/modals/edit-channel-modal";
import { MessageFileModal } from "@/components/modals/message-file-modal";
import { DeleteMessageModal } from "../modals/delete-message-modal";
import { SettingsModal } from "../modals/settings-modal";
/**
 * ModalProvider Component
 *
 * Manages all application modals from a single location, implementing
 * delayed mounting to prevent SSR hydration issues.
 *
 * Key aspects:
 * - Prevents hydration mismatches through mounting control
 * - Centralizes modal management
 * - Ensures modals are only rendered client-side
 */
export const ModalProvider = () => {
  /**
   * Mounting State Management
   * Controls when modals become available to prevent SSR issues
   */
  const [isMounted, setIsMounted] = useState(false);
  /**
   * Delayed Mounting Effect
   * Ensures modals are only mounted after initial client-side render
   */
  useEffect(() => {
    setIsMounted(true);
  }, []);
  // Prevent rendering during SSR or initial mount

  if (!isMounted) return null;
  /**
   * Modal Registry
   * Renders all application modals in a single location
   * Each modal handles its own visibility state
   */
  return (
    <>
      <CreateServerModal />
      <InviteModal />
      <EditServerModal />
      <MembersModal />
      <CreateChannelModal />
      <LeaveServerModal />
      <DeleteServerModal />
      <DeleteChannelModal />
      <EditChannelModal />
      <MessageFileModal />
      <DeleteMessageModal />
      <SettingsModal />
    </>
  );
};
