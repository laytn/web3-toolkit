import AbiPage from '../features/evm/abi/AbiPage'
import AddressPage from '../features/evm/address/AddressPage'
import ConverterPage from '../features/evm/convert/ConverterPage'
import HashPage from '../features/evm/hash/HashPage'
import SignPage from '../features/evm/sign/SignPage'
import RecoverPage from '../features/evm/recover/RecoverPage'
import UnitsPage from '../features/evm/units/UnitsPage'
import type { ChainFamily, ToolDefinition } from './types'

export const evmFamily: ChainFamily = {
  id: 'evm',
  title: 'EVM',
  description: 'Ethereum & EVM-compatible tools',
  basePath: '/evm',
}

export const evmTools: ToolDefinition[] = [
  {
    id: 'evm-units',
    title: 'ETH Unit Calculator',
    description: 'wei, gwei, ether 간 변환을 BigInt 기반으로 안전하게 처리합니다.',
    family: 'evm',
    path: '/evm/units',
    element: <UnitsPage />,
  },
  {
    id: 'evm-convert',
    title: 'Hex / Bytes / Text Converter',
    description: '텍스트, hex, 바이트 길이를 상호 변환하고 decimal/hex 변환을 지원합니다.',
    family: 'evm',
    path: '/evm/convert',
    element: <ConverterPage />,
  },
  {
    id: 'evm-address',
    title: 'EVM Address Tools',
    description: 'EIP-55 체크섬과 주소 유효성을 검증합니다.',
    family: 'evm',
    path: '/evm/address',
    element: <AddressPage />,
  },
  {
    id: 'evm-hash',
    title: 'Keccak256 Hash Tool',
    description: 'Text 또는 hex bytes를 keccak256으로 해시합니다.',
    family: 'evm',
    path: '/evm/hash',
    element: <HashPage />,
  },
  {
    id: 'evm-recover',
    title: 'Signature → Address Recovery',
    description: 'digest와 signature로 서명자 주소를 복구합니다.',
    family: 'evm',
    path: '/evm/recover',
    element: <RecoverPage />,
  },
  {
    id: 'evm-abi',
    title: 'ABI Encode / Decode',
    description: 'ABI JSON 기반으로 calldata 인코딩/디코딩을 수행합니다.',
    family: 'evm',
    path: '/evm/abi',
    element: <AbiPage />,
  },
  {
    id: 'evm-sign',
    title: 'EIP-191 / EIP-712 Hash & Verify',
    description: 'personal_sign 및 typed data 해시 생성과 서명 검증',
    family: 'evm',
    path: '/evm/sign',
    element: <SignPage />,
  },
]
