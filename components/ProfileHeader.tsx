import { InfoChip } from "./shared/InfoChip";
import { profile } from "@/lib/content";
import { withBasePath } from "@/lib/paths";

export function ProfileHeader() {
  return (
    <header className="flex flex-row items-start justify-between gap-3 sm:gap-3">
      <div className="mt-12 flex min-w-0 flex-1 flex-col items-start gap-2 sm:gap-3">
        {/* 姓名和标题 */}
        <div className="flex flex-col gap-0.5">
          <h1 className="text-2xl font-bold">{profile.name}</h1>
          <p className="text-display font-medium">{profile.title}</p>
        </div>
        {/* 标签 */}
        <div className=" flex flex-wrap items-center gap-2 sm:gap-3">
          {profile.chips.map((chip) => (
            <InfoChip
              key={chip.label}
              icon={chip.icon}
              iconSize={chip.iconSize}
              label={chip.label}
              labelClassName="text-body"
            />
          ))}
        </div>
      </div>

      <div className="relative mt-10 size-[120px] shrink-0">
        <div className="absolute inset-0 z-0 overflow-hidden rounded-full bg-white">
          {/* 头像 */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={withBasePath(profile.avatar)}
            alt={profile.name}
            width={120}
            height={120}
            className="size-full object-cover"
          />
        </div>
        {/* 头像框 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={withBasePath("/images/avatar-ring.svg")}
          alt=""
          width={120}
          height={120}
          className="pointer-events-none absolute inset-0 z-10 size-full"
        />
      </div>
    </header>
  );
}
