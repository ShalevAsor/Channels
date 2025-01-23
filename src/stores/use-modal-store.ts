/**
 * Modal State Management System
 * Centralizes the state and control of all application modals using Zustand.
 * This store manages modal visibility, type, and associated data for the entire application.
 */
import { Channel, ChannelType, Server } from "@prisma/client";
import { create } from "zustand";
/**
 * Modal Type Definition
 * Defines all possible modal types in the application.
 * This ensures type safety when opening modals throughout the app.
 */
export type ModalType =
  | "createServer"
  | "invite"
  | "editServer"
  | "members"
  | "createChannel"
  | "leaveServer"
  | "deleteServer"
  | "deleteChannel"
  | "editChannel"
  | "messageFile"
  | "deleteMessage"
  | "settings";
/**
 * Modal Data Interface
 * Defines the structure of additional data that can be passed to modals.
 * Allows modals to be context-aware and display relevant information.
 */
interface ModalData {
  server?: Server;
  channel?: Channel;
  channelType?: ChannelType;
  messageId?: string;
  conversationId?: string;
  channelId?: string;
  serverId?: string;
}

/**
 * Modal Store Interface
 * Defines the structure and actions available in the modal state management system.
 */

interface ModalStore {
  type: ModalType | null;
  data: ModalData;
  isOpen: boolean;
  onOpen: (type: ModalType, data?: ModalData) => void;
  onClose: () => void;
}
/**
 * Modal Store Implementation
 * Creates a Zustand store that handles all modal state management.
 * Provides a simple interface for opening and closing modals with associated data.
 */
export const useModalStore = create<ModalStore>((set) => ({
  type: null,
  data: {},
  isOpen: false,
  onOpen: (type, data = {}) => set({ type, isOpen: true, data }),
  onClose: () => set({ type: null, isOpen: false }),
}));
