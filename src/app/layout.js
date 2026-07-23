import localFont from "next/font/local";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import CartAuthSync from "@/components/cart/CartAuthSync";
import "./globals.css";

const fontGeogrotesque = localFont({
  src: [
    { path: "../fonts/geogrotesque/GeogrotesqueTRIAL-Rg.otf", weight: "400", style: "normal" },
    { path: "../fonts/geogrotesque/GeogrotesqueTRIAL-Md.otf", weight: "500", style: "normal" },
    { path: "../fonts/geogrotesque/GeogrotesqueTRIAL-Bd.otf", weight: "700", style: "normal" },
  ],
  variable: "--font-stack-geogrotesque",
  display: "swap",
});

const fontMagistral = localFont({
  src: [
    { path: "../fonts/magistral/MagistralC.otf", weight: "400", style: "normal" },
    { path: "../fonts/magistral/MagistralC-Bold.otf", weight: "700", style: "normal" },
  ],
  variable: "--font-stack-magistral",
  display: "swap",
});

export const metadata = {
  title: "Black Tiger | High-End Lubricants",
  description:
    "Black Tiger — premium engine oils and industrial lubricants engineered for performance and reliability.",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${fontGeogrotesque.variable} ${fontMagistral.variable}`}>
      <body className={`${fontGeogrotesque.className} flex min-h-screen-stretch flex-col font-sans antialiased`}>
        <AuthProvider>
          <CartProvider>
            <CartAuthSync />
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
