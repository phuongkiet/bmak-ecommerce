import { useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { useStore } from '@/store'
import PageSectionsRenderer from '@/components/PageSectionsRenderer'

const Showcase = observer(() => {
  const { pageStore } = useStore()

  useEffect(() => {
    pageStore.getPageBySlugFromApi('showcase')
  }, [pageStore])

  const showcasePage = pageStore.selectedPage?.slug === 'showcase' ? pageStore.selectedPage : undefined

  const fallback = (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Phối cảnh</h1>
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
        <p>Trang phối cảnh đang được phát triển...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen">
      <PageSectionsRenderer sections={showcasePage?.sections} fallback={fallback} />
    </div>
  )
})

export default Showcase





