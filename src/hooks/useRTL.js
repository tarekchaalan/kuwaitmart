import { useEffect } from "react";

export function useRTL(lang) {
  useEffect(() => {
    if (typeof document !== "undefined") {
      const html = document.documentElement;
      const isAR = lang === "ar";
      html.dir = isAR ? "rtl" : "ltr";
      html.lang = lang;
    }
  }, [lang]);
}


