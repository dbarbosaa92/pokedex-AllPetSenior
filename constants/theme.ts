import { Platform } from "react-native";

export const COLORS = {
  background: "#F5F5F5",
  white: "#FFFFFF",
  black: "#000000",
  types: {
    fire: "#F08030",
    water: "#6890F0",
    grass: "#78C850",
    electric: "#F8D030",
    psychic: "#F85888",
    ice: "#98D8D8",
    dragon: "#7038F8",
    dark: "#705848",
    fairy: "#EE99AC",
    normal: "#A8A878",
    fighting: "#C03028",
    flying: "#A890F0",
    poison: "#A040A0",
    ground: "#E0C068",
    rock: "#B8A038",
    bug: "#A8B820",
    ghost: "#705898",
    steel: "#B8B8D0",
  },
};

export const Colors = {
  light: {
    text: "#11181C",
    background: "#FFFFFF",
    tint: "#FF3B30",
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: "#FF3B30",
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    tint: "#FFFFFF",
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: "#FFFFFF",
  },
};

const systemFont = Platform.select({
  ios: "System",
  android: "Roboto",
  default: "System",
});

export const Fonts = {
  regular: systemFont,
  rounded: systemFont,
  mono: Platform.select({
    ios: "Menlo",
    android: "monospace",
    default: "monospace",
  }),
};
