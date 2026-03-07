// FILE: src/app/dashboard/settings/page.tsx
import { getDefaultWorkspace } from '@/lib/db/queries'
import SettingsClient from '@/components/settings/SettingsClient'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const workspace = await getDefaultWorkspace()
  return <SettingsClient workspace={workspace ? {
    ...workspace,
    createdAt: workspace.createdAt.toISOString(),
    updatedAt: workspace.updatedAt.toISOString(),
  } : null} />
}