import { useEffect } from "react";

type PageMeta = {
  title: string;
  description?: string;
  canonical?: string;
};

const BASE_TITLE = "Methodical";
const DEFAULT_DESCRIPTION =
  "Methodical ayuda a empresas a ordenar, automatizar y escalar su operación con tecnología clara y bien aplicada.";

const setMeta = (selector: string, attribute: string, value: string) => {
  let tag = document.head.querySelector<HTMLMetaElement>(selector);
  if (!tag) {
    tag = document.createElement("meta");
    const [attr, attrValue] = selector.replace(/[[\]"]/g, "").split("=");
    tag.setAttribute(attr, attrValue);
    document.head.appendChild(tag);
  }
  tag.setAttribute(attribute, value);
};

const setLink = (rel: string, href: string) => {
  let tag = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", rel);
    document.head.appendChild(tag);
  }
  tag.setAttribute("href", href);
};

export const usePageMeta = ({ title, description, canonical }: PageMeta) => {
  useEffect(() => {
    document.title = `${title} · ${BASE_TITLE}`;
    const desc = description ?? DEFAULT_DESCRIPTION;
    setMeta('meta[name="description"]', "content", desc);
    setMeta('meta[property="og:title"]', "content", document.title);
    setMeta('meta[property="og:description"]', "content", desc);
    if (canonical) setLink("canonical", canonical);
  }, [title, description, canonical]);
};
