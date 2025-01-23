import { render, screen, within } from "@testing-library/react";
import { UserServers } from "@/components/home/user-servers";
import { MemberRole } from "@prisma/client";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import type { ServerWithMemberInfo } from "@/types";

// Mock the next/navigation module
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Create properly typed mock data using the imported type
const mockServers: ServerWithMemberInfo[] = [
  {
    // Base Server properties
    id: "server1",
    name: "Gaming Server",
    imageUrl: "/mock-image-1.jpg",
    inviteCode: "gaming123",
    userId: "creator1",
    isPublic: true,
    category: "Gaming",
    tags: ["games", "fun"],
    description: "A server for gamers",
    createdAt: new Date(),
    updatedAt: new Date(),

    // Additional properties from ServerWithMemberInfo
    members: [
      {
        id: "member1", // Required by your type
        userId: "user1-server1", // Required by your type
        role: MemberRole.ADMIN, // Required by your type
      },
      {
        id: "member2",
        userId: "user2-server1",
        role: MemberRole.GUEST,
      },
    ],
    _count: {
      members: 2,
    },
  },
  {
    id: "server2",
    name: "Book Club",
    imageUrl: "/mock-image-2.jpg",
    inviteCode: "books123",
    userId: "creator2",
    isPublic: false,
    category: "Education",
    tags: ["books", "reading"],
    description: "Discuss your favorite books",
    createdAt: new Date(),
    updatedAt: new Date(),

    members: [
      {
        id: "member3",
        userId: "user1-server2",
        role: MemberRole.MODERATOR,
      },
    ],
    _count: {
      members: 1,
    },
  },
];

