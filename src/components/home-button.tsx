"use client";

import { FaHome } from "react-icons/fa";
import { Button } from "./ui/button";

export const HomeButton = () => {
  return (
    <Button
      variant="ghost"
      className="w-full justify-start"
      onClick={() => {
        window.location.href = "/";
      }}
    >
      <FaHome className="mr-2 h-4 w-4" />
    </Button>
  );
};
