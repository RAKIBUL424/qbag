import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import PremiumQuestions from "./pages/PremiumQuestions";
import { Routes, Route, useLocation } from "react-router";
import UploadQuestion from "./pages/UploadQuestion";
import Auth from "./pages/Auth";

import PremiumSearch from "./pages/PremiumSearch";
import FloatingScreenshotButton from "./components/FloatingScreenshotButton";
import AdminPanel from "./pages/Adminpanel";

function App() {
  const location = useLocation();
  
  // Check if current page is home or premium search
  const isHomeOrPremiumSearch = location.pathname === '/' || location.pathname === '/premium';
  
  return (
    <>
      <Routes>
        <Route path='/' element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/premium" element={<PremiumSearch />} />
          <Route path="/upload" element={<UploadQuestion />} />
          <Route path="/user" element={<Auth />} />
          <Route path="/admin" element={<AdminPanel />} />
          
        </Route>
      </Routes>
      
      {/* Floating button - only shows on home and premium search pages */}
      {isHomeOrPremiumSearch && <FloatingScreenshotButton />}
    </>
  );
}

export default App;