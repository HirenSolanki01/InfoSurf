import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import ProductPreview from "./components/ProductPreview";
import ProblemSection from "./components/ProblemSection";
import HowItWorks from "./components/HowItWorks";
import RagPipelineVisual from "./components/RagPipelineVisual";
import FeaturesSection from "./components/FeaturesSection";
import CitationExperience from "./components/CitationExperience";
import TechStackSection from "./components/TechStackSection";
import UseCasesSection from "./components/UseCasesSection";
import FinalCta from "./components/FinalCta";
import Footer from "./components/Footer";
import AuthModal from "./components/AuthModal";
import WorkspaceView from "./components/WorkspaceView";

const MainApp = () => {
  const { token } = useAuth();
  const [currentView, setCurrentView] = useState("home"); // "home" | "workspace"
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState("login");
  const [activePrompt, setActivePrompt] = useState("");

  const handleOpenWorkspace = () => {
    if (token) {
      setCurrentView("workspace");
    } else {
      setAuthInitialTab("login");
      setAuthModalOpen(true);
    }
  };

  const handleOpenAuth = (isLogin = true) => {
    setAuthInitialTab(isLogin ? "login" : "signup");
    setAuthModalOpen(true);
  };

  const handleStartResearch = (promptText = "") => {
    if (promptText) {
      setActivePrompt(promptText);
    }
    if (token) {
      setCurrentView("workspace");
    } else {
      setAuthInitialTab("signup");
      setAuthModalOpen(true);
    }
  };

  // If user is viewing the full interactive workspace and authenticated
  if (currentView === "workspace" && token) {
    return (
      <WorkspaceView 
        onBackToHome={() => setCurrentView("home")} 
        initialPrompt={activePrompt}
      />
    );
  }

  // Otherwise, render the Awwwards-style Homepage
  return (
    <div className="site-wrapper">
      <Navbar 
        onOpenWorkspace={handleOpenWorkspace} 
        onOpenAuth={handleOpenAuth} 
      />

      <main>
        <HeroSection 
          onStartResearch={handleStartResearch} 
          onExplore={() => {
            document.getElementById("product")?.scrollIntoView({ behavior: "smooth" });
          }}
        />

        <ProductPreview 
          onOpenWorkspace={handleOpenWorkspace} 
        />

        <ProblemSection />

        <HowItWorks />

        <RagPipelineVisual />

        <FeaturesSection />

        <CitationExperience />

        <TechStackSection />

        <UseCasesSection 
          onStartResearch={handleStartResearch} 
        />

        <FinalCta 
          onStartResearch={handleStartResearch} 
        />
      </main>

      <Footer />

      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)}
        initialTab={authInitialTab}
        onSuccess={() => setCurrentView("workspace")}
      />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
