interface SectionLabelProps {
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
  color?: "brand" | "black" | "silver";
}

export function SectionLabel({
  children,
  className = "",
  dark = false,
  color,
}: SectionLabelProps) {
  const getColorClass = () => {
    if (color === "black") return "text-bharati-black";
    if (color === "silver") return "text-bharati-silver";
    if (color === "brand") return dark ? "text-bharati-mint-light" : "text-bharati-mint-dark";
    return dark ? "text-bharati-mint-light" : "text-bharati-mint-dark";
  };

  return (
    <span
      className={`text-label ${getColorClass()} ${className}`}
    >
      {children}
    </span>
  );
}
