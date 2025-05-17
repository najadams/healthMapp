import React, {
  createContext,
  useEffect,
  useCallback,
  useContext,
  useState,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type UserContextType = {
  name: string;
  username: string;
  email: string;
  phone: string;
  emailverified: boolean;
  isanonymous: boolean;
  role: string;
  token: string;
  profilePicture: string;
} | null;

// Changed the interface to match what we're actually returning
interface UserContextProps {
  user: UserContextType;
  setUser: (user: UserContextType) => void;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
  initialUser?: UserContextType;
}

export function UserProvider({
  children,
  initialUser = null,
}: UserProviderProps) {
  const [user, setUserState] = useState<UserContextType>(initialUser);

  useEffect(() => {
    // Load user data from AsyncStorage on initialization
    const loadUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        if (userData) {
          setUserState(JSON.parse(userData));
        } else {
          console.log("No user data found in AsyncStorage");
        }
      } catch (error) {
        console.error("Failed to load user data:", error);
      }
    };

    loadUserData();
  }, []);

  // This is the function that should be exposed through context
  const setUser = useCallback((newUserData: UserContextType) => {
    setUserState(newUserData);

    if (newUserData) {
      AsyncStorage.setItem("userData", JSON.stringify(newUserData))
        .catch((err) => console.error("Failed to save user data:", err));
    } else {
      AsyncStorage.removeItem("userData")
        .then(() => console.log("User data removed from AsyncStorage"))
        .catch((err) => console.error("Failed to remove user data:", err));
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context.user;
}

export function useSetUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useSetUser must be used within a UserProvider");
  }
  return context.setUser;
}
