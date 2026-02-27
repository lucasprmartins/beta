export function HeaderLogo({ iconOnly = false }: { iconOnly?: boolean }) {
  if (iconOnly) {
    return (
      <img
        alt="Beta"
        className="h-7"
        height={420}
        src="/icon-1.svg"
        width={390}
      />
    );
  }

  return (
    <img
      alt="Beta Template"
      className="h-7"
      height={420}
      src="/logo-1.svg"
      width={1398}
    />
  );
}
