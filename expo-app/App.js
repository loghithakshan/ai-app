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
  Animated,
  Easing,
  StatusBar as RNStatusBar,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';

// Current local IPs detected on development host
const CURRENT_WIFI_IP = '172.26.28.70';
const HOTSPOT_IP = '192.168.137.1';

// Automatically detect the host PC's IP address from Expo Metro bundler
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
      if (ip && ip.length > 6) {
        return `http://${ip}:3000`;
      }
    }
  } catch (e) {
    // Fall back to known active IP
  }
  return `http://${CURRENT_WIFI_IP}:3000`;
};

const DEFAULT_URL = getDetectedServerUrl();

const PRESETS = [
  { label: '⚡ USB Cable Tunnel (localhost:3000)', url: 'http://localhost:3000' },
  { label: `📶 Current Wi-Fi (${CURRENT_WIFI_IP}:3000)`, url: `http://${CURRENT_WIFI_IP}:3000` },
  { label: `📱 Mobile Hotspot (${HOTSPOT_IP}:3000)`, url: `http://${HOTSPOT_IP}:3000` },
  { label: '🔍 Auto-Detected Metro IP', url: getDetectedServerUrl() },
];

// Injected CSS and scripts to provide buttery-smooth transitions inside the app
// without modifying ANY files in src/ (preserves web desktop alignment completely)
const INJECTED_TRANSITIONS_SCRIPT = `
(function() {
  // Prevent duplicate injection
  if (window.__neurobloom_mobile_injected) return;
  window.__neurobloom_mobile_injected = true;

  // Inject optimized mobile transition stylesheet
  var style = document.createElement('style');
  style.id = 'neurobloom-mobile-transitions';
  style.innerHTML = \`
    * {
      -webkit-tap-highlight-color: transparent !important;
      -webkit-touch-callout: none !important;
      outline: none !important;
    }

    html, body {
      background-color: #050510 !important;
      overscroll-behavior-y: none !important;
      -webkit-font-smoothing: antialiased !important;
      touch-action: pan-x pan-y !important;
      user-select: none !important;
    }

    /* Hardware-accelerated smooth transitions for page and layout changes */
    main, #__next, [role="main"] {
      transition: opacity 0.28s cubic-bezier(0.16, 1, 0.3, 1), transform 0.28s cubic-bezier(0.16, 1, 0.3, 1) !important;
      will-change: opacity, transform;
    }

    /* Fluid interactive button & link micro-transitions */
    button, a, [role="button"] {
      transition: transform 0.16s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.16s ease !important;
    }

    button:active, a:active, [role="button"]:active {
      transform: scale(0.96) !important;
      opacity: 0.82 !important;
    }

    /* Smooth dialog & modal transitions */
    [role="dialog"] {
      animation: nbModalFadeIn 0.24s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
    }

    @keyframes nbModalFadeIn {
      from {
        opacity: 0;
        transform: scale(0.95) translateY(8px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    /* Hide unsightly browser scrollbars on mobile view */
    ::-webkit-scrollbar {
      width: 0px !important;
      height: 0px !important;
      display: none !important;
    }
  \`;

  if (document.head) {
    document.head.appendChild(style);
  } else {
    document.addEventListener('DOMContentLoaded', function() {
      document.head.appendChild(style);
    });
  }
})();
true;
`;

