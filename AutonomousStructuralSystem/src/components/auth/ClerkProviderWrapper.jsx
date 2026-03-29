import { useNavigate } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import { MockAuthProvider } from './MockAuthProvider';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const isInvalidKey = !PUBLISHABLE_KEY || PUBLISHABLE_KEY === "" || PUBLISHABLE_KEY === "pk_test_...";

export const ClerkProviderWrapper = ({ children }) => {
  const navigate = useNavigate();

  if (isInvalidKey) {
    return (
      <MockAuthProvider>
        {/* Development Auth Overlay */}
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-black text-white p-4 border border-white text-[10px] font-mono shadow-2xl animate-pulse">
           [!] AUTH_KEY_MISSING // APPLICATION_IN_GUEST_MODE // ADD VITE_CLERK_PUBLISHABLE_KEY TO .ENV
        </div>
        {children}
      </MockAuthProvider>
    );
  }

  return (
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY} 
      afterSignOutUrl="/"
      navigate={(to) => navigate(to)}
    >
      {children}
    </ClerkProvider>
  );
};
