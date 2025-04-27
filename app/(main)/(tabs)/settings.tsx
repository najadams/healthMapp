import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
  SafeAreaView,
  Modal,
  TextInput,
  Switch,
  Platform,
  Linking,
} from "react-native";
import { MaterialIcons, Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useUser, useSetUser } from "@/context/UserContext";
import { useRouter } from "expo-router";
import { logoutUser, updateUserProfile } from "@/utils/api";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Settings = () => {
  const user = useUser();
  const setUser = useSetUser();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showFontSizeModal, setShowFontSizeModal] = useState(false);

  // App preferences states
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [selectedTheme, setSelectedTheme] = useState("Default");
  const [fontSize, setFontSize] = useState("Medium");

  // Privacy settings states
  const [locationTracking, setLocationTracking] = useState(true);
  const [dataSharing, setDataSharing] = useState(true);
  const [activityTracking, setActivityTracking] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const [editedUser, setEditedUser] = useState({
    name: user?.name || "",
    email: user?.email || "",
    profilePicture: user?.profilePicture || "",
    phone: user?.phone || "",
    username: user?.username || "",
  });

  const languages = [
    "English",
    "Spanish",
    "French",
    "German",
    "Japanese",
    "Chinese",
    "Arabic",
  ];
  const themes = ["Default", "Dark", "Light", "Blue", "Green", "Purple"];
  const fontSizes = ["Small", "Medium", "Large", "Extra Large"];

  const handleLogout = async () => {
    try {
      Alert.alert("Confirm Logout", "Are you sure you want to log out?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          onPress: async () => {
            await logoutUser();
            await AsyncStorage.clear();
            setUser(null);
            router.replace("/(auth)/auth");
          },
        },
      ]);
    } catch (error) {
      Alert.alert("Logout Failed", "There was a problem logging out.");
    }
  };

  const handleEditProfile = () => {
    setEditedUser({
      name: user?.name || "",
      email: user?.email || "",
      profilePicture: user?.profilePicture || "",
      phone: user?.phone || "",
      username: user?.username || "",
    });
    setIsEditing(true);
  };

  const handleUpdateProfile = async () => {
    try {
      const updatedUser = await updateUserProfile(editedUser);
      setUser(updatedUser);
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully");
    } catch (error) {
      Alert.alert("Update Failed", "Failed to update profile");
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets[0].uri) {
        setEditedUser((prev) => ({
          ...prev,
          profilePicture: result.assets[0].uri,
        }));
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleClearCache = async () => {
    Alert.alert(
      "Clear Cache",
      "This will clear cached data and might temporarily affect app performance. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          onPress: async () => {
            // Implementation would clear app cache
            try {
              // Placeholder for actual cache clearing logic
              await AsyncStorage.removeItem("appCache");
              Alert.alert("Success", "Cache cleared successfully");
            } catch (error) {
              Alert.alert("Error", "Failed to clear cache");
            }
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      "Export Data",
      "Your data will be prepared for export and sent to your email address.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Export",
          onPress: () => {
            // Implementation would handle data export
            Alert.alert("Success", "Check your email for the exported data");
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This action cannot be undone. All your data will be permanently deleted.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // Implementation would handle account deletion
            Alert.alert(
              "Account Deletion Initiated",
              "Please check your email to confirm deletion"
            );
          },
        },
      ]
    );
  };

  const handleContactSupport = () => {
    Linking.openURL("mailto:support@yourapp.com?subject=Support%20Request");
  };

  const toggleBiometric = () => {
    if (!biometricEnabled) {
      Alert.alert(
        "Enable Biometric Authentication",
        "This will allow you to log in using your fingerprint or face recognition",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Enable",
            onPress: () => setBiometricEnabled(true),
          },
        ]
      );
    } else {
      setBiometricEnabled(false);
    }
  };

  const SettingsOption = ({
    icon,
    title,
    value,
    onPress,
    isSwitch = false,
    iconType = "ionicons",
  }) => (
    <TouchableOpacity
      style={styles.settingsOption}
      onPress={onPress}
      disabled={isSwitch}>
      <View style={styles.settingsOptionLeft}>
        {iconType === "ionicons" ? (
          <Ionicons name={icon} size={24} color="#007BFF" />
        ) : (
          <FontAwesome5 name={icon} size={22} color="#007BFF" />
        )}
        <Text style={styles.settingsOptionText}>{title}</Text>
      </View>
      {isSwitch ? (
        <Switch
          value={value}
          onValueChange={onPress}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={value ? "#007BFF" : "#f4f3f4"}
        />
      ) : (
        <View style={styles.optionRightContent}>
          {value && typeof value === "string" && (
            <Text style={styles.optionValue}>{value}</Text>
          )}
          <MaterialIcons name="chevron-right" size={24} color="#666" />
        </View>
      )}
    </TouchableOpacity>
  );

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Loading user data...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <Text style={styles.pageTitle}>Settings</Text>

        {/* Profile Picture Section */}
        <View style={styles.profileSection}>
          <Image
            source={{
              uri: user?.profilePicture || "https://via.placeholder.com/120",
            }}
            style={styles.profileImage}
          />
          <TouchableOpacity style={styles.editIcon} onPress={handleEditProfile}>
            <MaterialIcons name="edit" size={24} color="#007BFF" />
          </TouchableOpacity>
        </View>

        {/* User Details Section */}
        <View style={styles.detailsSection}>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        {/* Quick Actions Section */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleEditProfile}>
            <Text style={styles.actionButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* App Preferences Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>App Preferences</Text>

          <SettingsOption
            icon="notifications"
            title="Push Notifications"
            value={notificationsEnabled}
            onPress={() => setNotificationsEnabled(!notificationsEnabled)}
            isSwitch={true}
          />

          <SettingsOption
            icon="language"
            title="Language"
            value={selectedLanguage}
            onPress={() => setShowLanguageModal(true)}
          />

          {/* <SettingsOption
            icon="color-palette"
            title="Theme"
            value={selectedTheme}
            onPress={() => setShowThemeModal(true)}
          /> */}

          <SettingsOption
            icon="text"
            title="Font Size"
            value={fontSize}
            onPress={() => setShowFontSizeModal(true)}
          />
        </View>

        {/* Privacy & Security Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Privacy & Security</Text>

          <SettingsOption
            icon="location"
            title="Location Services"
            value={locationTracking}
            onPress={() => setLocationTracking(!locationTracking)}
            isSwitch={true}
          />

          <SettingsOption
            icon="share"
            title="Data Sharing"
            value={dataSharing}
            onPress={() => setDataSharing(!dataSharing)}
            isSwitch={true}
          />

          <SettingsOption
            icon="analytics"
            title="Activity Tracking"
            value={activityTracking}
            onPress={() => setActivityTracking(!activityTracking)}
            isSwitch={true}
          />

          <SettingsOption
            icon="finger-print"
            title="Biometric Authentication"
            value={biometricEnabled}
            onPress={toggleBiometric}
            isSwitch={true}
          />

          <SettingsOption
            icon="shield-checkmark"
            title="Privacy Policy"
            onPress={() => Linking.openURL("https://yourapp.com/privacy")}
          />

          <SettingsOption
            icon="document-text"
            title="Terms of Service"
            onPress={() => Linking.openURL("https://yourapp.com/terms")}
          />
        </View>

        {/* Data Management Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Data Management</Text>

          <SettingsOption
          value={"me"}
            icon="trash-bin"
            title="Clear Cache"
            onPress={handleClearCache}
          />

          <SettingsOption
            icon="download"
            title="Export My Data"
            onPress={handleExportData}
          />

          <SettingsOption
            icon="user-times"
            title="Delete Account"
            onPress={handleDeleteAccount}
            iconType="fontawesome"
          />
        </View>

        {/* Help & Support Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Help & Support</Text>

          <SettingsOption
            icon="help-circle"
            title="FAQs"
            onPress={() => router.push("/faqs")}
          />

          <SettingsOption
            icon="mail"
            title="Contact Support"
            onPress={handleContactSupport}
          />

          <SettingsOption
            icon="information-circle"
            title="About"
            onPress={() => router.push("/about")}
          />

          <SettingsOption
            icon="star"
            title="Rate App"
            onPress={() =>
              Linking.openURL(
                Platform.OS === "ios"
                  ? "https://apps.apple.com/app/yourapp"
                  : "https://play.google.com/store/apps/details?id=com.yourapp"
              )
            }
          />

          <SettingsOption icon="code" title="App Version" value="1.2.3" />
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.actionButton, styles.logoutButton]}
          onPress={handleLogout}>
          <Text style={styles.actionButtonText}>Log Out</Text>
        </TouchableOpacity>

        {/* Edit Profile Modal */}
        <Modal visible={isEditing} animationType="slide" transparent={true}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Profile</Text>

              <TouchableOpacity
                style={styles.profileImageContainer}
                onPress={handlePickImage}>
                <Image
                  source={{
                    uri:
                      editedUser.profilePicture ||
                      "https://via.placeholder.com/120",
                  }}
                  style={styles.profileImageEdit}
                />
                <View style={styles.cameraIconContainer}>
                  <MaterialIcons name="camera-alt" size={22} color="#fff" />
                </View>
              </TouchableOpacity>

              <TextInput
                style={styles.input}
                value={editedUser.name}
                onChangeText={(text) =>
                  setEditedUser((prev) => ({ ...prev, name: text }))
                }
                placeholder="Name"
              />

              <TextInput
                style={styles.input}
                value={editedUser.username}
                onChangeText={(text) =>
                  setEditedUser((prev) => ({ ...prev, username: text }))
                }
                placeholder="Username"
              />

              <TextInput
                style={styles.input}
                value={editedUser.email}
                onChangeText={(text) =>
                  setEditedUser((prev) => ({ ...prev, email: text }))
                }
                placeholder="Email"
                keyboardType="email-address"
              />

              <TextInput
                style={styles.input}
                value={editedUser.phone}
                onChangeText={(text) =>
                  setEditedUser((prev) => ({ ...prev, phone: text }))
                }
                placeholder="Phone"
                keyboardType="phone-pad"
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setIsEditing(false)}>
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleUpdateProfile}>
                  <Text style={styles.modalButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Language Selection Modal */}
        <Modal
          visible={showLanguageModal}
          animationType="slide"
          transparent={true}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Language</Text>

              <ScrollView style={styles.optionsList}>
                {languages.map((lang) => (
                  <TouchableOpacity
                    key={lang}
                    style={[
                      styles.optionItem,
                      selectedLanguage === lang && styles.selectedOption,
                    ]}
                    onPress={() => {
                      setSelectedLanguage(lang);
                      setShowLanguageModal(false);
                    }}>
                    <Text
                      style={[
                        styles.optionText,
                        selectedLanguage === lang && styles.selectedOptionText,
                      ]}>
                      {lang}
                    </Text>
                    {selectedLanguage === lang && (
                      <MaterialIcons name="check" size={24} color="#007BFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.cancelButton,
                  { width: "100%" },
                ]}
                onPress={() => setShowLanguageModal(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Theme Selection Modal */}
        <Modal
          visible={showThemeModal}
          animationType="slide"
          transparent={true}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Theme</Text>

              <ScrollView style={styles.optionsList}>
                {themes.map((theme) => (
                  <TouchableOpacity
                    key={theme}
                    style={[
                      styles.optionItem,
                      selectedTheme === theme && styles.selectedOption,
                    ]}
                    onPress={() => {
                      setSelectedTheme(theme);
                      setShowThemeModal(false);
                    }}>
                    <View
                      style={[
                        styles.themeColor,
                        { backgroundColor: getThemeColor(theme) },
                      ]}
                    />
                    <Text
                      style={[
                        styles.optionText,
                        selectedTheme === theme && styles.selectedOptionText,
                      ]}>
                      {theme}
                    </Text>
                    {selectedTheme === theme && (
                      <MaterialIcons name="check" size={24} color="#007BFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.cancelButton,
                  { width: "100%" },
                ]}
                onPress={() => setShowThemeModal(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Font Size Modal */}
        <Modal
          visible={showFontSizeModal}
          animationType="slide"
          transparent={true}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Font Size</Text>

              <ScrollView style={styles.optionsList}>
                {fontSizes.map((size) => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.optionItem,
                      fontSize === size && styles.selectedOption,
                    ]}
                    onPress={() => {
                      setFontSize(size);
                      setShowFontSizeModal(false);
                    }}>
                    <Text
                      style={[
                        styles.optionText,
                        getFontSizeStyle(size),
                        fontSize === size && styles.selectedOptionText,
                      ]}>
                      {size}
                    </Text>
                    {fontSize === size && (
                      <MaterialIcons name="check" size={24} color="#007BFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.cancelButton,
                  { width: "100%" },
                ]}
                onPress={() => setShowFontSizeModal(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

// Helper functions
const getThemeColor = (theme) => {
  switch (theme) {
    case "Default":
      return "#007BFF";
    case "Dark":
      return "#333333";
    case "Light":
      return "#F5F5F5";
    case "Blue":
      return "#1E90FF";
    case "Green":
      return "#2E8B57";
    case "Purple":
      return "#8A2BE2";
    default:
      return "#007BFF";
  }
};

const getFontSizeStyle = (size) => {
  switch (size) {
    case "Small":
      return { fontSize: 12 };
    case "Medium":
      return { fontSize: 16 };
    case "Large":
      return { fontSize: 20 };
    case "Extra Large":
      return { fontSize: 24 };
    default:
      return { fontSize: 16 };
  }
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f9f9f9",
    padding: 20,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    top: 10,
    left: 10,
    padding: 10,
    zIndex: 10,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#007BFF",
  },
  profileImageContainer: {
    marginBottom: 20,
    position: "relative",
  },
  profileImageEdit: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#007BFF",
  },
  cameraIconContainer: {
    position: "absolute",
    right: -5,
    bottom: -5,
    backgroundColor: "#007BFF",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  editIcon: {
    position: "absolute",
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 5,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  detailsSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  userEmail: {
    fontSize: 16,
    color: "#666",
    marginBottom: 5,
  },
  userRole: {
    fontSize: 14,
    color: "#888",
  },
  actionsSection: {
    width: "100%",
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  logoutButton: {
    backgroundColor: "#dc3545",
    marginTop: 10,
    marginBottom: 30,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#dc3545",
  },
  saveButton: {
    backgroundColor: "#007BFF",
  },
  modalButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  settingsSection: {
    marginBottom: 20,
    width: "100%",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
    marginLeft: 5,
  },
  settingsOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  settingsOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingsOptionText: {
    fontSize: 16,
    marginLeft: 10,
    color: "#333",
  },
  optionRightContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionValue: {
    marginRight: 8,
    color: "#666",
    fontSize: 14,
  },
  optionsList: {
    width: "100%",
    marginBottom: 15,
    maxHeight: 300,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  selectedOption: {
    backgroundColor: "rgba(0, 123, 255, 0.1)",
  },
  selectedOptionText: {
    color: "#007BFF",
    fontWeight: "bold",
  },
  themeColor: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
});

export default Settings;