export default function App() {
  const [targetUrl, setTargetUrl] = useState(DEFAULT_URL);
  const [inputUrl, setInputUrl] = useState(DEFAULT_URL);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [navTitle, setNavTitle] = useState('NeuroBloom');

  const webViewRef = useRef(null);

  // Animated values for transitions
  const fadeAnim = useRef(new Animated.Value(0)).current; // Webview fade-in
  const splashOpacity = useRef(new Animated.Value(1)).current; // Splash fade-out
  const pulseAnim = useRef(new Animated.Value(1)).current; // Glowing logo pulse
  const progressAnim = useRef(new Animated.Value(0)).current; // Progress bar transition
  const progressBarOpacity = useRef(new Animated.Value(0)).current;

  // Continuous gentle cosmic pulsing animation for the loader
  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.95,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [pulseAnim]);

  // Handle hardware back button for seamless app navigation
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const onBackPress = () => {
      if (showSettings) {
        setShowSettings(false);
        return true;
      }
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [canGoBack, showSettings]);

  // Smooth progress bar transitions during navigation
  const handleLoadProgress = ({ nativeEvent }) => {
    const progress = nativeEvent.progress;

    if (progress < 1) {
      Animated.timing(progressBarOpacity, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }).start();

      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: false,
      }).start(() => {
        Animated.timing(progressBarOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start(() => {
          progressAnim.setValue(0);
        });
      });
    }
  };

  const handleLoadStart = () => {
    setIsLoading(true);
    setLoadError(null);
  };

  const handleLoadEnd = () => {
    setIsLoading(false);

    // Smooth transition: Reveal WebView with fade-in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(splashOpacity, {
        toValue: 0,
        duration: 400,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleLoadError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    setIsLoading(false);
    setLoadError(nativeEvent.description || 'Connection failed');
    splashOpacity.setValue(1);
    fadeAnim.setValue(0);
  };

  const handleReload = () => {
    setLoadError(null);
    setIsLoading(true);
    splashOpacity.setValue(1);
    fadeAnim.setValue(0);
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
    splashOpacity.setValue(1);
    fadeAnim.setValue(0);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar style="light" backgroundColor="#050510" translucent={false} />

        {/* Animated Progress Transition Bar */}
        <Animated.View
          style={[
            styles.progressBarContainer,
            { opacity: progressBarOpacity },
          ]}
          pointerEvents="none"
        >
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </Animated.View>

        {/* Main WebView Container */}
        <View style={styles.webviewContainer}>
          <Animated.View style={[styles.webviewAnimatedWrapper, { opacity: fadeAnim }]}>
            <WebView
              ref={webViewRef}
              source={{ uri: targetUrl }}
              style={styles.webview}
              // WebGL & Hardware Acceleration for 3D Three.js Brain
              androidHardwareAccelerationDisabled={false}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              // Full audio & media playback
              allowsInlineMediaPlayback={true}
              mediaPlaybackRequiresUserAction={false}
              // Gesture and zoom handling
              scalesPageToFit={false}
              setBuiltInZoomControls={false}
              displayZoomControls={false}
              pullToRefreshEnabled={true}
              // Network & Mixed content for local dev
              mixedContentMode="always"
              originWhitelist={['*']}
              // Inject smooth mobile transitions without touching web files
              injectedJavaScriptBeforeContentLoaded={INJECTED_TRANSITIONS_SCRIPT}
              injectedJavaScript={INJECTED_TRANSITIONS_SCRIPT}
              // Event handlers
              onLoadProgress={handleLoadProgress}
              onLoadStart={handleLoadStart}
              onLoadEnd={handleLoadEnd}
              onError={handleLoadError}
              onNavigationStateChange={(navState) => {
                setCanGoBack(navState.canGoBack);
                if (navState.title) setNavTitle(navState.title);
              }}
            />
          </Animated.View>

          {/* Smooth Neural Splash / Loading Transition Screen */}
          {isLoading && !loadError && (
            <Animated.View
              style={[
                styles.splashOverlay,
                { opacity: splashOpacity },
              ]}
              pointerEvents="none"
            >
              <Animated.View
                style={[
                  styles.logoGlowRing,
                  {
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              >
                <View style={styles.logoCore}>
                  <Text style={styles.logoEmoji}>🧠</Text>
                </View>
              </Animated.View>

              <Text style={styles.splashTitle}>NeuroBloom</Text>
              <Text style={styles.splashSubtitle}>Transitioning to neural core...</Text>
              <Text style={styles.splashUrl}>{targetUrl}</Text>

              <View style={styles.spinnerRow}>
                <ActivityIndicator size="small" color="#06b6d4" />
                <Text style={styles.spinnerText}>Loading app experience</Text>
              </View>
            </Animated.View>
          )}

          {/* Floating Settings Action Pill (Discreet, Top-Right) */}
          <TouchableOpacity
            style={styles.floatingSettingsBtn}
            onPress={() => setShowSettings(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.floatingSettingsText}>⚙</Text>
          </TouchableOpacity>

          {/* Error Fallback Screen with 1-Tap Connection Switchers */}
          {loadError && (
            <View style={styles.errorContainer}>
              <View style={styles.errorCard}>
                <View style={styles.errorIconCircle}>
                  <Text style={styles.errorIcon}>⚡</Text>
                </View>

                <Text style={styles.errorTitle}>Cannot Reach Web Server</Text>
                <Text style={styles.errorUrl}>{targetUrl}</Text>

                <Text style={styles.errorDesc}>
                  Select your current connection mode below to connect instantly:
                </Text>

                <View style={styles.presetButtonGroup}>
                  {PRESETS.map((preset, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.presetBtn,
                        targetUrl === preset.url && styles.presetBtnActive,
                      ]}
                      onPress={() => handleApplyUrl(preset.url)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.presetBtnText}>{preset.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.errorActionRow}>
                  <TouchableOpacity
                    style={[styles.btn, styles.retryBtn]}
                    onPress={handleReload}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.btnText}>🔄 Retry Connection</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.btn, styles.configBtn]}
                    onPress={() => setShowSettings(true)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.btnText}>⚙ Custom IP</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Custom Server URL Settings Modal */}
        <Modal
          visible={showSettings}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowSettings(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalBackdrop}
          >
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderLeft}>
                  <Text style={styles.modalIcon}>🌐</Text>
                  <Text style={styles.modalTitle}>Expo Go Connection</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowSettings(false)}
                  style={styles.closeTouch}
                >
                  <Text style={styles.closeBtn}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Enter Server URL (Next.js):</Text>
              <TextInput
                style={styles.input}
                value={inputUrl}
                onChangeText={setInputUrl}
                placeholder="http://172.26.28.70:3000"
                placeholderTextColor="#64748b"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />

              <Text style={styles.presetsHeader}>Quick Connection Modes:</Text>
              {PRESETS.map((p, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.modalPresetRow}
                  onPress={() => handleApplyUrl(p.url)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalPresetName}>{p.label}</Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={[styles.btn, styles.connectBtn]}
                onPress={() => handleApplyUrl(inputUrl)}
                activeOpacity={0.8}
              >
                <Text style={styles.connectBtnText}>Apply & Transition to App</Text>
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
  progressBarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(5, 5, 16, 0.4)',
    zIndex: 100,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#06b6d4',
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 3,
  },
  webviewContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#050510',
  },
  webviewAnimatedWrapper: {
    flex: 1,
    backgroundColor: '#050510',
  },
  webview: {
    flex: 1,
    backgroundColor: '#050510',
  },
  floatingSettingsBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 40,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(13, 13, 32, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  floatingSettingsText: {
    color: '#94a3b8',
    fontSize: 16,
  },
  splashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#050510',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    paddingHorizontal: 24,
  },
  logoGlowRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    borderWidth: 2,
    borderColor: 'rgba(6, 182, 212, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 8,
  },
  logoCore: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(124, 58, 237, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: {
    fontSize: 28,
  },
  splashTitle: {
    color: '#f0f0ff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  splashSubtitle: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 6,
    fontWeight: '500',
  },
  splashUrl: {
    color: '#64748b',
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginTop: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  spinnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 28,
  },
  spinnerText: {
    color: '#06b6d4',
    fontSize: 12,
    fontWeight: '600',
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#050510',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    zIndex: 60,
  },
  errorCard: {
    backgroundColor: '#0d0d20',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
    borderRadius: 22,
    padding: 22,
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  errorIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  errorIcon: {
    fontSize: 24,
  },
  errorTitle: {
    color: '#f87171',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
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
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  presetButtonGroup: {
    width: '100%',
    gap: 8,
    marginBottom: 14,
  },
  presetBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 14,
  },
  presetBtnActive: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    borderColor: '#06b6d4',
  },
  presetBtnText: {
    color: '#f1f5f9',
    fontSize: 12,
    fontWeight: '600',
  },
  errorActionRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  btn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryBtn: {
    backgroundColor: '#7c3aed',
  },
  configBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  btnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#0d0d20',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.3)',
    padding: 22,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalIcon: {
    fontSize: 18,
  },
  modalTitle: {
    color: '#f0f0ff',
    fontSize: 16,
    fontWeight: '700',
  },
  closeTouch: {
    padding: 6,
  },
  closeBtn: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputLabel: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#12122a',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.4)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#f0f0ff',
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 16,
  },
  presetsHeader: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  modalPresetRow: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
    padding: 11,
    marginBottom: 8,
  },
  modalPresetName: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '600',
  },
  connectBtn: {
    backgroundColor: '#7c3aed',
    paddingVertical: 13,
    marginTop: 10,
  },
  connectBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
