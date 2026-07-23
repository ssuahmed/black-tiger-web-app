const iconMap = {
  search: SearchGlyph,
  user: UserGlyph,
  cart: CartGlyph,
  chat: ChatGlyph,
  close: CloseGlyph,
};

export const ICON_NAMES = ["search", "user", "cart", "chat", "close"];

export default function Icon({ name, className = "", title, ...rest }) {
  const Glyph = iconMap[name];
  if (!Glyph) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[Icon] Unknown icon name: "${name}". Expected one of: ${ICON_NAMES.join(", ")}`);
    }
    return null;
  }

  const a11y = title
    ? { role: "img", "aria-label": title }
    : { "aria-hidden": true };

  return <Glyph className={["inline-block shrink-0", className].filter(Boolean).join(" ")} {...a11y} {...rest} />;
}

function SearchGlyph({ className, ...rest }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...rest}>
      <path
        d="M36 36L30.2094 30.2094M30.2094 30.2094C31.1999 29.2189 31.9856 28.043 32.5217 26.7488C33.0577 25.4547 33.3336 24.0676 33.3336 22.6668C33.3336 21.266 33.0577 19.879 32.5217 18.5848C31.9856 17.2906 31.1999 16.1147 30.2094 15.1242C29.2189 14.1337 28.043 13.348 26.7488 12.812C25.4547 12.2759 24.0676 12 22.6668 12C21.266 12 19.879 12.2759 18.5848 12.812C17.2906 13.348 16.1147 14.1337 15.1242 15.1242C13.1238 17.1247 12 19.8378 12 22.6668C12 25.4958 13.1238 28.209 15.1242 30.2094C17.1247 32.2098 19.8378 33.3336 22.6668 33.3336C25.4958 33.3336 28.209 32.2098 30.2094 30.2094Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UserGlyph({ className, ...rest }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...rest}>
      <path
        d="M14 36V34.5C14 31.7152 15.1062 29.0445 17.0754 27.0754C19.0445 25.1062 21.7152 24 24.5 24M24.5 24C27.2848 24 29.9555 25.1062 31.9246 27.0754C33.8938 29.0445 35 31.7152 35 34.5V36M24.5 24C26.0913 24 27.6174 23.3679 28.7426 22.2426C29.8679 21.1174 30.5 19.5913 30.5 18C30.5 16.4087 29.8679 14.8826 28.7426 13.7574C27.6174 12.6321 26.0913 12 24.5 12C22.9087 12 21.3826 12.6321 20.2574 13.7574C19.1321 14.8826 18.5 16.4087 18.5 18C18.5 19.5913 19.1321 21.1174 20.2574 22.2426C21.3826 23.3679 22.9087 24 24.5 24Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CartGlyph({ className, ...rest }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...rest}>
      <path
        d="M20.6674 36.0002C21.9558 36.0002 23.0002 34.9558 23.0002 33.6674C23.0002 32.379 21.9558 31.3346 20.6674 31.3346C19.379 31.3346 18.3346 32.379 18.3346 33.6674C18.3346 34.9558 19.379 36.0002 20.6674 36.0002Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M30.8306 36.0002C32.1189 36.0002 33.1634 34.9558 33.1634 33.6674C33.1634 32.379 32.1189 31.3346 30.8306 31.3346C29.5422 31.3346 28.4978 32.379 28.4978 33.6674C28.4978 34.9558 29.5422 36.0002 30.8306 36.0002Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.2597 15.1611L18.0162 23.8889C18.44 25.2302 18.6512 25.9008 19.0585 26.3973C19.4151 26.8361 19.88 27.1749 20.4053 27.3847C21.0018 27.6219 21.704 27.6219 23.1111 27.6219H28.3979C29.805 27.6219 30.5072 27.6219 31.1024 27.3847C31.629 27.1749 32.0926 26.8361 32.4505 26.3973C32.8565 25.9008 33.0677 25.2302 33.4928 23.8889L34.0537 22.1115L34.3829 21.061L34.8368 19.621C34.9988 19.1074 35.0375 18.5629 34.9498 18.0315C34.8622 17.5002 34.6506 16.997 34.3322 16.5626C34.0138 16.1283 33.5975 15.7751 33.1172 15.5316C32.6368 15.2881 32.1059 15.1612 31.5673 15.1611H15.2597ZM15.2597 15.1611L15.2446 15.1104C15.1867 14.9164 15.1226 14.7243 15.0526 14.5344C14.7749 13.8316 14.3041 13.2217 13.6945 12.7752C13.0849 12.3286 12.3614 12.0637 11.6075 12.011C11.4663 12 11.3113 12 11 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChatGlyph({ className, ...rest }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...rest}>
      <path
        d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7A2.5 2.5 0 0 1 17.5 16H9l-4 3.5V6.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseGlyph({ className, ...rest }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...rest}>
      <path
        d="M6 6L18 18M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ArrowRightIcon({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M5 12H19M19 12L13 6M19 12L13 18"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
