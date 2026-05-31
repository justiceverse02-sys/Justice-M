import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AuthCallback } from "@/components/AuthCallback";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import Home from "@/pages/Home";
import JusticeBot from "@/pages/JusticeBot";
import LegalDatabase from "@/pages/LegalDatabase";
import KnowledgeHub from "@/pages/KnowledgeHub";
import Careers from "@/pages/Careers";
import Pricing from "@/pages/Pricing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import AdminDashboard from "@/pages/AdminDashboard";

const Layout = ({ children, hideChrome = false }) => (
  <div className="App min-h-screen grain">
    {!hideChrome && <Navbar />}
    <main className={hideChrome ? "" : "pt-20"}>{children}</main>
    {!hideChrome && <Footer />}
  </div>
);

function AppRouter() {
  const location = useLocation();
  if (location.hash?.includes("session_id=")) {
    return <AuthCallback />;
  }
  return (
    <Routes>
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/justicebot" element={<Layout><JusticeBot /></Layout>} />
      <Route path="/database" element={<Layout><LegalDatabase /></Layout>} />
      <Route path="/knowledge-hub" element={<Layout><KnowledgeHub /></Layout>} />
      <Route path="/careers" element={<Layout><Careers /></Layout>} />
      <Route path="/pricing" element={<Layout><Pricing /></Layout>} />
      <Route path="/login" element={<Layout><Login /></Layout>} />
      <Route path="/register" element={<Layout><Register /></Layout>} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout><Dashboard /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <Layout><AdminDashboard /></Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
        <Toaster position="top-right" theme="dark" />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