describe("UserServers Component", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering and Basic Functionality", () => {
    it("renders all server information correctly", () => {
      render(<UserServers servers={mockServers} userId="user1-server1" />);

      // Test search input
      const searchInput = screen.getByPlaceholderText("Search servers...");
      expect(searchInput).toBeInTheDocument();

      // Test server count display
      expect(screen.getByText("Showing 2 of 2 servers")).toBeInTheDocument();

      // Test server cards
      mockServers.forEach((server) => {
        const serverCard = screen
          .getByText(server.name)
          .closest(".group") as HTMLElement;
        expect(serverCard).toBeInTheDocument();

        // Check server visibility badge
        const visibilityBadge = within(serverCard).getByText(
          server.isPublic ? "Public" : "Private"
        );
        expect(visibilityBadge).toBeInTheDocument();
        expect(visibilityBadge).toHaveClass(
          server.isPublic ? "bg-emerald-500/90" : "bg-rose-500/90"
        );

        // Check description
        if (server.description) {
          expect(
            within(serverCard).getByText(server.description)
          ).toBeInTheDocument();
        }

        // Check member count
        expect(
          within(serverCard).getByText(server._count.members.toString())
        ).toBeInTheDocument();

        // Check category
        if (server.category) {
          expect(
            within(serverCard).getByText(server.category)
          ).toBeInTheDocument();
        }

        // Check tags
        server.tags.forEach((tag) => {
          expect(within(serverCard).getByText(tag)).toBeInTheDocument();
        });
      });
    });
  });

  describe("Search Functionality", () => {
    it("filters servers case-insensitively", async () => {
      render(<UserServers servers={mockServers} userId="user1" />);

      const searchInput = screen.getByPlaceholderText("Search servers...");

      // Test case-insensitive search
      await userEvent.type(searchInput, "gaming");
      expect(screen.getByText("Gaming Server")).toBeInTheDocument();
      expect(screen.queryByText("Book Club")).not.toBeInTheDocument();

      // Clear and search with different case
      await userEvent.clear(searchInput);
      await userEvent.type(searchInput, "BOOK");
      expect(screen.getByText("Book Club")).toBeInTheDocument();
      expect(screen.queryByText("Gaming Server")).not.toBeInTheDocument();
    });

    it("resets to first page when searching", async () => {
      // Create servers with completely different names to avoid partial matches
      const manyServers = Array.from({ length: 15 }, (_, i) => ({
        ...mockServers[0],
        id: `server${i}`,
        name: i === 0 ? "Alpha Team" : `Beta Team ${i}`, // Using distinct names
        members: [
          {
            id: `member${i}`,
            userId: `user${i}`,
            role: MemberRole.GUEST,
          },
        ],
      }));

      render(<UserServers servers={manyServers} userId="user1" />);

      // Go to second page
      await userEvent.click(screen.getByText("Next"));

      // Now search for a unique server name
      const searchInput = screen.getByPlaceholderText("Search servers...");
      await userEvent.type(searchInput, "Alpha");

      // We should only see Alpha Team
      expect(screen.getByText("Alpha Team")).toBeInTheDocument();
      expect(screen.queryByText("Beta")).not.toBeInTheDocument();
    });
  });
  describe("Role Display", () => {
    it("displays admin role with correct styling when user is admin", () => {
      render(<UserServers servers={mockServers} userId="user1-server1" />);

      // Find the Gaming Server card where our test user is an admin
      const adminRole = screen.getByText("admin");

      // Verify the role badge has the correct color
      expect(adminRole).toHaveClass("bg-rose-500/90");
    });

    it("displays moderator role with correct styling when user is moderator", () => {
      render(<UserServers servers={mockServers} userId="user1-server2" />);

      // Find the Book Club card where our test user is a moderator
      const moderatorRole = screen.getByText("moderator");

      // Verify the role badge has the correct color
      expect(moderatorRole).toHaveClass("bg-indigo-500/90");
    });

    it("displays guest role with correct styling when user is not a member", () => {
      render(<UserServers servers={mockServers} userId="non-member" />);

      // Find the first server's guest badge more specifically
      const firstServer = screen.getByText("Gaming Server").closest(".group");
      const guestRole = within(firstServer as HTMLElement).getByText("guest", {
        selector: '[class*="bg-emerald-500"]',
      });

      // Verify the role badge has the correct color
      expect(guestRole).toHaveClass("bg-emerald-500/90");
    });
  });

  describe("Pagination", () => {
    it("shows correct number of servers per page and enables navigation", async () => {
      // Create 12 servers so we have 2 pages (9 items per page)
      const manyServers = Array.from({ length: 12 }, (_, i) => ({
        ...mockServers[0],
        id: `server${i}`,
        name: `Server ${i + 1}`,
      }));

      render(<UserServers servers={manyServers} userId="user1-server1" />);

      // Check first page content
      expect(screen.getByText("Server 1")).toBeInTheDocument();
      expect(screen.getByText("Server 9")).toBeInTheDocument();
      expect(screen.queryByText("Server 10")).not.toBeInTheDocument();

      // Navigate to next page
      await userEvent.click(screen.getByRole("button", { name: /next/i }));

      // Check second page content
      expect(screen.queryByText("Server 1")).not.toBeInTheDocument();
      expect(screen.getByText("Server 10")).toBeInTheDocument();
      expect(screen.getByText("Server 12")).toBeInTheDocument();

      // Check server count display
      expect(screen.getByText("Showing 3 of 12 servers")).toBeInTheDocument();
    });
    it("handles navigation between pages correctly", async () => {
      // Create 12 servers (requiring 2 pages)
      const paginatedServers = Array.from({ length: 12 }, (_, i) => ({
        ...mockServers[0],
        id: `server${i}`,
        name: `Server ${i + 1}`,
      }));

      render(<UserServers servers={paginatedServers} userId="user1" />);

      // Check initial page
      expect(screen.getByText("Server 1")).toBeInTheDocument();
      expect(screen.getByText("Server 9")).toBeInTheDocument();
      expect(screen.queryByText("Server 10")).not.toBeInTheDocument();

      // Navigate to next page
      const nextButton = screen.getByText("Next");
      await userEvent.click(nextButton);

      // Check second page content
      expect(screen.queryByText("Server 1")).not.toBeInTheDocument();
      expect(screen.getByText("Server 10")).toBeInTheDocument();

      // Check button states
      expect(nextButton).toBeDisabled();
      expect(screen.getByText("Previous")).not.toBeDisabled();
    });
  });

  describe("Server Navigation", () => {
    it("navigates to the correct server page when clicking Open Server", async () => {
      render(<UserServers servers={mockServers} userId="user1" />);

      // Find and click the Open Server button for the first server
      const firstServerCard = screen
        .getByText("Gaming Server")
        .closest(".group") as HTMLElement;
      const openServerButton = within(firstServerCard).getByText("Open Server");
      await userEvent.click(openServerButton);

      // Verify navigation
      expect(mockPush).toHaveBeenCalledWith("/servers/server1");
    });
  });

  describe("Edge Cases", () => {
    it("handles servers with missing optional fields", () => {
      const serverWithMissingFields: ServerWithMemberInfo = {
        ...mockServers[0],
        description: null,
        category: null,
        tags: [],
      };

      render(
        <UserServers servers={[serverWithMissingFields]} userId="user1" />
      );

      const serverCard = screen
        .getByText(serverWithMissingFields.name)
        .closest(".group") as HTMLElement;

      // Verify optional fields are not rendered
      expect(
        within(serverCard).queryByText("Category:")
      ).not.toBeInTheDocument();
      expect(
        within(serverCard).queryByTestId("tags-container")
      ).not.toBeInTheDocument();
    });

    it("handles empty server list", () => {
      render(<UserServers servers={[]} userId="user1" />);

      expect(screen.getByText("Showing 0 of 0 servers")).toBeInTheDocument();
    });
  });
});
