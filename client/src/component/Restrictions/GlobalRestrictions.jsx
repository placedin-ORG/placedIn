import React, { useEffect } from "react";

const GlobalRestrictions = () => {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      const disableContextMenu = (e) => e.preventDefault();
      const disableShortcuts = (e) => {
        if (
          (e.ctrlKey &&
            e.shiftKey &&
            (e.key === "I" || e.key === "J" || e.key === "C")) ||
          (e.ctrlKey && e.key === "U") ||
          e.key === "F12"
        ) {
          e.preventDefault();
        }
      };

      document.addEventListener("contextmenu", disableContextMenu);
      document.addEventListener("keydown", disableShortcuts);

      return () => {
        document.removeEventListener("contextmenu", disableContextMenu);
        document.removeEventListener("keydown", disableShortcuts);
      };
    }
  }, []);

  return null;
};

export default GlobalRestrictions;
