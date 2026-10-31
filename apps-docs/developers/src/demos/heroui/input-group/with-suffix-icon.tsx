// vx-bot/INFO: Adapted HeroUI demo (Apache-2.0); see README.md and LICENSE.
"use client";

import {Envelope} from "@gravity-ui/icons";
import {Description, InputGroup, Label, TextField} from "@vezham/react-v3";

export function WithSuffixIcon() {
  return (
    <TextField className="w-full max-w-[280px]" name="email">
      <Label>Email address</Label>
      <InputGroup>
        <InputGroup.Input className="w-full max-w-[280px]" placeholder="name@email.com" />
        <InputGroup.Suffix>
          <Envelope className="size-4 text-muted" />
        </InputGroup.Suffix>
      </InputGroup>
      <Description>We don't send spam</Description>
    </TextField>
  );
}
