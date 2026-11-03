// Adapted documented HeroUI Pro example; see ../README.md.
"use client";

import {Kbd, Label} from "@vezham/react-v3";

import {ContextMenu} from "@vezham/react-pro-v3";

export function Default() {
  return (
    <ContextMenu>
      <ContextMenu.Trigger>
        <div className="border-border text-muted flex h-48 w-80 select-none items-center justify-center rounded-xl border border-dashed text-sm">
          Right-click here
        </div>
      </ContextMenu.Trigger>
      <ContextMenu.Popover>
        <ContextMenu.Menu>
          <ContextMenu.Item id="back" textValue="Back">
            <Label>Back</Label>
            <Kbd className="ms-auto" slot="keyboard" variant="light">
              <Kbd.Abbr keyValue="command" />
              <Kbd.Content>[</Kbd.Content>
            </Kbd>
          </ContextMenu.Item>
          <ContextMenu.Item isDisabled id="forward" textValue="Forward">
            <Label>Forward</Label>
            <Kbd className="ms-auto" slot="keyboard" variant="light">
              <Kbd.Abbr keyValue="command" />
              <Kbd.Content>]</Kbd.Content>
            </Kbd>
          </ContextMenu.Item>
          <ContextMenu.Item id="reload" textValue="Reload">
            <Label>Reload</Label>
            <Kbd className="ms-auto" slot="keyboard" variant="light">
              <Kbd.Abbr keyValue="command" />
              <Kbd.Content>R</Kbd.Content>
            </Kbd>
          </ContextMenu.Item>
          <ContextMenu.Separator />
          <ContextMenu.Item id="view-source" textValue="View Page Source">
            <Label>View Page Source</Label>
          </ContextMenu.Item>
          <ContextMenu.Item id="inspect" textValue="Inspect">
            <Label>Inspect</Label>
          </ContextMenu.Item>
        </ContextMenu.Menu>
      </ContextMenu.Popover>
    </ContextMenu>
  );
}
