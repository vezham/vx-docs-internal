// vx-bot/INFO: Adapted HeroUI demo (Apache-2.0); see README.md and LICENSE.
import {Button, Drawer} from "@vezham/react-v3";

export function CustomStyles() {
  return (
    <Drawer>
      <Button variant="secondary">Open filters</Button>
      <Drawer.Backdrop variant="blur">
        <Drawer.Content placement="right">
          <Drawer.Dialog className="border-l border-border/80 bg-surface">
            <Drawer.Header>
              <Drawer.Heading className="text-foreground">Filters</Drawer.Heading>
            </Drawer.Header>
            <Drawer.Body>
              <p className="text-sm text-muted">Narrow results by status, owner, or date.</p>
            </Drawer.Body>
            <Drawer.Footer>
              <Button slot="close" variant="secondary">
                Cancel
              </Button>
              <Button slot="close">Apply</Button>
            </Drawer.Footer>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
}
