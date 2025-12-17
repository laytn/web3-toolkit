# Web3 Developer Toolkit

React + Vite 기반의 웹3 개발자용 클라이언트 사이드 툴킷입니다. ETH 단위 변환, Hex/Bytes/Text 변환, EIP-55 체크섬 주소 검증을 하나의 정적 사이트에서 제공합니다. HashRouter를 사용해 GitHub Pages에서도 새로고침 404 없이 동작합니다.

## 주요 기능
- **ETH Unit Calculator**: wei/gwei/ether 간 실시간 동기화, 0x 입력 시 wei 해석 옵션, BigInt 안전 처리.
- **Hex / Bytes / Text Converter**: UTF-8 텍스트 ↔ hex 변환, 바이트 길이 표시, 공백/개행 제거 토글, 결과 복사.
- **Decimal / Hex Converter**: BigInt 기반 10진수 ↔ 16진수 변환, 공백 제거 토글, Copy 지원.
- **EVM Address Tools**: 주소 유효성 검사, EIP-55 체크섬 생성/복사, 체크섬 여부 안내.
- **Keccak256 Hash Tool**: Text 또는 hex bytes를 선택적으로 해석해 keccak256 해시 계산, 공백 제거 토글, Copy 지원.
- **Signature → Address Recovery**: digest(32바이트)와 signature로 서명자 주소 복구, 65-byte 서명 또는 r/s/(v|yParity) 입력 지원.
- **ABI Encode / Decode**: ABI JSON을 파싱해 함수별 입력 폼을 자동 생성, calldata 인코딩/디코딩 및 selector/길이 표시.
- **EIP-191 / EIP-712 Hash & Verify**: personal_sign(prefix) 해시, typed data 해시 생성 및 서명 검증.
- **배포 자동화**: GitHub Actions로 main 브랜치 푸시 시 Pages에 자동 배포.

## 로컬 실행
```bash
npm install
npm run dev
```
개발 서버는 기본적으로 `http://localhost:5173` 에서 동작하며 HashRouter 경로는 `/#/evm`, `/#/evm/units`, `/#/evm/convert`, `/#/evm/address`, `/#/evm/hash`, `/#/evm/recover`, `/#/evm/abi`, `/#/evm/sign` 입니다.

## 빌드
```bash
npm run build
```
`dist/` 디렉터리에 정적 파일이 생성됩니다. GitHub Pages 등에 올릴 때 `VITE_BASE_PATH` 환경변수를 repo 경로에 맞게 설정하세요 (예: `/web3-toolkit/`).

## 배포 (GitHub Pages)
1. repo 이름이 `web3-toolkit` 라면 기본 설정을 그대로 사용 가능합니다.
2. 다른 이름이라면 GitHub Actions `Build` 단계에서 `VITE_BASE_PATH` 값을 `/your-repo-name/`으로 변경하세요.
3. `main` 브랜치에 push 하면 `.github/workflows/deploy.yml` 가 빌드 후 Pages로 자동 배포합니다.

## 도구 사용 예시
- **ETH Unit Calculator**  
  - `1.5` ether 입력 → gwei/wei 필드가 자동 변환.  
  - `0x3b9aca00` 입력 후 “0x 입력을 정수 wei로 해석” 체크 → wei=1000000000, gwei=1, ether=0.000000001.
- **Hex / Bytes / Text Converter**  
  - Text에 `hello` 입력 → Hex `0x68656c6c6f`, Bytes `5`.  
  - Hex에 `0x48656c6c6f20576f726c64` 입력 → Text `Hello World`, Bytes `11`.
- **Decimal / Hex Converter**  
  - Decimal `1000` → Hex `0x3e8`  
  - Hex `0x1bc16d674ec80000` → Decimal `2000000000000000000` (2 ether in wei)
- **Keccak256 Hash Tool**  
  - Text 모드: `hello` → `0x...` keccak256  
  - Hex 모드: `0x68656c6c6f` → Text로 변환 없이 bytes 그대로 해시
- **Signature → Address Recovery**  
  - digest `0x...32 bytes...` + 65-byte signature → EIP-55 주소 복구  
  - 고급 모드: r/s 각각 32바이트 + v(27/28 또는 0/1) 또는 yParity(0/1) 입력
- **ABI Encode / Decode**  
  - ERC20 `transfer(address,uint256)` encode: to=`0xabc...`, amount=`1000000000000000000` → calldata/selector 자동 출력  
  - Decode 예: calldata `0xa9059cbb000000000000000000000000AbC...0000000000000000000000000000000000000000000000000000000000000032` → `{ "to": "0xAbC... (checksum)", "amount": "50" }`  
  - Tuple/array 예: 함수 `setData((address,uint256),uint256[])` 입력값을 JSON으로 `{"owner":"0xabc...","amount":"1"}` 와 `[1,2,3]` 형태로 전달
- **EIP-191 / EIP-712 Hash & Verify**  
  - EIP-191: Text 모드에서 `hello` 입력 → personal_sign digest 출력 (copy)  
  - EIP-712: 간단한 domain/types/message JSON 입력 후 digest 출력, signature 입력 시 주소 복구/expected 매칭 여부 표시
- **EVM Address Tools**  
  - 주소 입력 시 유효성 검사 후 체크섬 주소 출력, “already checksummed” 여부 표시, Copy 버튼 제공.

## 기술 스택
- React 19, TypeScript, Vite
- ethers v6 (단위 변환, hex/bytes 처리, EIP-55 체크섬)
- React Router (HashRouter), GitHub Actions Pages 배포

## 구조
- `src/lib/*`: 체인 공통 순수 계산/검증 로직
- `src/components/*`: 재사용 UI (입력, 에러 배너, Copy 버튼, 카드 등)
- `src/features/evm/*`: EVM 체인 툴 구현 (units/convert/address/hash/recover/abi)
- `src/registry/*`: 체인/툴 메타데이터 레지스트리, 라우팅/내비게이션에 사용

## 유의 사항
- 모든 계산은 브라우저 내에서만 수행되며 RPC/API 호출을 사용하지 않습니다.
- HashRouter 기반이므로 배포 후 경로는 `https://<user>.github.io/<repo>/#/evm/units` 형태입니다.

## 카테고리(Chain Family) 확장 방법
- 새 체인을 추가하려면 `src/registry/<chain>.ts` 파일을 만들고 `ChainFamily` 정의와 `ToolDefinition[]`를 추가하세요.
- `src/registry/index.ts`에서 `families`와 `tools` 배열에 추가만 하면 내비게이션/라우트가 자동 반영됩니다.
- 체인별 UI는 `src/features/<chain>/<tool>/*`에 배치하면 됩니다.
