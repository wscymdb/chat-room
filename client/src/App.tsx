import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/SocketContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ChatRoomPage from "./pages/ChatRoomPage";
import AdminLayout from "./layouts/AdminLayout";
import UsersPage from "./pages/Admin/Users";
import MessagesPage from "./pages/Admin/Messages";
import SettingsPage from "./pages/Admin/Settings";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/chat"
            element={
              <PrivateRoute>
                <ChatRoomPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/*"
            element={
              <PrivateRoute>
                <AdminLayout />
              </PrivateRoute>
            }
          >
            <Route path="users" element={<UsersPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="" element={<Navigate to="users" replace />} />
          </Route>
          <Route path="/" element={<Navigate to="/chat" replace />} />
        </Routes>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
