import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Linking,
  Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function AboutScreen() {
  const router = useRouter();

  const handleLinkPress = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>About</Text>
        </View>

        {/* App Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/icon.png')}
            style={styles.logo}
          />
          <Text style={styles.appName}>NanaYaw</Text>
          <Text style={styles.version}>Version 1.2.3</Text>
        </View>

        {/* App Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About NanaYaw</Text>
          <Text style={styles.description}>
            NanaYaw is your personal mental health companion, designed to help you
            track your mood, manage your emotions, and connect with mental health
            professionals. Our mission is to make mental healthcare accessible and
            convenient for everyone.
          </Text>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Features</Text>
          <View style={styles.featureList}>
            <Text style={styles.featureItem}>• Mood Tracking</Text>
            <Text style={styles.featureItem}>• Professional Consultations</Text>
            <Text style={styles.featureItem}>• Journal Entries</Text>
            <Text style={styles.featureItem}>• Activity Monitoring</Text>
            <Text style={styles.featureItem}>• Secure Communication</Text>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <TouchableOpacity
            onPress={() => handleLinkPress('mailto:support@nanayaw.com')}
          >
            <Text style={styles.link}>support@nanayaw.com</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleLinkPress('https://nanayaw.com')}
          >
            <Text style={styles.link}>www.nanayaw.com</Text>
          </TouchableOpacity>
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <TouchableOpacity
            onPress={() => handleLinkPress('https://nanayaw.com/privacy')}
          >
            <Text style={styles.link}>Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleLinkPress('https://nanayaw.com/terms')}
          >
            <Text style={styles.link}>Terms of Service</Text>
          </TouchableOpacity>
        </View>

        {/* Copyright */}
        <Text style={styles.copyright}>
          © {new Date().getFullYear()} NanaYaw. All rights reserved.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 20,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  version: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  section: {
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  featureList: {
    marginTop: 5,
  },
  featureItem: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 5,
    color: '#333',
  },
  link: {
    fontSize: 16,
    color: '#007AFF',
    marginBottom: 10,
  },
  copyright: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
});