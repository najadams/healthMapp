import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  Image,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import {
  TextInput,
  Button,
  Text,
} from "react-native-paper";
import { Formik } from "formik";
import * as Yup from "yup";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useSetUser, UserContextType } from "@/context/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

const AuthScreen = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const setUser = useSetUser();
  const navigation = useNavigation();
  const router = useRouter();

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // useEffect(() => {
  //   const checkExistingAuth = async () => {
  //     try {
  //       const [token, userData] = await Promise.all([
  //         AsyncStorage.getItem("token"),
  //         AsyncStorage.getItem("userData"),
  //       ]);

  //       if (token && userData) {
  //         const myDict: { [key: string]: any } = {};

  //         userData.token = token; // No error!
  //         const parsedUserData = JSON.parse(userData);
  //         setUser(parsedUserData);
  //         router.replace("/(main)/(tabs)/home");
  //       }
  //     } catch (error) {
  //       console.error("Error checking authentication status:", error);
  //     } finally {
  //       setIsLoadingUser(false);
  //     }
  //   };

  //   checkExistingAuth();
  // }, []);

  useEffect(() => {
    const checkExistingAuth = async () => {
      try {
        const [token, userDataString] = await Promise.all([
          AsyncStorage.getItem("token"),
          AsyncStorage.getItem("userData"),
        ]);

        if (token && userDataString) {
          const parsedUserData = JSON.parse(userDataString); // Parse the string first
          parsedUserData.token = token; // Now you can assign!

          setUser(parsedUserData);
          router.replace("/(main)/(tabs)/home");
        }
      } catch (error) {
        console.error("Error checking authentication status:", error);
      } finally {
        setIsLoadingUser(false);
      }
    };

    checkExistingAuth();
  }, []);

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .test(
        "is-email-or-username",
        "Invalid email or username",
        function (value) {
          if (!value) return false;
          // Allow either email format or username format (3+ characters)
          return Yup.string().email().isValidSync(value);
        }
      )
      .required("Required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Required"),
    ...(isSignUp && {
      name: Yup.string().required("Full name is required"),
      username: Yup.string()
        .min(3, "Username must be at least 3 characters")
        .required("Username is required"),
      phone: Yup.string()
        .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
        .required("Phone number is required"),
    }),
  });

  // Update handleSubmit to store userData in AsyncStorage
  const handleSubmit = async (values: {
    email: string;
    password: string;
    name?: string;
    username?: string;
    phone?: string;
  }) => {
    try {
      setIsLoading(true);
      setError("");

      const endpoint = isSignUp ? "/api/auth/register" : "/api/auth/login";
      const response = await fetch(`http://localhost:3001${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      if (isSignUp) {
        setIsSignUp(false);
        setError("Registration successful! Please login.");
      } else {
        // Store both token and user data
        await Promise.all([
          AsyncStorage.setItem("token", data.token),
          AsyncStorage.setItem("userData", JSON.stringify(data.user)), // Use data.user instead of userData
        ]);

        setUser(data.user); // Use data.user instead of userData
        router.replace("/(main)/(tabs)/home");
      }
    } catch (error: any) {
      console.error(error);
      setError(error.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if(isLoadingUser) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}>
        <View style={styles.header}>
          <Image
            source={require("@/assets/images/avatar.jpg")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Mental Wellness</Text>
          <Text style={styles.subtitle}>
            {isSignUp
              ? "Create an account to start your wellness journey"
              : "Welcome back to your wellness companion"}
          </Text>
        </View>

        <View style={styles.formContainer}>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Formik
            initialValues={{
              email: "",
              password: "",
              name: "",
              username: "",
              phone: "",
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}>
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
            }) => (
              <View style={styles.form}>
                {isSignUp && (
                  <>
                    <TextInput
                      label="Full Name"
                      mode="outlined"
                      left={<TextInput.Icon icon="account" />}
                      onChangeText={handleChange("name")}
                      onBlur={handleBlur("name")}
                      value={values.name}
                      error={touched.name && !!errors.name}
                      style={styles.input}
                      disabled={isLoading}
                      theme={{ colors: { primary: "#007AFF" } }}
                    />
                    {touched.name && errors.name && (
                      <Text style={styles.error}>{errors.name}</Text>
                    )}

                    <TextInput
                      label="Username"
                      mode="outlined"
                      left={<TextInput.Icon icon="at" />}
                      onChangeText={handleChange("username")}
                      onBlur={handleBlur("username")}
                      value={values.username}
                      error={touched.username && !!errors.username}
                      style={styles.input}
                      disabled={isLoading}
                      theme={{ colors: { primary: "#007AFF" } }}
                    />
                    {touched.username && errors.username && (
                      <Text style={styles.error}>{errors.username}</Text>
                    )}

                    <TextInput
                      label="Phone"
                      mode="outlined"
                      left={<TextInput.Icon icon="phone" />}
                      onChangeText={handleChange("phone")}
                      onBlur={handleBlur("phone")}
                      value={values.phone}
                      error={touched.phone && !!errors.phone}
                      keyboardType="phone-pad"
                      style={styles.input}
                      disabled={isLoading}
                      theme={{ colors: { primary: "#007AFF" } }}
                    />
                    {touched.phone && errors.phone && (
                      <Text style={styles.error}>{errors.phone}</Text>
                    )}
                  </>
                )}

                <TextInput
                  label="Email or Username"
                  mode="outlined"
                  left={<TextInput.Icon icon="email" />}
                  onChangeText={handleChange("email")}
                  onBlur={handleBlur("email")}
                  value={values.email}
                  error={touched.email}
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  disabled={isLoading}
                  theme={{ colors: { primary: "#007AFF" } }}
                />
                {touched.email && errors.email && (
                  <Text style={styles.error}>{errors.email}</Text>
                )}

                <TextInput
                  label="Password"
                  mode="outlined"
                  left={<TextInput.Icon icon="lock" />}
                  secureTextEntry
                  onChangeText={handleChange("password")}
                  onBlur={handleBlur("password")}
                  value={values.password}
                  error={touched.password && !!errors.password}
                  style={styles.input}
                  disabled={isLoading}
                  theme={{ colors: { primary: "#007AFF" } }}
                />
                {touched.password && errors.password && (
                  <Text style={styles.error}>{errors.password}</Text>
                )}

                <Button
                  mode="contained"
                  onPress={() => handleSubmit()}
                  style={styles.button}
                  contentStyle={styles.buttonContent}
                  disabled={isLoading}
                  loading={isLoading}>
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : isSignUp ? (
                    "Create Account"
                  ) : (
                    "Sign In"
                  )}
                </Button>

                <TouchableOpacity
                  style={styles.toggleButton}
                  onPress={() => setIsSignUp(!isSignUp)}
                  disabled={isLoading}>
                  <Text style={styles.toggleText}>
                    {isSignUp
                      ? "Already have an account? Sign In"
                      : "New to Mental Wellness? Sign Up"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Formik>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  logo: {
    width: width * 0.4,
    height: width * 0.4,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
  },
  formContainer: {
    paddingHorizontal: 24,
  },
  form: {
    width: "100%",
  },
  input: {
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  button: {
    marginTop: 24,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: "#007AFF",
  },
  buttonContent: {
    paddingVertical: 8,
  },
  toggleButton: {
    alignItems: "center",
    padding: 8,
  },
  toggleText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "500",
  },
  error: {
    color: "#FF3B30",
    fontSize: 12,
    marginTop: -12,
    marginBottom: 16,
    marginLeft: 4,
  },
});

export default AuthScreen;
