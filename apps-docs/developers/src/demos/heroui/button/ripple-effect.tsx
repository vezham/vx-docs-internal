// vx-bot/INFO: Adapted HeroUI demo (Apache-2.0); see README.md and LICENSE.
"use client";

import {Button} from "@vezham/react-v3";
import {Ripple} from "m3-ripple";

import "m3-ripple/ripple.css";

export function RippleEffect() {
  return (
    <Button variant="secondary">
      <Ripple />
      Click me
    </Button>
  );
}
