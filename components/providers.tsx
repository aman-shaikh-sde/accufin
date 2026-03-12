// components/providers.tsx

"use client";

import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";

interface ProvidersProps {
  children: React.ReactNode;
  session?: Session | null;
}

export function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider
      session={session}
      refetchInterval={4 * 60}
      refetchOnWindowFocus={true}
      refetchWhenOffline={false}
    >
      {children}
    </SessionProvider>
  );
}