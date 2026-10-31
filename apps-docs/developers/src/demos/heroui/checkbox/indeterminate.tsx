// vx-bot/INFO: Adapted HeroUI demo (Apache-2.0); see README.md and LICENSE.
"use client";

import {Checkbox, Description} from "@vezham/react-v3";
import {useState} from "react";

export function Indeterminate() {
  const [isIndeterminate, setIsIndeterminate] = useState(true);
  const [isSelected, setIsSelected] = useState(false);

  return (
    <Checkbox
      id="select-all"
      isIndeterminate={isIndeterminate}
      isSelected={isSelected}
      onChange={(selected: boolean) => {
        setIsSelected(selected);
        setIsIndeterminate(false);
      }}
    >
      <Checkbox.Content>
        <Checkbox.Control>
          <Checkbox.Indicator />
        </Checkbox.Control>
        Select all
      </Checkbox.Content>
      <Description>Shows indeterminate state (dash icon)</Description>
    </Checkbox>
  );
}
