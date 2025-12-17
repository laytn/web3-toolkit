import type { ReactNode } from 'react'

export type ChainFamilyId = 'evm'

export interface ChainFamily {
  id: ChainFamilyId
  title: string
  description: string
  basePath: string
}

export interface ToolDefinition {
  id: string
  title: string
  description: string
  family: ChainFamilyId
  path: string
  element: ReactNode
  tags?: string[]
}
