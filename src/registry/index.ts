import { evmFamily, evmTools } from './evm'
import type { ChainFamily, ToolDefinition } from './types'

export const families: ChainFamily[] = [evmFamily]

export const tools: ToolDefinition[] = [...evmTools]

export function toolsByFamily(familyId: ChainFamily['id']): ToolDefinition[] {
  return tools.filter((tool) => tool.family === familyId)
}
