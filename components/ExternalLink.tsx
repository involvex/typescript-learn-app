import * as WebBrowser from "expo-web-browser";
import { Linking, Pressable, type PressableProps } from "react-native";
import type { ReactNode } from "react";

type Props = Omit<PressableProps, "onPress"> & {
  href: string;
  children: ReactNode;
};

export function ExternalLink({ href, children, ...rest }: Props) {
  return (
    <Pressable
      {...rest}
      onPress={() => {
        WebBrowser.openBrowserAsync(href).catch(() => {
          Linking.openURL(href).catch(() => {});
        });
      }}
    >
      {children}
    </Pressable>
  );
}
