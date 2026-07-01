// App.jsx
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import PremiumQuestions from "./pages/PremiumQuestions";
import { Routes, Route } from "react-router";
import UploadQuestion from "./pages/UploadQuestion";
import Auth from "./pages/Auth";
import AdminPanel from "./pages/AdminPanel"
import PremiumSearch from "./pages/PremiumSearch";
import FloatingScreenshotButton from "./components/FloatingScreenshotButton";
import { AuthProvider } from "./contexts/AuthContext";
import Profile from "./pages/Profile";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path='/' element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/premium" element={<PremiumSearch />} />
          <Route path="/upload" element={<UploadQuestion />} />
          <Route path="/user" element={<Auth />} />
          <Route path="/profile" element={<Profile/>}/>
          <Route path="/admin" element={<AdminPanel/>} />
          <Route path="/premium/search" element={<PremiumQuestions />} />
        </Route>
      </Routes>
      <FloatingScreenshotButton />
    </AuthProvider>
  );
}

export default App;