import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  BackHandler,
  Platform,
  Modal,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';

// Helper to automatically detect PC's LAN IP address from Expo bundler connection
const CURRENT_WIFI_IP = '172.25.97.45';

const getDetectedServerUrl = () => {
  try {
    const hostUri =
      Constants.expoConfig?.hostUri ||
      Constants.manifest2?.extra?.expoClient?.hostUri ||
      Constants.manifest2?.extra?.expoGo?.debuggerHost ||
      Constants.manifest?.debuggerHost;

    if (hostUri) {
      const ip = hostUri.split(':')[0];
      if (ip === 'localhost' || ip === '127.0.0.1') {
        return 'http://localhost:3000';
      }
      if (ip) {
        return `http://${ip}:3000`;
      }
    }
  } catch (e) {
    // ignore
  }
  return `http://${CURRENT_WIFI_IP}:3000`;
};

const DEFAULT_URL = getDetectedServerUrl();

const PRESETS = [
  { label: '⚡ USB Cable (localhost:3000)', url: 'http://localhost:3000' },
  { label: `📶 Current Wi-Fi (${CURRENT_WIFI_IP}:3000)`, url: `http://${CURRENT_WIFI_IP}:3000` },
  { label: '📱 Mobile Hotspot (192.168.137.1:3000)', url: 'http://192.168.137.1:3000' },
  { label: '🔍 Auto-Detected Server IP', url: getDetectedServerUrl() },
  { label: '🤖 Android Emulator (10.0.2.2:3000)', url: 'http://10.0.2.2:3000' },
];

