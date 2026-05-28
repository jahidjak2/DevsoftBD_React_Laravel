// src/components/layout/PublicLayout.tsx
import { Outlet } from 'react-router-dom'
import { useHomepage } from '@/hooks/useHomepage'
import TopHeader from './TopHeader'
import MainHeader from './MainHeader'
import EnhancedFooter from './EnhancedFooter'
import PageLoader from '@/components/shared/PageLoader'

export default function PublicLayout() {
  const { data, isLoading } = useHomepage()
  if (isLoading) return <PageLoader />

  const settings = data?.settings

  return (
    <div className="min-h-screen flex flex-col">
      <TopHeader settings={settings} />
      <MainHeader settings={settings} />
      <main className="flex-1">
        <Outlet context={{ homepage: data }} />
      </main>
      <EnhancedFooter settings={settings} />
    </div>
  )
}