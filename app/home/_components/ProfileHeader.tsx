import Image from "next/image";
import type { HomeContent } from "../_content/content";
import { withBasePath } from "@/lib/paths";
import { InfoChip } from "./InfoChip";

export function ProfileHeader({ profile }: { profile: HomeContent["profile"] }) {
  return (
    <header className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
      <div className="mt-8 flex min-w-0 flex-1 flex-col items-start gap-2 sm:mt-12 sm:gap-3">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-2xl font-bold">{profile.name}</h1>
          <p className="text-display font-medium">{profile.title}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-start sm:gap-3">
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
     
      <div className="relative mt-[44px] hidden size-[132px] shrink-0 overflow-hidden rounded-3xl border border-cardBorder bg-surface sm:block">
        <Image
          src={withBasePath(profile.avatar)}
          alt={profile.name}
          width={132}
          height={132}
          className="absolute left-1/2 top-0 h-[138%] w-[138%] max-w-none -translate-x-1/2"
          priority
        />
      </div>
    </header>
  );
}
