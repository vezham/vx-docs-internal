// vx-bot/INFO: Adapted HeroUI demo (Apache-2.0); see README.md and LICENSE.
"use client";

import type {Color} from "@vezham/react-v3";

import {ColorField, ColorSwatch, Description, Label, parseColor} from "@vezham/react-v3";
import {useState} from "react";

export function CustomStyles() {
  const [color, setColor] = useState<Color | null>(parseColor("#6366F1"));

  return (
    <ColorField
      className="w-full max-w-xs gap-1.5"
      name="accent-color"
      value={color}
      onChange={setColor}
    >
      <Label className="font-medium text-foreground">Accent color</Label>
      <Description>Applied to buttons, links, and focus rings.</Description>
      <ColorField.Group
        className="rounded-xl bg-default shadow-none focus-within:ring-2 focus-within:ring-accent/15"
        variant="secondary"
      >
        <ColorField.Prefix>
          <ColorSwatch className="rounded-md" color={color ?? undefined} size="xs" />
        </ColorField.Prefix>
        <ColorField.Input className="font-mono text-sm text-foreground placeholder:text-muted" />
      </ColorField.Group>
    </ColorField>
  );
}
