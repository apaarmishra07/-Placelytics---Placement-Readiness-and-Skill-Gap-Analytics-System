import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Dashboard from "@/pages/dashboard";
import StudentsPage from "@/pages/students/index";
import NewStudentPage from "@/pages/students/new";
import StudentDetailPage from "@/pages/students/[id]";
import EditStudentPage from "@/pages/students/[id]/edit";
import RolesPage from "@/pages/roles";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/students" component={StudentsPage} />
      <Route path="/students/new" component={NewStudentPage} />
      <Route path="/students/:id" component={StudentDetailPage} />
      <Route path="/students/:id/edit" component={EditStudentPage} />
      <Route path="/roles" component={RolesPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
