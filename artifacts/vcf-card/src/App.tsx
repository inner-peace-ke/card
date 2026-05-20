import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import Landing from "@/pages/Landing";
import Signup from "@/pages/Signup";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import DashboardContacts from "@/pages/DashboardContacts";
import DashboardSettings from "@/pages/DashboardSettings";
import Plans from "@/pages/Plans";
import PublicCard from "@/pages/PublicCard";
import SuperAdmin from "@/pages/SuperAdmin";
import { getUser } from "@/lib/api";

function Protected({ component: C }: { component: React.ComponentType }) {
  if (!getUser()) return <Redirect to="/login" />;
  return <C />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/signup" component={Signup} />
      <Route path="/login" component={Login} />
      <Route path="/dashboard">{() => <Protected component={Dashboard} />}</Route>
      <Route path="/dashboard/contacts">{() => <Protected component={DashboardContacts} />}</Route>
      <Route path="/dashboard/settings">{() => <Protected component={DashboardSettings} />}</Route>
      <Route path="/dashboard/plans">{() => <Protected component={Plans} />}</Route>
      <Route path="/dashboard/password">{() => <Protected component={() => <DashboardSettings defaultTab="password" />} />}</Route>
      <Route path="/u/:username" component={PublicCard} />
      <Route path="/super" component={SuperAdmin} />
      <Route>{() => <Redirect to="/" />}</Route>
    </Switch>
  );
}

export default function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Router />
    </WouterRouter>
  );
}
