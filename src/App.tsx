import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { SessionProvider } from "./context/SessionContext";
import LandingPage from "./pages/LandingPage";
import InterviewPage from "./pages/InterviewPage";
import ReportPage from "./pages/ReportPage";

const App = () => (
  <SessionProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/interview" element={<InterviewPage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </SessionProvider>
);

export default App;
