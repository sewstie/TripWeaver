"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { auth, googleProvider, githubProvider } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
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
  const redirectProcessed = useRef(false);

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
    let authStateUnsubscribe = () => {};

    const initAuth = async () => {
      try {
        await auth.authStateReady().catch(() => {});

        await setPersistence(auth, browserLocalPersistence).catch(() => {});

        const pendingRedirect = localStorage.getItem("authRedirectPending");

        if (pendingRedirect && !redirectProcessed.current) {
          redirectProcessed.current = true;

          try {
            const result = await getRedirectResult(auth);

            if (result?.user) {
              localStorage.removeItem("authRedirectPending");
              localStorage.removeItem("authRedirectTime");
              router.push("/");
              return;
            }

            if (auth.currentUser) {
              localStorage.removeItem("authRedirectPending");
              localStorage.removeItem("authRedirectTime");
              router.push("/");
              return;
            }

            const redirectTime = localStorage.getItem("authRedirectTime");
            if (
              redirectTime &&
              Date.now() - parseInt(redirectTime) > 2 * 60 * 1000
            ) {
              localStorage.removeItem("authRedirectPending");
              localStorage.removeItem("authRedirectTime");
            }
          } catch (error) {
            localStorage.removeItem("authRedirectPending");
            localStorage.removeItem("authRedirectTime");
          }
        }

        authStateUnsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            try {
              const userDoc = await getDoc(doc(db, "users", user.uid));

              if (!userDoc.exists()) {
                await setDoc(doc(db, "users", user.uid), {
                  email: user.email?.toLowerCase() || "",
                  name: user.displayName || "",
                  createdAt: new Date(),
                  updatedAt: new Date(),
                });
              }

              setCurrentUser(user);

              const pendingFlag = localStorage.getItem("authRedirectPending");
              if (pendingFlag) {
                localStorage.removeItem("authRedirectPending");
                localStorage.removeItem("authRedirectTime");
                router.push("/");
              }
            } catch (dbError) {
              setCurrentUser(user);
            }
          } else {
            setCurrentUser(null);
          }

          setLoading(false);
        });

        return authStateUnsubscribe;
      } catch (error) {
        setLoading(false);
        return () => {};
      }
    };

    initAuth().then((unsubscribe) => {
      authStateUnsubscribe = unsubscribe;
    });

    return () => {
      authStateUnsubscribe();
    };
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
      await setPersistence(auth, browserLocalPersistence);
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
        await setPersistence(auth, browserLocalPersistence);
        localStorage.setItem("authRedirectPending", "google");
        localStorage.setItem("redirectStartTime", Date.now().toString());
        redirectProcessed.current = false;
        await signInWithRedirect(auth, googleProvider);
      } else {
        const result = await signInWithPopup(auth, googleProvider);
        if (result.user.displayName) {
          localStorage.setItem(
            `username_${result.user.uid}`,
            result.user.displayName
          );
        }
        return result;
      }
    } catch (error) {
      localStorage.removeItem("authRedirectPending");
      localStorage.removeItem("redirectStartTime");
      throw error;
    }
  }

  async function signInWithGithub() {
    try {
      if (isMobile) {
        await setPersistence(auth, browserLocalPersistence);
        localStorage.setItem("authRedirectPending", "github");
        localStorage.setItem("redirectStartTime", Date.now().toString());
        redirectProcessed.current = false;
        await signInWithRedirect(auth, githubProvider);
      } else {
        const result = await signInWithPopup(auth, githubProvider);
        if (result.user.displayName) {
          localStorage.setItem(
            `username_${result.user.uid}`,
            result.user.displayName
          );
        }
        return result;
      }
    } catch (error) {
      localStorage.removeItem("authRedirectPending");
      localStorage.removeItem("redirectStartTime");
      throw error;
    }
  }

  async function logout() {
    await signOut(auth);
    router.push("/login");
  }

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
