"use client";

import { createContext, useContext, useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  googleProvider,
  githubProvider,
} from "./firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

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

      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: email.toLowerCase(),
        name: username || "",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

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

  async function signInWithGoogle() {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      if (userCredential.user.displayName) {
        localStorage.setItem(
          `username_${userCredential.user.uid}`,
          userCredential.user.displayName
        );
      }
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  }

  async function signInWithGithub() {
    try {
      const userCredential = await signInWithPopup(auth, githubProvider);
      if (userCredential.user.displayName) {
        localStorage.setItem(
          `username_${userCredential.user.uid}`,
          userCredential.user.displayName
        );
      }
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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (!userDoc.exists()) {
          await setDoc(doc(db, "users", user.uid), {
            email: user.email.toLowerCase(),
            name: user.displayName || "",
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }

        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    signInWithGoogle,
    signInWithGithub,
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
