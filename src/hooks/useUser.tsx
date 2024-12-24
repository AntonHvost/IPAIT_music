import { User } from "@supabase/auth-helpers-nextjs";
import {
  useSessionContext,
  useUser as useSupaUser,
} from "@supabase/auth-helpers-react";
import { createContext, useContext, useEffect, useState } from "react";
import { Subscription, UserDetails } from "../types";

type UserContextType = {
  accessToken: string | null;
  user: User | null;
  userDetails: UserDetails | null;
  isLoading: boolean;
  subscription: Subscription | null;
};

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

export type Props = {
  [propName: string]: any;
};

export function MyUserContextProvider(props: Props) {
 /* const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserDetails | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch user details from the backend
  async function fetchUserDetails() {
    try {
      const response = await fetch("http://localhost:8080/api/user/details", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user details");
      }

      const data = await response.json();
      return data as UserDetails;
    } catch (error) {
      console.error("Error fetching user details:", error);
      return null;
    }
  }

  // Fetch subscription details from the backend
  async function fetchSubscription() {
    try {
      const response = await fetch(
        "http://localhost:8080/api/subscriptions/current",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch subscription details");
      }

      const data = await response.json();
      return data as Subscription;
    } catch (error) {
      console.error("Error fetching subscription:", error);
      return null;
    }
  }

  useEffect(() => {
    async function initialize() {
      setIsLoading(true);

      try {
        // Retrieve access token (from localStorage, for example)
        const storedToken = localStorage.getItem("authToken");
        if (!storedToken) {
          throw new Error("No access token found");
        }

        setAccessToken(storedToken);

        // Fetch user details and subscription in parallel
        const [userDetails, subscription] = await Promise.all([
          fetchUserDetails(),
          fetchSubscription(),
        ]);

        setUser(userDetails);
        setUserDetails(userDetails);
        setSubscription(subscription);
      } catch (error) {
        console.error("Error initializing user context:", error);
        setUser(null);
        setUserDetails(null);
        setSubscription(null);
      } finally {
        setIsLoading(false);
      }
    }

    initialize();
  }, [accessToken]);

  const value = {
    accessToken,
    user,
    userDetails,
    isLoading,
    subscription,
  };

  return <UserContext.Provider value={value} {...props} />;*/
  const {
    session,
    isLoading: isLoadingUser,
    supabaseClient,
  } = useSessionContext();
  const user = useSupaUser();
  const accessToken = session?.access_token ?? null;
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  function getUserDetails() {
    return supabaseClient.from("users").select("*").single();
  }

  function getSubscription() {
    return supabaseClient
      .from("subscriptions")
      .select("*, prices(*, products(*))")
      .in("status", ["trialing", "active"])
      .single();
  }

  useEffect(() => {
    if (user && !isLoadingData && !userDetails && !subscription) {
      setIsLoadingData(true);
      Promise.allSettled([getUserDetails(), getSubscription()]).then(
        (results) => {
          const userDetailsPromise = results[0];
          const subscriptionPromise = results[1];
          if (userDetailsPromise.status === "fulfilled") {
            setUserDetails(userDetailsPromise.value.data as UserDetails);
          }
          if (subscriptionPromise.status === "fulfilled") {
            setSubscription(subscriptionPromise.value.data as Subscription);
          }
          setIsLoadingData(false);
        }
      );
    } else if (!user && !isLoadingUser && !isLoadingData) {
      setUserDetails(null);
      setSubscription(null);
    }
  }, [user, isLoadingUser]);

  const value = {
    accessToken,
    user,
    userDetails,
    isLoading: isLoadingUser || isLoadingData,
    subscription,
  };

  return <UserContext.Provider value={value} {...props} />;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a MyUserContextProvider");
  }
  return context;
}
