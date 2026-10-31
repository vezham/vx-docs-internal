// vx-bot/INFO: Adapted HeroUI demo (Apache-2.0); see README.md and LICENSE.
import {Surface} from "@vezham/react-v3";

export function CustomStyles() {
  return (
    <Surface
      className="w-full max-w-sm rounded-xl border border-accent/15 bg-linear-to-br from-accent/8 via-surface to-surface-secondary p-4"
      variant="default"
    >
      <h3 className="text-sm font-semibold text-foreground">Billing overview</h3>
      <p className="text-sm text-muted">View invoices and payment methods in one place.</p>
    </Surface>
  );
}
