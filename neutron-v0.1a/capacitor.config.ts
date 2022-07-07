import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.app.neutron",
  appName: "Neutron",
  webDir: "public/build",
  bundledWebRuntime: false,
  server: {
    url: "http://test.neutron.money",
    cleartext: true,
  },
  loggingBehavior:'production'
};

export default config;
