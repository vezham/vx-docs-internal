// vx-bot/INFO: Adapted HeroUI demo (Apache-2.0); see README.md and LICENSE.
"use client";

import type {Key} from "@vezham/react-v3";

import {Description, ErrorMessage, Label, Tag, TagGroup} from "@vezham/react-v3";
import {useMemo, useState} from "react";

export function CustomStyles() {
  const [selected, setSelected] = useState<Iterable<Key>>(new Set());
  const isInvalid = useMemo(() => Array.from(selected).length === 0, [selected]);

  return (
    <TagGroup
      className="w-full max-w-xs gap-1.5"
      selectedKeys={selected}
      selectionMode="multiple"
      onSelectionChange={setSelected}
    >
      <Label>Topics</Label>
      <TagGroup.List>
        <Tag id="api">API</Tag>
        <Tag id="design">Design</Tag>
        <Tag id="docs">Docs</Tag>
      </TagGroup.List>
      <Description>Pick at least one topic</Description>
      <ErrorMessage className="font-medium text-danger">
        {!!isInvalid && <>Choose at least one topic</>}
      </ErrorMessage>
    </TagGroup>
  );
}
