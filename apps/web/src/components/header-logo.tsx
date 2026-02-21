import { CubeIcon } from "@phosphor-icons/react";

export function HeaderLogo({ iconOnly = false }: { iconOnly?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <CubeIcon className="h-6 w-6 text-base-content" weight="fill" />
      {!iconOnly && (
        <span className="font-bold text-base-content text-lg">Beta</span>
      )}
    </div>
  );
}
