import { createFileRoute, notFound, redirect } from '@tanstack/react-router'

import { getDocsPackage } from '@config/packages'

export const Route = createFileRoute('/{-$lang}/docs/packages/$package/')({
  beforeLoad: ({ params }) => {
    const packageId = getDocsPackage(params.package)
    if (!packageId) throw notFound()
    throw redirect({
      to: '/{-$lang}/docs/packages/$package/$',
      params: {
        lang: params.lang,
        package: packageId,
        _splat: 'getting-started'
      }
    })
  }
})
