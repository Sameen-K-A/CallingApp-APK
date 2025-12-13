import { Ionicons } from "@expo/vector-icons";

export interface MenuItem {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
  route: string;
};

export interface TabItem {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconFocused: keyof typeof Ionicons.glyphMap;
  route?: string;
  action?: "menu";
};

export interface IUserHeaderContent {
  heading: string;
  description: string;
};

export const USER_TAB_ITEMS: TabItem[] = [
  {
    id: "home",
    label: "Home",
    icon: "home-outline",
    iconFocused: "home",
    route: "/(app)/(user)/home",
  },
  {
    id: "favorites",
    label: "Favorites",
    icon: "heart-outline",
    iconFocused: "heart",
    route: "/(app)/(user)/favorites",
  },
  {
    id: "recharge",
    label: "Recharge",
    icon: "card-outline",
    iconFocused: "card",
    route: "/(app)/(user)/recharge",
  },
  {
    id: "settings",
    label: "Settings",
    icon: "settings-outline",
    iconFocused: "settings",
    action: "menu",
  },
];

export const USER_MENU_ITEMS: MenuItem[] = [
  {
    id: "account",
    label: "Account",
    icon: "person-outline",
    description: "Manage your profile",
    route: "/(app)/(user)/account",
  },
  {
    id: "call-history",
    label: "Call History",
    icon: "call-outline",
    description: "View your recent calls",
    route: "/(app)/(user)/call-history",
  },
  {
    id: "transaction-history",
    label: "Transaction History",
    icon: "receipt-outline",
    description: "View your payments",
    route: "/(app)/(user)/transaction-history",
  },
  {
    id: "favorites",
    label: "Favorites",
    icon: "heart-outline",
    description: "View favorite telecallers",
    route: "/(app)/(user)/favorites",
  },
  {
    id: "help",
    label: "Help",
    icon: "help-circle-outline",
    description: "Help center, contact us",
    route: "/(app)/(user)/help",
  },
];

export const USER_HEADER_CONTENTS: Record<string, IUserHeaderContent> = {
  "/home": {
    heading: "Home",
    description: "Welcome back!",
  },
  "/account": {
    heading: "Account",
    description: "Manage your profile",
  },
  "/call-history": {
    heading: "Call History",
    description: "View your recent calls",
  },
  "/transaction-history": {
    heading: "Transactions",
    description: "Your payment history",
  },
  "/favorites": {
    heading: "Favorites",
    description: "Your saved telecallers",
  },
  "/help": {
    heading: "Help",
    description: "Support & FAQs",
  },
  "/recharge": {
    heading: "Recharge",
    description: "Add coins to your wallet",
  },
};

export const TELECALLER_TAB_ITEMS: TabItem[] = [
  {
    id: "home",
    label: "Home",
    icon: "home-outline",
    iconFocused: "home",
    route: "/(app)/(telecaller)/dashboard",
  },
  {
    id: "wallet",
    label: "Wallet",
    icon: "card-outline",
    iconFocused: "card",
    route: "/(app)/(telecaller)/wallet",
  },
  {
    id: "account",
    label: "Account",
    icon: "person-outline",
    iconFocused: "person",
    route: "/(app)/(telecaller)/account",
  },
];

export const TELECALLER_HEADER_CONTENTS: Record<string, IUserHeaderContent> = {
  "/dashboard": {
    heading: "Dashboard",
    description: "Welcome back!",
  },
  "/account": {
    heading: "Account",
    description: "Manage your profile",
  },
  "/wallet": {
    heading: "Wallet",
    description: "Manage your wallet and withdrawels",
  },
};