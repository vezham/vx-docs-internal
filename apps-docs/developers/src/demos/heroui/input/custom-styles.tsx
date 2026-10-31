// vx-bot/INFO: Adapted HeroUI demo (Apache-2.0); see README.md and LICENSE.
import {Input} from "@vezham/react-v3";

export function CustomStyles() {
  return (
    <Input
      aria-label="Search projects"
      className="w-64 rounded-xl border border-border/80 bg-default text-foreground placeholder:text-muted"
      placeholder="Search projects..."
    />
  );
}
