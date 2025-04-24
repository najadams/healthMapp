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
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useUser, useSetUser } from "@/context/UserContext";
import { useRouter } from "expo-router";
import { logoutUser, updateUserProfile } from "@/utils/api";
import * as ImagePicker from 'expo-image-picker';

const Settings = () => {
  const user = useUser();
  const setUser = useSetUser();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    name: user?.name || "",
    email: user?.email || "",
    profilePicture: user?.profilePicture || "",
  });

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
      router.replace("/(auth)/auth");
    } catch (error) {
      Alert.alert("Logout Failed", "There was a problem logging out.");
    }
  };

  const handleEditProfile = () => {
    setEditedUser({
      name: user?.name || "",
      email: user?.email || "",
      profilePicture: user?.profilePicture || "",
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
        setEditedUser(prev => ({
          ...prev,
          profilePicture: result.assets[0].uri,
        }));
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

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

        {/* Profile Picture Section */}
        <View style={styles.profileSection}>
          <Image
            source={{ 
              uri: user?.profilePicture || 'https://via.placeholder.com/120'
            }}
            style={styles.profileImage}
          />
          <TouchableOpacity 
            style={styles.editIcon}
            onPress={handlePickImage}>
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
          <TouchableOpacity
            style={[styles.actionButton, styles.logoutButton]}
            onPress={handleLogout}>
            <Text style={styles.actionButtonText}>Log Out</Text>
          </TouchableOpacity>
        </View>

        {/* Edit Profile Modal */}
        <Modal
          visible={isEditing}
          animationType="slide"
          transparent={true}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              
              <TextInput
                style={styles.input}
                value={editedUser.name}
                onChangeText={(text) => setEditedUser(prev => ({ ...prev, name: text }))}
                placeholder="Name"
              />
              
              <TextInput
                style={styles.input}
                value={editedUser.email}
                onChangeText={(text) => setEditedUser(prev => ({ ...prev, email: text }))}
                placeholder="Email"
                keyboardType="email-address"
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
      </ScrollView>
    </SafeAreaView>
  );
};

// Add these new styles to your existing StyleSheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
  profileSection: {
    alignItems: "center",
    marginBottom: 20,
    marginTop: 40, // Ensure content does not overlap back button
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#007BFF",
  },
  editIcon: {
    position: "absolute",
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 5,
    elevation: 3,
  },
  detailsSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  userName: {
    fontSize: 24,
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
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#dc3545',
  },
  saveButton: {
    backgroundColor: '#007BFF',
  },
  modalButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default Settings;
