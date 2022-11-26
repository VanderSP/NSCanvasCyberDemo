import { NativeScriptConfig } from "@nativescript/core";

export default {
  id: "org.nativescript.NSCyberDemo",
  appPath: "app",
  appResourcesPath: "App_Resources",
  android: {
    enableTimers: true,
    v8Flags: "--expose_gc",
    markingMode: "none",
  },
} as NativeScriptConfig;
