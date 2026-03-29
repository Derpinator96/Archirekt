import React, { createContext, useContext } from 'react';

const AuthContext = createContext({
  isSignedIn: false,
  user: null,
  isLoaded: true,
});

export const useAuth = () => useContext(AuthContext);
export const useUser = () => useContext(AuthContext);

export const MockAuthProvider = ({ children }) => {
  return (
    <AuthContext.Provider value={{ isSignedIn: false, user: null, isLoaded: true }}>
      {children}
    </AuthContext.Provider>
  );
};

export const SignedIn = ({ children }) => {
  const { isSignedIn } = useAuth();
  return isSignedIn ? children : null;
};

export const SignedOut = ({ children }) => {
  const { isSignedIn } = useAuth();
  return !isSignedIn ? children : null;
};

export const SignInButton = ({ children }) => {
  return <div onClick={() => alert("Clerk Publishable Key Required for this action.")}>{children}</div>;
};

export const UserButton = () => null;
