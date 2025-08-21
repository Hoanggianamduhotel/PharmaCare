import React from "react";
import { Switch, Route } from "wouter";
import PharmacyPage from "@/pages/demo";

function Router() {
  return (
    <Switch>
      <Route path="/" component={PharmacyPage} />
      <Route>
        <div className="min-h-screen flex items-center justify-center">
          <h1 className="text-2xl">Page Not Found</h1>
        </div>
      </Route>
    </Switch>
  );
}

function App() {
  return <Router />;
}

export default App;