'use client'

import { useState } from 'react'
import { Layout } from "@/components/layout/Layout"
import { SystemSettings } from "@/components/settings/SystemSettings"
import { FieldManagement } from "@/components/settings/FieldManagement"
import { StatusManagement } from "@/components/settings/StatusManagement"
import { DisplaySettings } from "@/components/settings/DisplaySettings"
import { DashboardEditor } from "@/components/settings/DashboardEditor"
import { DashboardCardManager } from "@/components/settings/DashboardCardManager"
import { RoleManagement } from "@/components/settings/RoleManagement"
import { EvaluationManagement } from "@/components/settings/EvaluationManagement"
import { RoleGuard } from "@/components/auth/RoleGuard"

export default function SettingsPage() {
  const [currentSection, setCurrentSection] = useState('overview')

  const handleNavigate = (section: string) => {
    setCurrentSection(section)
  }

  const handleBack = () => {
    setCurrentSection('overview')
  }

  const renderContent = () => {
    switch (currentSection) {
      case 'fields':
        return <FieldManagement onBack={handleBack} />
      case 'status':
        return <StatusManagement onBack={handleBack} />
      case 'display':
        return <DisplaySettings onBack={handleBack} />
      case 'dashboard':
        return <DashboardEditor onNavigate={handleNavigate} onBack={handleBack} />
      case 'dashboard_cards':
        return <DashboardCardManager onBack={handleBack} />
      case 'roles':
        return <RoleManagement onBack={handleBack} />
      case 'evaluation':
        return <EvaluationManagement onBack={handleBack} />
      default:
        return <SystemSettings onNavigate={handleNavigate} />
    }
  }

  return (
    <Layout>
      <RoleGuard allowedRoles={['採用担当', '管理者']}>
        {renderContent()}
      </RoleGuard>
    </Layout>
  )
}
