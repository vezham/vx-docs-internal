import { useState } from 'react'

import { AltArrowDown } from '@vezham/icons-react'
import { Popover, Separator } from '@vezham/react-v3'

import { versionSelectorVariants } from '@components/docs/navigation.variants'

const styles = versionSelectorVariants()

export const LibrarySelector = () => {
  const [open, setOpen] = useState(false)

  return (
    <Popover isOpen={open} onOpenChange={setOpen}>
      <Popover.Trigger className={styles.trigger()}>
        <span className={styles.label()}>HeroUI v3</span>
        <span className="text-muted text-xs">OSS</span>
        <AltArrowDown size={12} className={styles.chevron({ open })} />
      </Popover.Trigger>
      <Popover.Content className={styles.popover()} placement="bottom start">
        <Popover.Dialog className={styles.content()}>
          <div className={styles.list()}>
            <div
              aria-current="page"
              className={styles.item({ selected: true })}>
              <span>HeroUI v3</span>
              <span className={styles.version({ selected: true })}>OSS</span>
            </div>
            <div className={styles.separator()}>
              <Separator />
            </div>
            <div aria-disabled="true" className={styles.item()}>
              <span>Vezham React</span>
              <span className={styles.version()}>Coming soon</span>
            </div>
          </div>
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  )
}
