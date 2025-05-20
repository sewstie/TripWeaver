"use client";

import { createContext, useContext, useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  auth,
  CreateUserWithEmailAndPassword,
  SignInWithEmailAndPassword,
  SignOut,
  OnAuthStateChanged,
  signInWithEmailAndPassword,
} from "./firebase";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  async function signup(email, password, username) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      if (username) {
        localStorage.setItem(`username_${userCredential.user.uid}`, username);
      }
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  }

  async function login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  }

  async function logout() {
    await signOut(auth);
    router.push("/login");
  }

  useEffect(() => {
    const unsubscribe = onAuthStageChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    getUserName: (uid) =>
      uid ? localStorage.getItem(`username_${uid}`) : null,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
