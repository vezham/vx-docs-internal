const requests = new Map<string, Promise<string>>()
const unavailable =
  'The original SVG could not load. Please try again or use Open SVG.'

export const fetchAssetSvg = (url: string): Promise<string> => {
  const cached = requests.get(url)
  if (cached) return cached
  const request = fetch(url, {
    mode: 'cors',
    credentials: 'omit',
    signal: AbortSignal.timeout(20_000)
  })
    .then(async response => {
      if (!response.ok) throw new Error(unavailable)
      const svg = await response.text()
      const document = new DOMParser().parseFromString(svg, 'image/svg+xml')
      if (
        document.documentElement.localName !== 'svg' ||
        document.querySelector('parsererror')
      )
        throw new Error('This file does not contain a valid SVG.')
      return svg
    })
    .catch((error: unknown) => {
      requests.delete(url)
      throw new Error(
        error instanceof TypeError ||
          !(error instanceof Error) ||
          error.name === 'TimeoutError'
          ? unavailable
          : error.message
      )
    })
  requests.set(url, request)
  return request
}

const saveBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export const downloadSvg = async (
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
    const scale = Math.min(
      size / image.naturalWidth,
      size / image.naturalHeight
    )
    const width = image.naturalWidth * scale
    const height = image.naturalHeight * scale
    context.drawImage(
      image,
      (size - width) / 2,
      (size - height) / 2,
      width,
      height
    )
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
