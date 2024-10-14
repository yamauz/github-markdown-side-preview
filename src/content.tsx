import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

const getRoot = () => {
  const root = document.createElement("div");
  root.id = "crx-root";
  document.body.appendChild(root);
  return root;
};

const isTextAreaElement = (
  target: EventTarget | null
): target is HTMLTextAreaElement => {
  return target instanceof HTMLTextAreaElement;
};

const App = () => {
  const injectedRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  useEffect(() => {
    const handleFocus = (e: Event) => {
      if (!isTextAreaElement(e.target)) return;

      const focusedTextarea = e.target;

      const fileAttachments = document.querySelectorAll("file-attachment");

      let targetFileAttachment: Element | undefined;

      for (let i = 0; i < fileAttachments.length; i++) {
        const fa = fileAttachments[i];
        const searchedTextAreas = fa.querySelectorAll("textarea");

        // focusedTextareaと同じtextareaがあれば、そのtextareaの親要素を取得
        const target = Array.from(searchedTextAreas).find(
          (textarea) => textarea === focusedTextarea
        );

        if (target !== undefined) {
          console.log("Found target");
          targetFileAttachment = fa;
          break;
        }
      }

      if (targetFileAttachment !== undefined && injectedRef.current) {
        // @ts-ignore
        targetFileAttachment.style.position = "relative";
        // width取得
        const width = targetFileAttachment.getBoundingClientRect().width;

        // leftにwidthを足す
        injectedRef.current.style.left = `${width + 30}px`;
        targetFileAttachment.after(injectedRef.current);
        setIsFocused(true);
      }
    };

    const handleBlur = () => {
      console.log("handleBlur");
      setIsFocused(false);
    };

    document.addEventListener("focus", handleFocus, true);
    document.addEventListener("blur", handleBlur, true);
    return () => {
      document.removeEventListener("focus", handleFocus, true);
      document.removeEventListener("blur", handleBlur, true);
    };
  }, []);

  console.log(isFocused);

  return (
    <div ref={injectedRef} className="side-preview">
      {isFocused && <div>hello asdf asdf asfd asdf asdf</div>}
    </div>
  );
};

ReactDOM.createRoot(getRoot()).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
