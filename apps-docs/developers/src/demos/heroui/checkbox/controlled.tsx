// vx-bot/INFO: Adapted HeroUI demo (Apache-2.0); see README.md and LICENSE.
"use client";

import {Checkbox} from "@vezham/react-v3";
import {useState} from "react";

export function Controlled() {
  const [isSelected, setIsSelected] = useState(true);

  return (
    <div className="flex flex-col gap-3">
      <Checkbox id="email-notifications" isSelected={isSelected} onChange={setIsSelected}>
        <Checkbox.Content>
          <Checkbox.Control>
            <Checkbox.Indicator />
          </Checkbox.Control>
          Email notifications
        </Checkbox.Content>
      </Checkbox>
      <p className="text-sm text-muted">
        Status: <span className="font-medium">{isSelected ? "Enabled" : "Disabled"}</span>
      </p>
    </div>
  );
}
