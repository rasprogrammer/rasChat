import { ChatProvider, useChat } from "./context/ChatContext";
import ChatLayout from "./pages/ChatLayout";
import LoginLayout from "./pages/LoginLayout";
// import ChatLayout from "./pages/ChatLayout";

function AppContent() {
  const { user, login, register } = useChat();

  if (!user) return <LoginLayout handleLogin={login} handleRegister={register} />;
  return <ChatLayout />;
}

export default function App() {
  return (
    <ChatProvider>
      <AppContent />
    </ChatProvider>
  );
}
