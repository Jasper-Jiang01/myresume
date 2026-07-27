import Image from "next/image";
import { withBasePath } from "@/lib/paths";

type BulletItemProps = {
  label: string;
};

export function BulletItem({ label }: BulletItemProps) {
  return (
    <div className="flex items-center gap-2">
      <Image
        src={withBasePath("/images/list-dot.svg")}
        alt=""
        width={14}
        height={14}
        className="size-dot-md shrink-0"
      />
      <span className="text-body text-muted">{label}</span>
    </div>
  );
}
