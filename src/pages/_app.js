import "@fontsource/open-sans/400.css";
import "@fontsource/open-sans/700.css";

import "@/styles/globals.css";
import { ChakraProvider } from "@chakra-ui/react";
import { theme } from "../theme";

export default function App({ Component, pageProps }) {
  return (
    <ChakraProvider theme={theme}>
      <Component {...pageProps} />
    </ChakraProvider>
  );
}
