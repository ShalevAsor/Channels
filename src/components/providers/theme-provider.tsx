"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
/**
 * Theme Provider Component
 * Manages application-wide theme state and preferences using next-themes.
 * Enables features like dark/light mode switching and system theme detection.
 */
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
