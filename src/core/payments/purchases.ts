import Purchases, {
  LOG_LEVEL,
  type PurchasesPackage,
} from "react-native-purchases";

export type { PurchasesPackage };

export const FREE_TIER = process.env.EXPO_PUBLIC_FREE_TIER === "true";
const RC_KEY = process.env.EXPO_PUBLIC_REVENUECAT_KEY;

export const isPaymentConfigured = Boolean(RC_KEY) && !FREE_TIER;

export function initializePurchases() {
  if (!RC_KEY || FREE_TIER) return;
  try {
    if (__DEV__) Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    Purchases.configure({ apiKey: RC_KEY });
  } catch (e) {
    console.warn("[Purchases] init failed:", e);
  }
}

export async function getOfferings() {
  if (!isPaymentConfigured) return null;
  try {
    return await Purchases.getOfferings();
  } catch (e) {
    console.warn("[Purchases] getOfferings failed:", e);
    return null;
  }
}

export async function purchasePackage(pkg: PurchasesPackage) {
  return Purchases.purchasePackage(pkg);
}

export async function restorePurchases() {
  return Purchases.restorePurchases();
}

export function getPackagesByPlatform(packages: PurchasesPackage[]): {
  monthly: PurchasesPackage | null;
  yearly: PurchasesPackage | null;
  lifetime: PurchasesPackage | null;
} {
  const find = (id: string) =>
    packages.find((p) =>
      p.identifier.toLowerCase().includes(id.toLowerCase()),
    ) ?? null;
  return {
    monthly: find("monthly"),
    yearly: find("annual") || find("yearly"),
    lifetime: find("lifetime"),
  };
}
