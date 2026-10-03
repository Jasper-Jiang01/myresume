import type { ReactNode } from "react";
import Markdown from "react-markdown";
import type { Components } from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { withBasePath } from "@/lib/paths";

function dropHastNode<T extends { node?: unknown }>({ node, ...rest }: T) {
  void node;
  return rest;
}

const components: Components = {
  a: (props) => {
    const { href, children, ...rest } = dropHastNode(props);
    const external = typeof href === "string" && /^https?:/i.test(href);
    return (
      <a
        {...rest}
        href={href}
        {...(external
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
      >
        {children}
      </a>
    );
  },
  img: (props) => {
    const { src, alt } = dropHastNode(props);
    if (typeof src !== "string" || !src) return null;
    const resolved = src.startsWith("/blog/") ? withBasePath(src) : src;
    const caption = alt && alt.length <= 48 ? alt : undefined;
    return (
      <span
        className={
          src.includes("img-04")
            ? "blog-markdown-figure is-compact"
            : "blog-markdown-figure"
        }
      >
        <img src={resolved} alt={alt ?? ""} />
        {caption ? (
          <span className="blog-markdown-caption">{caption}</span>
        ) : null}
      </span>
    );
  },
  table: (props) => {
    const { children, ...rest } = dropHastNode(props);
    return (
      <div className="blog-markdown-table">
        <table {...rest}>{children as ReactNode}</table>
      </div>
    );
  },
};

export function MarkdownBody({ source }: { source: string }) {
  return (
    <div className="blog-markdown">
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        disallowedElements={["script", "iframe", "object", "embed", "style"]}
        components={components}
      >
        {source}
      </Markdown>
    </div>
  );
}