export default function App() {
  const [targetUrl, setTargetUrl] = useState(DEFAULT_URL);
  const [inputUrl, setInputUrl] = useState(DEFAULT_URL);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Auto-detect PC IP if Constants updates asynchronously
  useEffect(() => {
    const detected = getDetectedServerUrl();
    if (detected && detected !== targetUrl) {
      setTargetUrl(detected);
      setInputUrl(detected);
    }
  }, []);

  const webViewRef = useRef(null);

  // Android hardware back button handler
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const onBackPress = () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [canGoBack]);

  const handleReload = () => {
    setLoadError(null);
    setIsLoading(true);
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  const handleApplyUrl = (newUrl) => {
    let formatted = newUrl.trim();
    if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
      formatted = 'http://' + formatted;
    }
    setTargetUrl(formatted);
    setInputUrl(formatted);
    setLoadError(null);
    setIsLoading(true);
    setShowSettings(false);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" backgroundColor="#050510" translucent={false} />

      {/* Main WebView Container — 100% full screen edge-to-edge web experience */}
      <View style={styles.webviewContainer}>
        <WebView
          ref={webViewRef}
          source={{ uri: targetUrl }}
          style={styles.webview}
          // Enable hardware accelerated WebGL for Three.js 3D Brain
          androidHardwareAccelerationDisabled={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          // Full audio & media playback
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          // Viewport and zoom handling
          scalesPageToFit={false}
          setBuiltInZoomControls={false}
          displayZoomControls={false}
          // Network & Mixed content for local dev
          mixedContentMode="always"
          originWhitelist={['*']}
          // Status tracking
          onNavigationStateChange={(navState) => {
            setCanGoBack(navState.canGoBack);
          }}
          onLoadStart={() => {
            setIsLoading(true);
            setLoadError(null);
          }}
          onLoadEnd={() => {
            setIsLoading(false);
          }}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            setIsLoading(false);
            setLoadError(nativeEvent.description || 'Connection failed');
          }}
        />

        {/* Discreet floating connection button in corner */}
        <TouchableOpacity
          style={styles.floatingSettingsBtn}
          onPress={() => setShowSettings(true)}
          activeOpacity={0.6}
          title="Connection Settings"
        >
          <Text style={styles.floatingSettingsText}>⚙</Text>
        </TouchableOpacity>

        {/* Loading Overlay */}
        {isLoading && !loadError && (
          <View style={styles.loadingOverlay} pointerEvents="none">
            <ActivityIndicator size="large" color="#06b6d4" />
            <Text style={styles.loadingTitle}>Connecting to NeuroBloom...</Text>
            <Text style={styles.loadingSubtitle}>{targetUrl}</Text>
          </View>
        )}

        {/* Error Fallback Screen */}
        {loadError && (
          <View style={styles.errorContainer}>
            <View style={styles.errorCard}>
              <Text style={styles.errorIcon}>⚡</Text>
              <Text style={styles.errorTitle}>Cannot Connect to Web Server</Text>
              <Text style={styles.errorUrl}>{targetUrl}</Text>
              <Text style={styles.errorDesc}>
                {loadError}
                {'\n\n'}
                Quick Fix:
                {'\n'}• If plugged into PC with USB: Tap "USB Mode"
                {'\n'}• If on Wi-Fi: Tap "Wi-Fi IP" (or use mobile hotspot)
              </Text>

              <View style={styles.quickActionCol}>
                <TouchableOpacity
                  style={[styles.btn, styles.usbQuickBtn]}
                  onPress={() => handleApplyUrl('http://localhost:3000')}
                >
                  <Text style={styles.usbQuickBtnText}>⚡ Switch to USB Mode (localhost:3000)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btn, styles.wifiQuickBtn]}
                  onPress={() => handleApplyUrl(`http://${CURRENT_WIFI_IP}:3000`)}
                >
                  <Text style={styles.btnText}>📶 Switch to Wi-Fi IP ({CURRENT_WIFI_IP})</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btn, styles.wifiQuickBtn]}
                  onPress={() => handleApplyUrl('http://192.168.137.1:3000')}
                >
                  <Text style={styles.btnText}>📱 Switch to Hotspot (192.168.137.1)</Text>
                </TouchableOpacity>

                <View style={styles.errorBtnRow}>
                  <TouchableOpacity
                    style={[styles.btn, styles.retryBtn]}
                    onPress={handleReload}
                  >
                    <Text style={styles.btnText}>🔄 Retry</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.btn, styles.configBtn]}
                    onPress={() => setShowSettings(true)}
                  >
                    <Text style={styles.btnText}>⚙ Custom URL</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* URL / Connection Settings Modal */}
      <Modal
        visible={showSettings}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSettings(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Server Connection Settings</Text>
              <TouchableOpacity onPress={() => setShowSettings(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Enter Next.js Dev Server URL / IP:</Text>
            <TextInput
              style={styles.input}
              value={inputUrl}
              onChangeText={setInputUrl}
              placeholder="http://10.136.164.70:3000"
              placeholderTextColor="#6b7280"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />

            <Text style={styles.presetsLabel}>Quick Presets:</Text>
            {PRESETS.map((p, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.presetItem}
                onPress={() => handleApplyUrl(p.url)}
              >
                <Text style={styles.presetName}>{p.label}</Text>
                <Text style={styles.presetUrl}>{p.url}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[styles.btn, styles.connectBtn]}
              onPress={() => handleApplyUrl(inputUrl)}
            >
              <Text style={styles.connectBtnText}>Connect &amp; Load Web</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050510',
  },
  webviewContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#050510',
  },
  webview: {
    flex: 1,
    backgroundColor: '#050510',
  },
  floatingSettingsBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 50,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(5, 5, 16, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.6,
  },
  floatingSettingsText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 5, 16, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  loadingTitle: {
    color: '#f0f0ff',
    marginTop: 16,
    fontSize: 15,
    fontWeight: '600',
  },
  loadingSubtitle: {
    color: '#6b7280',
    marginTop: 6,
    fontSize: 12,
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#050510',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    zIndex: 20,
  },
  errorCard: {
    backgroundColor: '#0d0d20',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  errorIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  errorTitle: {
    color: '#f87171',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  errorUrl: {
    color: '#94a3b8',
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 12,
  },
  errorDesc: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'left',
    width: '100%',
    marginBottom: 20,
  },
  quickActionCol: {
    width: '100%',
    gap: 8,
  },
  usbQuickBtn: {
    backgroundColor: '#06b6d4',
    paddingVertical: 12,
  },
  usbQuickBtnText: {
    color: '#050510',
    fontSize: 13,
    fontWeight: '700',
  },
  wifiQuickBtn: {
    backgroundColor: 'rgba(124, 58, 237, 0.4)',
    borderWidth: 1,
    borderColor: '#7c3aed',
    paddingVertical: 12,
  },
  errorBtnRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginTop: 4,
  },
  btn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryBtn: {
    backgroundColor: '#7c3aed',
  },
  configBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  btnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#0d0d20',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.3)',
    padding: 20,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: '#f0f0ff',
    fontSize: 16,
    fontWeight: '700',
  },
  closeBtn: {
    color: '#94a3b8',
    fontSize: 18,
    fontWeight: 'bold',
    padding: 4,
  },
  inputLabel: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#12122a',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.4)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#f0f0ff',
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 16,
  },
  presetsLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  presetItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 6,
  },
  presetName: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '600',
  },
  presetUrl: {
    color: '#06b6d4',
    fontSize: 11,
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  connectBtn: {
    backgroundColor: '#7c3aed',
    paddingVertical: 12,
    marginTop: 12,
  },
  connectBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
