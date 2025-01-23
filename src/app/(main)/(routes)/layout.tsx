import { NavigationSidebar } from "@/components/navigation/navigation-sidebar";
import { WebSocketProvider } from "@/components/providers/websocket-provider";

const MainLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-full">
      <div className="hidden md:flex h-full w-[72px] z-30 flex-col fixed inset-y-0">
        <NavigationSidebar />
      </div>

      <main className="md:pl-[72px] h-full">
        <WebSocketProvider>{children}</WebSocketProvider>
      </main>
    </div>
  );
};

export default MainLayout;
