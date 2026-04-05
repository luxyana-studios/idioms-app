import { Drawer } from "expo-router/drawer";
import { DrawerContent } from "@/shared/components/DrawerContent";

export default function MainLayout() {
  return (
    <Drawer
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{ headerShown: false, swipeEnabled: false }}
    >
      <Drawer.Screen name="(tabs)" options={{ headerShown: false }} />
      <Drawer.Screen name="(settings)" options={{ headerShown: false }} />
    </Drawer>
  );
}
