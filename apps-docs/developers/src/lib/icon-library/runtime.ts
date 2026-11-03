export const iconCdnUrl =
  'https://cdn.jsdelivr.net/npm/@vezham/icons@1.0.7/dist/cdn/vezham-icons.js'

type Runtime = {
  icons: string[]
  categories: string[]
  ready: Promise<unknown>
  preload: (names: string[]) => void
}
declare global {
  interface Window {
    VezhamIcons?: Runtime
  }
}
let pending: Promise<Runtime> | undefined

export const loadIconRuntime = (): Promise<Runtime> => {
  if (window.VezhamIcons)
    return window.VezhamIcons.ready.then(() => window.VezhamIcons as Runtime)
  if (pending) return pending
  pending = new Promise<Runtime>((resolve, reject) => {
    const script = document.createElement('script')
    script.id = 'vezham-icon-runtime'
    script.src = iconCdnUrl
    script.defer = true
    const timeout = window.setTimeout(() => fail(), 30_000)
    const fail = () => {
      clearTimeout(timeout)
      script.remove()
      pending = undefined
      reject(
        new Error(
          'The icon renderer could not load. Check your connection and try again.'
        )
      )
    }
    script.onerror = fail
    script.onload = () => {
      clearTimeout(timeout)
      const runtime = window.VezhamIcons
      if (!runtime) {
        fail()
        return
      }
      void runtime.ready.then(() => resolve(runtime), fail)
    }
    document.head.append(script)
  })
  return pending
}

export const getIconSvg = async (
  name: string,
  weight: string,
  size: number,
  color: string,
  secondaryColor: string
) => {
  await loadIconRuntime()
  const element = document.createElement('vx-icon')
  element.setAttribute('icon', name)
  element.setAttribute('weight', weight)
  element.setAttribute('size', String(size))
  element.setAttribute('decorative', '')
  element.style.position = 'fixed'
  element.style.visibility = 'hidden'
  document.body.append(element)
  try {
    const svg = element.shadowRoot?.querySelector('svg')?.cloneNode(true) as
      SVGSVGElement | undefined
    if (!svg) throw new Error('This icon could not be exported.')
    svg.setAttribute('width', String(size))
    svg.setAttribute('height', String(size))
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    return svg.outerHTML
      .replace(/var\(--vx-icon-primary(?:,[^)]*)?\)/g, color)
      .replace(/var\(--vx-icon-secondary(?:,[^)]*)?\)/g, secondaryColor)
      .replace(/currentColor/g, color)
  } finally {
    element.remove()
  }
}

const saveBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export const downloadIcon = async (
  svg: string,
  filename: string,
  format: 'svg' | 'png' | 'webp',
  size: number
) => {
  const blob = new Blob([svg], { type: 'image/svg+xml' })
  if (format === 'svg') {
    saveBlob(blob, `${filename}.svg`)
    return
  }
  const url = URL.createObjectURL(blob)
  try {
    const image = new Image()
    image.src = url
    await image.decode()
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const context = canvas.getContext('2d')
    if (!context)
      throw new Error('Image export is unavailable in this browser.')
    context.drawImage(image, 0, 0, size, size)
    const output = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        value =>
          value ? resolve(value) : reject(new Error('Image export failed.')),
        `image/${format}`
      )
    )
    saveBlob(output, `${filename}.${format}`)
  } finally {
    URL.revokeObjectURL(url)
  }
}
