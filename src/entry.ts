// Side-effect imports must run BEFORE expo-router loads route modules.
// expo-router eagerly requires all route files during route tree discovery,
// so StyleSheet.configure() must execute before any StyleSheet.create().
import "./core/theme/unistyles";
import "./core/i18n";

import "expo-router/entry";
