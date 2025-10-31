import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Navigation from "../components/Navigation";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <QueryClientProvider client={queryClient}>
          <div className="min-h-screen">
            <Navigation />
            <main className="container mx-auto px-4 py-6">{children}</main>
          </div>
        </QueryClientProvider>
      </body>
    </html>
  );
}
