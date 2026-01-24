import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { Outfit } from "next/font/google";
import { Toaster } from "sonner";

import { api } from "~/utils/api";
import { Navbar } from "~/components/layout/navbar";
import { SyncInitializer } from "~/components/sync-initializer";

import "~/styles/globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <div className={`${outfit.variable} font-sans`}>
        <SyncInitializer />
        <Navbar />
        <main className="min-h-screen bg-gray-50">
          <Component {...pageProps} />
        </main>
        <Toaster richColors />
      </div>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);