import React from "react";
import i18n from "./i18n";

const textProps = new Set(["placeholder", "title", "aria-label", "alt"]);
const translate = (value: unknown): unknown => {
  if (typeof value === "string") return i18n.exists(value) ? i18n.t(value) : value;
  if (Array.isArray(value)) return value.map(translate);
  return value;
};
function localizedProps(props: Record<string, unknown> | null) {
  if (!props) return props;
  const next = {...props};
  if ("children" in next) next.children = translate(next.children);
  for (const name of textProps) if (name in next) next[name] = translate(next[name]);
  return next;
}
export const Fragment = React.Fragment;
export function jsx(type: React.ElementType, props: Record<string, unknown> | null, key?: React.Key) {
  return React.createElement(type, key == null ? localizedProps(props) : {...localizedProps(props),key});
}
export const jsxs = jsx;
export const jsxDEV = jsx;
