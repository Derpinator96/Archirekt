import React from 'react';

import { useNavigate, Navigate } from 'react-router-dom';

import { SignUp, useAuth } from '../components/auth/AuthBridge';

import { motion } from 'framer-motion';



const SignUpPage = () => {

  const navigate = useNavigate();

  const { isLoaded, isSignedIn } = useAuth();



  if (!isLoaded) {

    return (

      <div className="min-h-screen bg-white flex flex-col items-center justify-center font-['Space_Grotesk'] uppercase text-[10px] tracking-[0.4em] text-black">

        <motion.div

          animate={{ opacity: [0.3, 1, 0.3] }}

          transition={{ duration: 1.5, repeat: Infinity }}

        >

          AUTH_SYSTEM_INITIALIZING...

        </motion.div>

      </div>

    );

  }



  if (isSignedIn) {

    return <Navigate to="/dashboard" replace />;

  }



  return (

    <div className="min-h-screen flex items-center justify-center relative w-full overflow-hidden bg-white selection:bg-black selection:text-white">

      {/* ARCHITECTURAL CANVAS & SCANNER */}

      <div className="fixed inset-0 pointer-events-none opacity-40">

        <div className="absolute inset-0" style={{

          backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, #000 1.5px, transparent 0)',

          backgroundSize: '40px 40px'

        }}></div>

       

        {/* Scanning Line */}

        <motion.div

          animate={{ y: ['0vh', '100vh'] }}

          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}

          className="absolute left-0 right-0 h-[1px] bg-black/10 z-0"

        />

      </div>

     

      {/* SYSTEM DATA ANCHORS */}

      <div className="fixed top-8 left-8 flex flex-col gap-1 z-20 pointer-events-none">

        <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-[0.3em] font-black text-black">A.S.I.S. // REGISTRATION</span>

      </div>



      {/* SIGNUP PLAQUE */}

      <motion.main

        initial={{ opacity: 0, y: 15 }}

        animate={{ opacity: 1, y: 0 }}

        className="relative z-10 w-full max-w-md px-4 py-12"

      >

        <div className="bg-white border-[1.5px] border-black p-1 shadow-[20px_20px_0px_rgba(0,0,0,0.02)]">

          <div className="border border-black p-10 flex flex-col gap-8 relative bg-white">

           

            <div className="absolute top-2 left-2 font-['Space_Grotesk'] text-[8px] opacity-20">02_REG</div>

            <div className="absolute top-2 right-2 font-['Space_Grotesk'] text-[8px] opacity-20">SYS_V1</div>



            {/* Header Section */}

            <div className="flex flex-col gap-3">

              <div className="flex justify-between items-baseline">

                <h1 className="font-black text-3xl tracking-tighter uppercase font-['Inter'] leading-none">SIGNUP_</h1>

                <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-widest text-gray-400 font-bold">NODE_02</span>

              </div>

              <div className="h-[2px] bg-black w-16"></div>

            </div>



            {/* Clerk Auth Section */}

            <div className="relative">

              <div className="border border-black flex items-center justify-center p-6 bg-white min-h-[300px] transition-all hover:bg-gray-50/50">

                <SignUp

                  appearance={{

                    elements: {

                      formButtonPrimary: 'bg-black hover:bg-white hover:text-black border border-black transition-none rounded-none text-[10px] uppercase tracking-widest font-["Space_Grotesk"] h-11',

                      card: 'shadow-none border-none p-0 w-full',

                      headerTitle: 'font-black text-xl tracking-tighter uppercase text-black',

                      headerSubtitle: 'font-["Space_Grotesk"] text-[10px] uppercase tracking-widest text-gray-500 mb-6',

                      socialButtonsBlockButton: 'border-black hover:bg-gray-50 rounded-none transition-none h-10',

                      formFieldInput: 'border-black rounded-none focus:ring-0 focus:border-black transition-none h-10 text-xs',

                      footerActionLink: 'text-black hover:text-gray-400 underline decoration-1 underline-offset-4 font-bold transition-none text-[10px] uppercase tracking-widest',

                      dividerLine: 'bg-black/20',

                      dividerText: 'font-["Space_Grotesk"] text-[9px] uppercase tracking-widest text-black font-bold p-2 bg-white',

                      formFieldLabel: 'font-["Space_Grotesk"] text-[9px] uppercase tracking-widest text-black font-bold mb-2'

                    }

                  }}

                  routing="hash"

                  signInUrl="/"

                  fallbackRedirectUrl="/dashboard"

                />

              </div>

            </div>



            {/* Interaction Section */}

            <div className="flex flex-col gap-4">

              <button

                onClick={() => navigate('/')}

                className="cursor-pointer flex items-center justify-between w-full border border-black py-4 px-6 bg-white text-black transition-all hover:bg-black hover:text-white group"

              >

                <span className="font-['Space_Grotesk'] text-[10px] font-black uppercase tracking-[0.2em]">

                  &gt; RETURN TO LOGIN_

                </span>

                <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_back</span>

              </button>

            </div>

          </div>

        </div>

      </motion.main>

    </div>

  );

};



export default SignUpPage;

