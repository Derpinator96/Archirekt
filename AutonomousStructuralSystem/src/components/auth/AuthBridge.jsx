import React from 'react';
import * as ClerkReact from '@clerk/clerk-react';
import * as MockAuth from './MockAuthProvider';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const isInvalidKey = !PUBLISHABLE_KEY || PUBLISHABLE_KEY === "" || PUBLISHABLE_KEY === "pk_test_...";

export const useAuth = isInvalidKey ? MockAuth.useAuth : ClerkReact.useAuth;
export const useUser = isInvalidKey ? MockAuth.useUser : ClerkReact.useUser;
export const SignedIn = isInvalidKey ? MockAuth.SignedIn : ClerkReact.SignedIn;
export const SignedOut = isInvalidKey ? MockAuth.SignedOut : ClerkReact.SignedOut;
export const SignInButton = isInvalidKey ? MockAuth.SignInButton : ClerkReact.SignInButton;
export const UserButton = isInvalidKey ? MockAuth.UserButton : ClerkReact.UserButton;
export const SignIn = isInvalidKey ? MockAuth.SignInButton : ClerkReact.SignIn;
export const SignUp = isInvalidKey ? MockAuth.SignInButton : ClerkReact.SignUp;
