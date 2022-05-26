import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.app.neutron",
  appName: "Neutron",
  webDir: "public/build",
  bundledWebRuntime: false,
  server: {
    url: "http://192.168.0.109:3000",
    cleartext: true,
  },
};

export default config;
