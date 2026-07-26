import { InfoChip } from "./shared/InfoChip";
import { profile } from "@/lib/content";
import { withBasePath } from "@/lib/paths";

export function ProfileHeader() {
  return (
    <header className="flex flex-col items-start gap-2 sm:gap-3">
      <div className="relative size-avatar sm:size-avatar-sm">
        <div className="absolute inset-0 z-0 overflow-hidden rounded-full bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={withBasePath(profile.avatar)}
            alt={profile.name}
            width={112}
            height={112}
            className="size-full object-cover"
          />
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={withBasePath("/images/avatar-ring.svg")}
          alt=""
          width={112}
          height={112}
          className="pointer-events-none absolute -inset-px z-10 size-[calc(100%+0.125rem)]"
        />
      </div>

      <div className="flex flex-col gap-0.5">
        {/* 关键姓名：小屏 title，sm 升一档 display */}
        <h1 className="text-body font-bold sm:text-display">{profile.name}</h1>
        <p className="text-body font-medium sm:text-title">{profile.title}</p>
      </div>

      <div className="-mt-0.5 flex flex-wrap items-center gap-2 sm:gap-3">
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
    </header>
  );
}
