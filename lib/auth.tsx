"use client";

import { onAuthStateChanged, type User } from "firebase/auth";
import { useEffect, useState } from "react";

import { apiClient } from "./api/client";
import { firebaseAuth } from "./firebase";

export type UserRole = "customer" | "vendor" | "hitl" | "admin" | "super_admin";

export type UserProfile = {
  id: string;
  email: string | null;
  display_name: string | null;
  roles: UserRole[];
  status: "active" | "disabled";
  created_at: string;
  updated_at: string;
};

export type AuthState = {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
};

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (nextUser) => {
      if (nextUser) {
        try {
          const token = await nextUser.getIdToken();
          const data = await apiClient.get<UserProfile>("/api/auth/me", {
            authToken: token,
          });

          if (data) {
            setProfile(data);
          }
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }

      setUser(nextUser);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, profile, isLoading };
}

export async function getIdToken(user: User | null) {
  if (!user) {
    return null;
  }

  return user.getIdToken();
}
