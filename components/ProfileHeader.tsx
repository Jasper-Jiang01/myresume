import Image from "next/image";
import { InfoChip } from "./shared/InfoChip";
import { profile } from "@/lib/content";

export function ProfileHeader() {
  return (
    <header className="flex flex-col items-start gap-2 sm:gap-3">
      <div className="relative size-avatar sm:size-avatar-sm">
        <div className="absolute inset-0 z-0 overflow-hidden rounded-full bg-white">
          <Image
            src={profile.avatar}
            alt={profile.name}
            width={112}
            height={112}
            priority
            className="size-full object-cover"
          />
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/avatar-ring.svg"
          alt=""
          width={112}
          height={112}
          className="pointer-events-none absolute -inset-px z-10 size-[calc(100%+0.125rem)]"
        />
      </div>

      <div className="flex flex-col gap-0.5">
        {/* name：text-base font-medium */}
        <h1 className="text-[20px] font-bold ">
          {profile.name}
        </h1>
        {/* job：固定字号，不做断点适配 */}
        <p className="text-[18px] font-medium ">
          {profile.title}
        </p>
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
