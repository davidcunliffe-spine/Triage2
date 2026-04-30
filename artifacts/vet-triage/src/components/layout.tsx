import { Link, useLocation } from "wouter";
import { useUser, useClerk } from "@clerk/react";
import { LogOut, LayoutDashboard, History } from "lucide-react";
import { CareLogo } from "@/components/care-logo";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useHealthCheck, getHealthCheckQueryKey } from "@workspace/api-client-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [, setLocation] = useLocation();
  const { data: health } = useHealthCheck({ query: { queryKey: getHealthCheckQueryKey(), refetchInterval: 30000 } });

  const handleSignOut = async () => {
    await signOut();
    setLocation("/");
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
              <CareLogo className="h-9 w-auto" />
              <span className="hidden sm:inline-block font-semibold text-sm tracking-tight text-muted-foreground border-l border-border pl-3">
                Triage
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Link 
                href="/staff" 
                className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-2"
              >
                <LayoutDashboard className="h-4 w-4" />
                Active Queue
              </Link>
              <Link 
                href="/staff/history" 
                className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-2"
              >
                <History className="h-4 w-4" />
                History
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/display" target="_blank" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors hidden md:block">
              Public Display ↗
            </Link>

            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10 border border-primary/20">
                      <AvatarImage src={user.imageUrl} alt={user.fullName || ""} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.fullName}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.primaryEmailAddress?.emailAddress}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="md:hidden asChild">
                    <Link href="/staff" className="flex items-center cursor-pointer w-full">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Active Queue</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="md:hidden asChild">
                    <Link href="/staff/history" className="flex items-center cursor-pointer w-full">
                      <History className="mr-2 h-4 w-4" />
                      <span>History</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="md:hidden asChild">
                    <Link href="/display" target="_blank" className="flex items-center cursor-pointer w-full">
                      <span>Public Display ↗</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="md:hidden" />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="py-6 border-t bg-card mt-auto text-center text-sm text-muted-foreground">
        <div className="container flex justify-between items-center px-4">
          <p>CARE Triage · Centre for Animal Referral & Emergency</p>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${health ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
              System Status
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
