import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { SignUp, useAuth } from '../components/auth/AuthBridge';
import { motion } from 'framer-motion';

const SignUpPage = () => {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn } = useAuth();

  // Polished loading state matching the Login page
  if (!isLoaded) {
    return (
      <div className="h-[100dvh] bg-[#fafafa] flex flex-col items-center justify-center font-['Space_Grotesk'] uppercase text-[10px] tracking-[0.4em] text-black">
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-8 h-8 border-2 border-black rounded-full border-t-transparent animate-spin"></div>
          INITIALIZING...
        </motion.div>
      </div>
    );
  }

  // Auto-redirect if already signed in
  if (isSignedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    /* h-[100dvh] and overflow-hidden prevent any window scrolling */
    <div className="h-[100dvh] w-full flex items-center justify-center relative overflow-hidden bg-[#fafafa] selection:bg-black selection:text-white p-4">
      
      {/* ARCHITECTURAL CANVAS & SCANNER */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="absolute inset-0 opacity-[0.15]" style={{
          backgroundImage: 'radial-gradient(#000 1.5px, transparent 1.5px)',
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)'
        }}></div>
        
        <motion.div
          animate={{ y: ['-10vh', '110vh'] }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 right-0 h-[2px] z-0"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.2) 50%, transparent 100%)',
            boxShadow: '0px 2px 10px rgba(0,0,0,0.1)'
          }}
        />
      </div>

      {/* COMPACT SIGNUP PLAQUE */}
      <motion.main
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        className="relative z-10 w-full max-w-[400px]"
      >
        {/* Added max-h-[90vh] and overflow-y-auto here so if Clerk's password strength meter expands, it scrolls inside the card, NOT the window */}
        <div className="bg-white border-2 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col relative max-h-[90vh] overflow-y-auto overflow-x-hidden custom-scrollbar">
          
          {/* Striking Dark Header */}
          <div className="bg-black text-white px-6 py-5 flex justify-between items-center shrink-0">
            <h1 className="font-black text-2xl tracking-tighter uppercase font-['Inter'] leading-none">
              REGISTER
            </h1>
            <div className="flex gap-1 items-center">
              <span className="font-['Space_Grotesk'] text-[8px] tracking-widest text-gray-400 mr-2">SYS_V1</span>
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Clerk Auth Section */}
          <div className="p-6 shrink-0">
            <SignUp 
              appearance={{
                variables: {
                  colorPrimary: '#000000',
                  colorBackground: 'transparent',
                  colorInputBackground: '#ffffff',
                  borderRadius: '0px',
                  shadowShimmer: 'none',
                  spacingUnit: '0.9rem', // Condenses internal Clerk spacing
                },
                elements: {
                  rootBox: 'w-full',
                  cardBox: 'shadow-none w-full border-none m-0',
                  card: 'shadow-none w-full p-0 border-none bg-transparent',
                  
                  /* HIDES THE UNNECESSARY CLERK TEXT */
                  headerTitle: 'hidden',
                  headerSubtitle: 'hidden',
                  
                  /* Buttons and Inputs */
                  formButtonPrimary: 'bg-black hover:bg-gray-800 text-white border-2 border-black transition-colors rounded-none text-[11px] uppercase tracking-widest font-["Space_Grotesk"] font-bold h-11',
                  socialButtonsBlockButton: 'border-2 border-black/20 hover:border-black hover:bg-black hover:text-white bg-white rounded-none transition-all h-11 text-black font-["Space_Grotesk"] text-[10px] uppercase tracking-wider',
                  socialButtonsBlockButtonText: 'font-bold tracking-widest',
                  formFieldInput: 'border-2 border-black/20 rounded-none focus:ring-0 focus:border-black transition-colors h-11 text-sm bg-white px-3',
                  formFieldLabel: 'font-["Space_Grotesk"] text-[9px] uppercase tracking-widest text-black font-bold mb-1.5',
                  
                  /* Links and Footers */
                  footerActionLink: 'text-black hover:text-gray-500 underline decoration-2 underline-offset-4 font-bold transition-colors text-[10px] uppercase tracking-widest',
                  dividerLine: 'bg-black/10',
                  dividerText: 'font-["Space_Grotesk"] text-[9px] uppercase tracking-[0.2em] text-gray-400 font-bold p-2 bg-white',
                  footer: 'bg-transparent border-t-2 border-black/10 pt-4 mt-4 pb-0',
                  watermark: 'hidden',
                }
              }}
              routing="hash"
              signInUrl="/login"
              fallbackRedirectUrl="/dashboard"
            />
          </div>

          {/* Return to Login (Slimmed down to match guest button on login) */}
          <button 
            onClick={() => navigate('/login')}
            className="w-full border-t-2 border-black py-4 px-6 bg-[#f5f5f5] text-black transition-all hover:bg-black hover:text-white group flex justify-between items-center shrink-0"
          >
            <span className="material-symbols-outlined text-[14px] transition-transform duration-300 group-hover:-translate-x-2">arrow_back</span>
            <span className="font-['Space_Grotesk'] text-[10px] font-black uppercase tracking-[0.2em]">
              RETURN_TO_LOGIN
            </span>
          </button>
          
        </div>
      </motion.main>
    </div>
  );
};

export default SignUpPage;