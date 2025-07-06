"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        ) || window.innerWidth < 768
      );
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          if (result.user.displayName) {
            localStorage.setItem(
              `username_${result.user.uid}`,
              result.user.displayName
            );
          }

          const userDoc = await getDoc(doc(db, "users", result.user.uid));
          if (!userDoc.exists()) {
            await setDoc(doc(db, "users", result.user.uid), {
              email: result.user.email.toLowerCase(),
              name: result.user.displayName || "",
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }

          router.push("/");
        }
      } catch (error) {
        console.error("Redirect auth error:", error);
      }
    };

    handleRedirectResult();
  }, [router]);

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
      if (isMobile) {
        return signInWithRedirect(auth, googleProvider);
      } else {
        const userCredential = await signInWithPopup(auth, googleProvider);
        if (userCredential.user.displayName) {
          localStorage.setItem(
            `username_${userCredential.user.uid}`,
            userCredential.user.displayName
          );
        }
        return userCredential.user;
      }
    } catch (error) {
      throw error;
    }
  }

  async function signInWithGithub() {
    try {
      if (isMobile) {
        return signInWithRedirect(auth, githubProvider);
      } else {
        const userCredential = await signInWithPopup(auth, githubProvider);
        if (userCredential.user.displayName) {
          localStorage.setItem(
            `username_${userCredential.user.uid}`,
            userCredential.user.displayName
          );
        }
        return userCredential.user;
      }
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
    isMobile,
    getUserName: (uid) =>
      uid ? localStorage.getItem(`username_${uid}`) : null,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
