import { Bell } from "lucide-react";
import { Button } from "../ui/button";
import { UserButton } from "../auth/user-button";
import Link from "next/link";
import { NavigationAction } from "../navigation/navigation-action";

export const Navbar = () => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/">
          <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            Channels
          </h1>
        </Link>
        <div className="flex items-center space-x-4">
          <NavigationAction />
          <UserButton />
        </div>
      </div>
    </header>
  );
};
