// vx-bot/INFO: Adapted HeroUI demo (Apache-2.0); see README.md and LICENSE.
import {Input, Surface} from "@vezham/react-v3";

export function OnSurface() {
  return (
    <Surface className="flex h-[180px] w-[280px] items-center justify-center rounded-3xl bg-surface p-4">
      <Input className="w-full" placeholder="Your name" variant="secondary" />
    </Surface>
  );
}
