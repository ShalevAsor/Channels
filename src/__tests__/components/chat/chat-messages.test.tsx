import { render, screen } from "@testing-library/react";
import { ChatMessages } from "@/components/chat/chat-messages";
import { Member, MemberRole } from "@prisma/client";
import { useChatQuery } from "@/hooks/use-chat-query";
import { useChatSocket } from "@/hooks/use-chat-socket";
import { useChatScroll } from "@/hooks/use-chat-scroll";
import { useChatTyping } from "@/hooks/use-chat-typing";

// Mock all the hooks the component uses
jest.mock("@/hooks/use-chat-query");
jest.mock("@/hooks/use-chat-socket");
jest.mock("@/hooks/use-chat-scroll");
jest.mock("@/hooks/use-chat-typing");

// Create mock data for our tests
const mockMember: Member = {
  id: "member-1",
  role: MemberRole.GUEST,
  userId: "user-1",
  serverId: "server-1",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockMessageParams = {
  serverId: "server-1",
  channelId: "channel-1",
};

describe("ChatMessages Component", () => {
  beforeEach(() => {
    // Set up default mock implementations for our hooks
    (useChatQuery as jest.Mock).mockReturnValue({
      data: { pages: [] },
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      status: "success",
    });

    (useChatSocket as jest.Mock).mockReturnValue({
      isConnected: true,
    });

    (useChatScroll as jest.Mock).mockReturnValue({
      showScrollButton: false,
      scrollToBottom: jest.fn(),
      isUserScrolling: false,
    });

    (useChatTyping as jest.Mock).mockReturnValue({
      typingUsers: [],
    });
  });

  it("renders loading state when messages are being fetched", () => {
    // Mock the chat query hook to return a loading state
    (useChatQuery as jest.Mock).mockReturnValue({
      status: "pending",
      data: null,
    });

    render(
      <ChatMessages
        name="General"
        member={mockMember}
        chatId="chat-1"
        messageParams={mockMessageParams}
        paramKey="channelId"
        paramValue="channel-1"
        type="channel"
      />
    );

    // Verify loading state is shown
    expect(screen.getByText("Loading messages...")).toBeInTheDocument();
    expect(screen.getByRole("img", { hidden: true })).toHaveClass(
      "animate-spin"
    );
  });

  it("renders error state when message fetching fails", () => {
    // Mock the chat query hook to return an error state
    (useChatQuery as jest.Mock).mockReturnValue({
      status: "error",
      data: null,
    });

    render(
      <ChatMessages
        name="General"
        member={mockMember}
        chatId="chat-1"
        messageParams={mockMessageParams}
        paramKey="channelId"
        paramValue="channel-1"
        type="channel"
      />
    );

    // Verify error state is shown
    expect(screen.getByText("Something went wrong!")).toBeInTheDocument();
  });

  it("renders welcome message when there are no more messages to load", () => {
    // Mock empty chat with no more messages to load
    (useChatQuery as jest.Mock).mockReturnValue({
      data: { pages: [] },
      hasNextPage: false,
      status: "success",
    });

    render(
      <ChatMessages
        name="General"
        member={mockMember}
        chatId="chat-1"
        messageParams={mockMessageParams}
        paramKey="channelId"
        paramValue="channel-1"
        type="channel"
      />
    );

    // Verify welcome message is shown for a channel
    expect(screen.getByText(/Welcome to/)).toBeInTheDocument();
    expect(screen.getByText("General")).toBeInTheDocument();
  });

  it("shows load more button when there are more messages", () => {
    // Mock chat query with more messages available
    (useChatQuery as jest.Mock).mockReturnValue({
      data: { pages: [] },
      hasNextPage: true,
      isFetchingNextPage: false,
      status: "success",
      fetchNextPage: jest.fn(),
    });

    render(
      <ChatMessages
        name="General"
        member={mockMember}
        chatId="chat-1"
        messageParams={mockMessageParams}
        paramKey="channelId"
        paramValue="channel-1"
        type="channel"
      />
    );

    // Verify load more button is present
    expect(screen.getByText("Load previous messages")).toBeInTheDocument();
  });
});
