import type { ElementType, ReactNode } from "react";

type Padding = "sm" | "md" | "lg" | "none";

interface SectionWrapperProps {
  children: ReactNode;
  /** Classes on the outer element — use for background color, border, etc. */
  className?: string;
  /** Classes on the inner max-width container */
  innerClassName?: string;
  /** Semantic element to render. Defaults to "section". */
  as?: ElementType;
  /**
   * Vertical padding preset applied to the outer element.
   * sm = py-12 | md = py-16 | lg = py-24 | none = no padding
   * Defaults to "lg".
   */
  padding?: Padding;
}

const PADDING: Record<Padding, string> = {
  sm: "py-12",
  md: "py-16",
  lg: "py-24",
  none: "",
};

export default function SectionWrapper({
  children,
  className = "",
  innerClassName = "",
  as: Tag = "section",
  padding = "lg",
}: SectionWrapperProps) {
  const outerClasses = [PADDING[padding], className].filter(Boolean).join(" ");
  const innerClasses = ["max-w-6xl mx-auto px-6", innerClassName]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag className={outerClasses}>
      <div className={innerClasses}>{children}</div>
    </Tag>
  );
}
