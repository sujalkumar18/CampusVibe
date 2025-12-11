export default ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    package: "com.campusvibe.app",
  },
});