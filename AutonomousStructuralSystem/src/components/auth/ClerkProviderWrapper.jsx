import React from 'react';

// Placeholder for ClerkProvider
export const ClerkProviderWrapper = ({ children }) => {
  return (
    <div className="clerk-provider-placeholder">
      {/* Inject Clerk publishable keys later */}
      {children}
    </div>
  );
};
