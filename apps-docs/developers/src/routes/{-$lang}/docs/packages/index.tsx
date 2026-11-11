import { createFileRoute, redirect } from '@tanstack/react-router'

import { defaultDocsPackage } from '@config/packages'

export const Route = createFileRoute('/{-$lang}/docs/packages/')({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/{-$lang}/docs/packages/$package/$',
      params: {
        lang: params.lang,
        package: defaultDocsPackage,
        _splat: 'getting-started'
      }
    })
  }
})
