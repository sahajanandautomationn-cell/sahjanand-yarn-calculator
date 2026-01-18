import "./globals.css";

export const metadata = {
  title: "Sahjanand Yarn Calculator",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
