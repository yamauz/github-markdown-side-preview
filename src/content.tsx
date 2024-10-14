import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import cn from "classnames";

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

  const [textAreaContent, setTextAreaContent] = useState<string>("");

  useEffect(() => {
    if (!isFocused) return;

    const focusedTextarea = document.activeElement;
    console.log(focusedTextarea);

    if (!isTextAreaElement(focusedTextarea)) return;

    const handleInput = (e: Event) => {
      if (!isTextAreaElement(e.target)) return;
      console.log("abc");
      setTextAreaContent(e.target.value);
    };

    focusedTextarea.addEventListener("input", handleInput);
    return () => {
      focusedTextarea.removeEventListener("input", handleInput);
    };
  }, [isFocused]);

  useEffect(() => {
    const handleFocus = (e: Event) => {
      if (!isTextAreaElement(e.target)) return;

      const focusedTextarea = e.target;
      setTextAreaContent(focusedTextarea.value);

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
          targetFileAttachment = target;
          break;
        }
      }

      if (targetFileAttachment !== undefined && injectedRef.current) {
        // @ts-ignore
        targetFileAttachment.style.position = "relative";
        // width取得
        const width = targetFileAttachment.getBoundingClientRect().width;

        // leftにwidthを足す
        injectedRef.current.style.left = `${width + 40}px`;
        targetFileAttachment.after(injectedRef.current);
        setIsFocused(true);
      }
    };

    const handleBlur = () => {
      setIsFocused(false);
    };

    document.addEventListener("focus", handleFocus, true);
    document.addEventListener("blur", handleBlur, true);
    return () => {
      document.removeEventListener("focus", handleFocus, true);
      document.removeEventListener("blur", handleBlur, true);
    };
  }, []);

  return (
    <div
      ref={injectedRef}
      className={cn(
        "side-preview",
        "bg-slate-950 absolute top-0 p-2 rounded-sm whitespace-pre-line text-white w-[400px] opacity-0 transition-all duration-300",
        isFocused && "opacity-100"
      )}
    >
      <div>{textAreaContent}</div>
    </div>
  );
};

ReactDOM.createRoot(getRoot()).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
