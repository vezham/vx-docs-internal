// vx-bot/INFO: Adapted HeroUI demo (Apache-2.0); see README.md and LICENSE.
"use client";

import {Button, Disclosure, DisclosureGroup, Separator} from "@vezham/react-v3";

export function CustomStyles() {
  return (
    <DisclosureGroup className="w-full max-w-sm rounded-xl bg-default-soft p-2">
      <Disclosure id="billing">
        <Disclosure.Heading>
          <Button className="w-full justify-between" slot="trigger" variant="ghost">
            Billing
            <Disclosure.Indicator className="text-muted" />
          </Button>
        </Disclosure.Heading>
        <Disclosure.Content>
          <Disclosure.Body className="text-sm text-muted">
            Invoices are issued on the first of each month.
          </Disclosure.Body>
        </Disclosure.Content>
      </Disclosure>
      <Separator className="my-1" />
      <Disclosure id="support">
        <Disclosure.Heading>
          <Button className="w-full justify-between" slot="trigger" variant="ghost">
            Support
            <Disclosure.Indicator className="text-muted" />
          </Button>
        </Disclosure.Heading>
        <Disclosure.Content>
          <Disclosure.Body className="text-sm text-muted">
            Reach us at help@heroui.com. Typical response time is under one business day.
          </Disclosure.Body>
        </Disclosure.Content>
      </Disclosure>
    </DisclosureGroup>
  );
}
