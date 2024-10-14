import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import cn from "classnames";
import DOMPurify from "dompurify";
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.min.css";

const marked = new Marked(
  {
    gfm: true,
    breaks: true,
  },
  markedHighlight({
    langPrefix: "hljs language-",
    highlight(code: string, lang: string) {
      const language: string = hljs.getLanguage(lang) ? lang : "plaintext";
      return hljs.highlight(code, { language }).value;
    },
  })
);

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
  console.log(textAreaContent);

  useEffect(() => {
    if (!isFocused) return;

    const focusedTextarea = document.activeElement;

    if (!isTextAreaElement(focusedTextarea)) return;

    const handleInput = async (e: Event) => {
      if (!isTextAreaElement(e.target)) return;
      console.log("abc");
      setTextAreaContent(e.target.value);
      const md = await marked.parse(e.target.value);
      setTextAreaContent(DOMPurify.sanitize(md));
    };

    focusedTextarea.addEventListener("input", handleInput);
    return () => {
      focusedTextarea.removeEventListener("input", handleInput);
    };
  }, [isFocused]);

  useEffect(() => {
    const handleFocus = async (e: Event) => {
      if (!isTextAreaElement(e.target)) return;

      const focusedTextarea = e.target;
      const md = await marked.parse(focusedTextarea.value);
      setTextAreaContent(DOMPurify.sanitize(md));

      const fileAttachments = document.querySelectorAll("file-attachment");

      let targetFileAttachment: Element | undefined;

      for (let i = 0; i < fileAttachments.length; i++) {
        const fa = fileAttachments[i];

        if (fa === undefined) return;

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
    <div>
      <div
        ref={injectedRef}
        className={cn(
          "side-preview",
          "z-50 absolute bg-slate-950 top-0 p-4 rounded-sm text-white w-[400px] opacity-0 transition-all duration-300 ",
          isFocused && "opacity-80 backdrop-blur-sm "
        )}
      >
        {textAreaContent !== "" ? (
          <div
            className="markdown-body"
            dangerouslySetInnerHTML={{
              __html: textAreaContent,
            }}
          />
        ) : (
          <div className="text-gray-300">Nothing to preview</div>
        )}
      </div>
    </div>
  );
};

ReactDOM.createRoot(getRoot()).render(
  <React.StrictMode>
    <link rel="stylesheet" href="github-markdown.css"></link>
    <App />
  </React.StrictMode>
);
