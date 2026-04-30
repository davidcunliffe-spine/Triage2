import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, Show, useClerk } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Pages
import Home from "@/pages/home";
import { SignInPage, SignUpPage } from "@/pages/auth";
import Dashboard from "@/pages/staff/dashboard";
import HistoryPage from "@/pages/staff/history";
import DisplayPage from "@/pages/display";
import NotFound from "@/pages/not-found";
import { StaffGuard } from "@/components/staff-guard";

const queryClient = new QueryClient();

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in .env file");
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/brand/care-logo.png`,
  },
  variables: {
    colorPrimary: "hsl(152, 62%, 44%)", // Kelly Green #2AB573
    colorForeground: "hsl(270, 2%, 20%)", // Charcoal #333234
    colorMutedForeground: "hsl(270, 2%, 42%)",
    colorDanger: "hsl(15, 88%, 55%)", // Tangerine #F25928
    colorBackground: "hsl(0, 0%, 100%)",
    colorInput: "hsl(270, 4%, 96%)",
    colorInputForeground: "hsl(270, 2%, 20%)",
    colorNeutral: "hsl(270, 5%, 90%)",
    fontFamily: "Outfit, sans-serif",
    borderRadius: "0.75rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-white rounded-2xl w-[440px] max-w-full overflow-hidden shadow-xl border border-[hsl(40,20%,90%)]",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-2xl font-bold text-[hsl(220,20%,20%)]",
    headerSubtitle: "text-[hsl(220,10%,50%)]",
    socialButtonsBlockButtonText: "text-[hsl(220,20%,20%)] font-medium",
    formFieldLabel: "text-[hsl(220,20%,20%)] font-medium",
    footerActionLink: "text-[hsl(175,40%,40%)] hover:text-[hsl(175,40%,30%)] font-medium",
    footerActionText: "text-[hsl(220,10%,50%)]",
    dividerText: "text-[hsl(220,10%,50%)]",
    identityPreviewEditButton: "text-[hsl(175,40%,40%)]",
    formFieldSuccessText: "text-[hsl(150,40%,45%)]",
    alertText: "text-[hsl(0,60%,60%)]",
    logoBox: "flex justify-center mb-4",
    logoImage: "h-12",
    socialButtonsBlockButton: "border-[hsl(40,20%,88%)] bg-white hover:bg-[hsl(40,20%,98%)]",
    formButtonPrimary: "bg-[hsl(175,40%,40%)] hover:bg-[hsl(175,40%,35%)] text-white shadow-md",
    formFieldInput: "bg-white border-[hsl(40,20%,88%)] focus:border-[hsl(175,40%,40%)] focus:ring-[hsl(175,40%,40%)]",
    footerAction: "bg-[hsl(40,20%,98%)]",
    dividerLine: "bg-[hsl(40,20%,88%)]",
    alert: "bg-[hsl(0,60%,95%)] border-[hsl(0,60%,60%)]",
    otpCodeFieldInput: "border-[hsl(40,20%,88%)] focus:border-[hsl(175,40%,40%)]",
    formFieldRow: "mb-4",
    main: "px-8 py-6",
  },
};

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <Redirect to="/staff" />
      </Show>
      <Show when="signed-out">
        <Home />
      </Show>
    </>
  );
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  return (
    <>
      <Show when="signed-in">
        <StaffGuard>
          <Component />
        </StaffGuard>
      </Show>
      <Show when="signed-out">
        <Redirect to="/" />
      </Show>
    </>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const queryClient = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        queryClient.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, queryClient]);

  return null;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "Staff Sign In",
            subtitle: "Access the triage board",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <Switch>
            <Route path="/" component={HomeRedirect} />
            <Route path="/sign-in/*?" component={SignInPage} />
            <Route path="/sign-up/*?" component={SignUpPage} />
            <Route path="/display" component={DisplayPage} />
            <Route path="/staff" component={() => <ProtectedRoute component={Dashboard} />} />
            <Route path="/staff/history" component={() => <ProtectedRoute component={HistoryPage} />} />
            <Route component={NotFound} />
          </Switch>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
