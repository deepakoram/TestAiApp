import { useState, useEffect } from "react";
import SpeechToText from "./components/SpeechToText.jsx";
import Login from "./components/Login.jsx";
import Signup from "./components/Signup.jsx";
import AiAgent from "./components/AiAgent.jsx";

export default function App() {
  const [tab, setTab] = useState("home");
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login"); // "login" or "signup"

  // localStorage functions
  const saveUserToStorage = (userData) => {
    localStorage.setItem('mweb_user', JSON.stringify(userData));
  };

  const getUserFromStorage = () => {
    const storedUser = localStorage.getItem('mweb_user');
    return storedUser ? JSON.parse(storedUser) : null;
  };

  const removeUserFromStorage = () => {
    localStorage.removeItem('mweb_user');
  };

  // Check for existing user data on app load
  useEffect(() => {
    const storedUser = getUserFromStorage();
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    saveUserToStorage(userData);
    setAuthMode("login");
  };

  const handleSignup = (userData) => {
    setUser(userData);
    saveUserToStorage(userData);
    setAuthMode("signup");
  };

  const handleLogout = () => {
    setUser(null);
    removeUserFromStorage();
    setTab("home");
  };

  const switchToSignup = () => setAuthMode("signup");
  const switchToLogin = () => setAuthMode("login");

  // Show authentication pages if user is not logged in
  if (!user) {
    return (
      <div className="min-h-[100dvh] flex flex-col justify-center bg-white text-gray-900">
        {/* Header */}
        {/* <header className="pt-[var(--safe-top)] px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-center border-b">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white">MWeb Starter</h1>
        </header> */}

        {/* Main content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center">
          <div className="w-full max-w-md">
            {authMode === "login" ? (
              <Login onLogin={handleLogin} onSwitchToSignup={switchToSignup} />
            ) : (
              <Signup onSignup={handleSignup} onSwitchToLogin={switchToLogin} />
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col justify-center bg-[#010823] text-gray-900">
      {/* Header - responsive with different layouts */}
      <header className="pt-[var(--safe-top)] px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between border-b">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white">TEST</h1>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600 hidden sm:block">
            Welcome, {user.name}
          </span>
          <button 
            onClick={handleLogout}
            className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-sm sm:text-base bg-sky-500 hover:bg-sky-600 text-white active:scale-95 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

     <AiAgent/>
    </div>
  );
}

function Tab({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`mx-auto text-sm sm:text-base transition-colors ${
        active ? "font-semibold text-sky-600" : "text-gray-500 hover:text-gray-700"
      }`}
      style={{ minWidth: 64, minHeight: 44 }} // touch target ≥44px
    >
      {label}
    </button>
  );
}

function Home({ user }) {
  return (
    <AiAgent/>
  );
}

function Search() { 
  return (
    <div className="space-y-4">
      <div className="relative">
        <input 
          type="text" 
          placeholder="Search..." 
          className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-colors"
        />
        <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <p className="text-gray-500 text-center py-8">Search functionality coming soon...</p>
    </div>
  ); 
}

function Profile({ user }) { 
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-sky-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl sm:text-3xl">👤</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-semibold mb-2">{user.name}</h2>
        <p className="text-gray-600">{user.email}</p>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between p-4 rounded-xl border">
          <span className="font-medium">Account Settings</span>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
        <div className="flex items-center justify-between p-4 rounded-xl border">
          <span className="font-medium">Privacy</span>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
        <div className="flex items-center justify-between p-4 rounded-xl border">
          <span className="font-medium">Notifications</span>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  ); 
}

function Card({ title, body, icon }) {
  return (
    <div className="rounded-2xl border p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow bg-white">
      <div className="flex items-start space-x-3">
        <span className="text-2xl sm:text-3xl">{icon}</span>
        <div className="flex-1">
          <h2 className="font-semibold text-base sm:text-lg mb-2">{title}</h2>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{body}</p>
        </div>
      </div>
    </div>
  );
}
