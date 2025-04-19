declare module "expo-router" {
  type RelativePathString = string;
  type ExternalPathString = `http${string}` | `https${string}` | `tel${string}` | `mailto${string}` | `sms${string}`;
  type PathString = RelativePathString | ExternalPathString;

  interface RouteMap {
    "/": {};
    "/auth/login": {};
    "/auth/check-email": {};
    "/(protected)/(tabs)": {};
    "/(protected)/(tabs)/explore": {};
    "/(protected)/(tabs)/library": {};
    "/(protected)/(tabs)/practice": {};
    "/(protected)/(tabs)/profile": {};
  }

  type RoutePaths = keyof RouteMap;
} 