import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat";
import PrivateChat from "./pages/PrivateChat";
import Pricing from "./pages/Pricing";
import Success from "./pages/Success";
import Dashboard from "./pages/Dashboard";

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/" element={
            <ProtectedRoute><Chat /></ProtectedRoute>
          } />
          <Route path="/private/:userId" element={
            <ProtectedRoute><PrivateChat /></ProtectedRoute>
          } />
          <Route path="/success" element={
            <ProtectedRoute><Success /></ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;