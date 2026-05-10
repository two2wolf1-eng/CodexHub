# CodexHub 深度分析报告

**日期**: 2026-05-10  
**分析范围**: 架构、治理、安全、工作流、测试基础设施、开发现状、M50→M77 里程碑演进  
**项目定位**: 治理优先（Governance-First）的 AI 辅助 DevOps 编排平台  
**当前阶段**: M77 — Codex Desktop CDP Structure Map（已进入受控真实自动化阶段）

---

## 一、执行摘要

CodexHub 是一个在本地开发环境与 AI 工具执行（主要面向 Anthropic Claude Code CLI）之间插入受控、可审计、策略驱动的自动化管道的平台。它采用 Nx monorepo + pnpm + TypeScript strict mode 构建，包含 5 个应用和约 40 个包，按 kernel（业务逻辑）、adapter（外部边界）、app（入口薄层）三层架构组织。

**核心设计原则**: 元数据优先（metadata-only）、哈希锚定（hash-anchored）、策略先行（policy-first）、无真实写入（no-real-write）——在任何治理关卡通过之前，系统不执行任何真实的外部操作。

**当前状态**: M77 (2026-05-10)。项目已从 Round 4H.16 的 input-governance 阻塞中突破，经历了 M50-M53 的 Supervisor 控制平面建设、M62-M71 的业务配额与管理员自动化、M72-M75 的真实客户端生产能力建设，以及 M76-M77 的受控真实自动化阶段。M76 是首个显式允许受控真实写入的校准阶段。M77 在此基础上实现了基于真实 loopback HTTP + WebSocket CDP 连接的 Codex Desktop 结构映射。所有安全边界持续保持：无原始 DOM、无凭据、无网络体、无任意 JS、无通用 CDP 透传。

---

## 二、架构与技术栈

### 2.1 技术选型

| 层面 | 技术 |
|------|------|
| 语言 | TypeScript 5.7, strict mode, ES2022 |
| 包管理 | pnpm 9.15 (workspace) |
| 构建编排 | Nx 20.3 (target caching, dependency graph) |
| 运行时验证 | Zod 3.24 (贯穿所有包) |
| CLI | Commander 12 |
| HTTP 服务 | Fastify 5 (Supervisor :3333, Orchestrator :3334) |
| 前端 | React 19 + Vite 6 (Dashboard :4200) |
| MCP | @modelcontextprotocol/sdk (stdio + HTTP :3335) |
| 存储 | SQLite (仅 store-sqlite 包可引用) |
| 测试 | Vitest 2.1 |

### 2.2 分层架构

```
apps/  ← 薄入口层，不含业务逻辑
  ├── cli/          Commander CLI (20,756 行)
  ├── supervisor/   Fastify API 网关 (:3333, ~1.3MB)
  ├── orchestrator/ Fastify 编排服务 (:3334, 361 行)
  ├── dashboard/    React SPA (467KB App.tsx)
  └── codexhub-mcp-server/  MCP Server (stdio/HTTP)

packages/  ← 所有业务逻辑
  ├── contracts/        共享 Zod Schema (~23,500 行) — 唯一真相源
  ├── *-kernel/         业务逻辑内核 (~25 个)
  ├── *-adapter/        外部系统适配器 (~10 个)
  └── store-*/          持久化层

tools/  ← 审计与质量门禁脚本 (~5 个)
```

所有 `@codexhub/*` 引用通过 `tsconfig.base.json` 的 path aliases 配置，adapter 只能通过 kernel 消耗，禁止深层路径导入。

### 2.3 Contracts 包（基础契约层）

`packages/contracts/src/index.ts` 是约 23,500 行的单一真相源，定义了：

- **基础实体 schema**: `entityBaseSchema` (id, schemaVersion, metadata), `createdEntityBaseSchema`, `observedEntityBaseSchema`
- **核心枚举**: `RiskLevel` (low/medium/high/critical), `ActionMode` (read/dry-run/write/admin), `CapabilityKind` (codex/mcp/verification/browser/electron/policy/telemetry/filesystem/git)
- **领域类型**: `DevelopmentRequest`, `OrchestrationPlan`, `PolicyDecision`, `TaskGraph`, `AgentRun`, `VerificationRun`, `EvidenceRef`, `AuditEvent`, `WorkflowDefinition`, `WorkflowRun`, `CodexTaskIntent`, `CodexTaskRun`, `Lease`, `QuotaSnapshot` 等
- **约 200 种 Evidence Kind**: `codex.exec.dry_run_plan`, `browser.observation_summary`, `github.draft_pr_summary` 等
- **规范 Schema 版本**: `'2026-04-28.foundation'`

### 2.4 Kernel 与 Adapter 的区别

- **Kernel**: 纯业务逻辑、策略规则、治理编排。不调用 spawn/fetch/fs 等外部资源。所有结果为元数据封装（hash-only）
- **Adapter**: 封装外部系统（GitHub API, Codex CLI, Nx, 浏览器, Electron, OpenTelemetry）。永远由 kernel 通过接口消费，实际执行标记为 `liveExecution: false` 直到明确批准
- **边界文件（boundary file）**: 每个外部资源类型（进程、文件系统、HTTP、CDP 等）有且仅有一个特许边界文件，其余代码严禁直接使用对应 API

---

## 三、治理与安全模型

### 3.1 风险等级与沙箱模式

| 风险等级 | 触发条件 | 沙箱映射 |
|----------|----------|----------|
| `critical` | danger_full_access, workspace.invite, electron.main.inspector | danger_full_access → critical |
| `high` | workspace_write, browser.click, browser.input | workspace_write → high |
| `medium` | write/patch/delete 动作 | read_only → medium |
| `low` | 只读、健康检查等 | — |

三种沙箱模式的强制执行机制：

- **read_only**: 中等风险。标准策略评估，无需隔离工作树。批准门槛基于风险等级
- **workspace_write**: 高风险。执行门（execution gate）强制要求 `isolatedWorktreePresent === true`，否则拒绝
- **danger_full_access**: 严重风险。执行门默认阻止，原因：`"danger_full_access is blocked by default"`。代码中没有绕过机制

### 3.2 策略引擎（Policy Engine）

位于 `packages/security-kernel/src/index.ts`（319 行），精心保持小巧。

核心入口 `evaluateAction()` 根据 actionType 分派到四个子评估器：

1. **`codex.exec.live.intent`** → `evaluateCodexLiveIntent()`: 要求 dry-run plan 存在、live adapter 启用、无禁词匹配。批准模式或高风险时强制审批
2. **`codex.exec.execution.gate`** → `evaluateCodexExecutionGate()`: 最终执行前的六重检查：live adapter 启用、dry-run plan hash 匹配、策略 decision hash 匹配、批准未过期、未撤销、未使用。workspace_write 额外要求隔离工作树
3. **`codex.exec.manual.approval`** → `evaluateCodexManualApproval()`: 验证批准记录的状态机转换合法性
4. **通用回退路径**: 推断风险等级 → 检查 dry-run 误报 → 强制 write 的 dry-run 要求 → 批准门槛检查

**CodexHub 策略权威性**: 安全内核的判定始终为最终权威。外部策略后端（OPA/Cedar/fixture）仅为咨询（`backendAdvisoryOnly: true`, `authorityProvider: 'codexhub'`）

### 3.3 批准工作流

- **单次使用令牌（Single-Use Tokens）**: 批准工件携带 `singleUse: true`。状态机 `pending → approved → used`，使用后执行门拒绝
- **过期机制**: 工件有 `expiresAt` 时间戳。执行门和手动批准评估器均实时检查 `Date.parse(expiresAt) <= Date.now()`
- **撤销机制**: 仅 `approved` 状态可撤销。`revoked`, `denied`, `expired`, `used` 均为终态
- **批准类型**: codex, browser, electron_cdp, worktree, worktree_cleanup, m9_pilot, review_package, production_workflow_recovery

### 3.4 密钥治理（Secret Governance）

四类支持的密钥提供商：vault, sops, onepassword, doppler。

**关键原则**: 系统不管理实际密钥值，只管理密钥配置的 readiness 元数据。每个函数明确标志：
- `secretValueReadAllowed: false`, `secretValueStored: false`
- `tokenValueStored: false`, `rawConfigStored: false`
- `bodyStored: false`, `readinessOnly: true`
- 所有引用路径和批准理由均哈希化（SHA-256）
- 预演（rehearsal）支持三种场景：all-pass、leak-audit-failed、blocked

### 3.5 证据与审计追踪

**证据层（Evidence）**: `EvidenceRef` 捕获 id, kind, summary, hash（SHA-256）, expiresAt, redacted, labels, metadata

多层脱敏系统（multi-layer redaction）：
1. **敏感键脱敏**: 键名匹配 `/token|cookie|session|secret|password|mfa|authorization|credential|apikey|accesskey|refresh|privatekey/i` 的值替换为 `[redacted]`
2. **路径脱敏**: 路径类键的值替换为 `sha256:{hash}`，递归应用于数组和嵌套对象
3. **正文仅哈希**: 实际正文内容不进入 EvidenceRef，仅 SHA-256 参与哈希计算

**审计事件**: `CapabilityAuditEvent` 记录 actor, action, target, reason, outcome, policyDecisionId, evidenceRefs

### 3.6 观察者模式

`AllowlistedOsProcessObserver` 实现基于白名单的操作系统进程观察：
- 仅收集白名单内的进程
- 所有敏感数据哈希化：`processNameHash`, `processIdHash`, `executablePathHash`, `commandLineHash`
- 指标取整：cpuPercentRounded（1 位小数）、memoryBytesRounded（最近 1024 字节）、durationMs（截断整数）
- 显式标志：`rawPathStored: false`, `bodyStored: false`

### 3.7 治理投射（Governance Projection）

`governance-projection-kernel` 将 20+ 种来源的运行输入归一化为 9 类统一源（orchestrator/codex/browser/electron/worktree/github/policy/telemetry/verification），每个投射记录仅包含哈希化的 ID、标题、证据摘要和审计链。所有序列化输出经过对抗性泄漏检测。

---

## 四、核心开发工作流

### 4.1 完整流水线

```
DevelopmentRequest (开发请求)
  → PlanningResult (任务图 + 技能解析 + 策略决策)
  → OrchestrationPlan (编排计划)
  → PolicyDecision (策略判定: allow/deny/approval_required)
  → AgentRun (模拟执行)
  → VerificationRun (Nx 验证)
  → EvidenceRef + AuditEvent (证据 + 审计持久化)
```

### 4.2 关键编排模式

**Mock Orchestration** (`runMockDevelopmentOrchestration`):
- 创建请求 → 任务图 → 解析技能 → 编排计划 → 模拟运行 → 模拟验证 → 证据 → 审计 → 持久化
- 所有步骤标记为 `liveExecution: false`, `noRealWrite: true`

**Governed Orchestration** (`runGovernedDevelopmentOrchestration`):
- 产出 `GovernedDevelopmentOrchestrationResult`，含 handoff 状态
- Handoff 必要条件：dry-run ID, approval artifact ID, isolated worktree path, governed input content hash
- 全部满足 → `ready_for_control_plane`；否则 `blocked`

**Codex Task Dispatch Lifecycle** (`runCodexTaskDispatchLifecycle`):
- 完整生命周期：初始化 App Server → 创建/恢复 Thread → 启动 Turn → 摄入事件直至终态
- 预飞行检查（preflight）覆盖 9 个方面：account, client, quota, profile, thread, worktree, task, policy, approval

### 4.3 代码执行适配器

Codex-kernel 实现了 "Real Read-Only Adapter" 的完整治理生命周期：
- pilot source preparation → policy source tracing → approval authority trace
- simulated preflight → skeleton review → implementation plan review
- readiness review → fixture boundary → final readiness decision
- real adapter attempt（仍受治理约束，仍仅元数据）

所有适配器结果标记为 `noRealWrite: true`, `bodyStored: false`, `rawPathStored: false`

### 4.4 自定义工作流引擎

`workflow-kernel` 支持 `.codexhub/workflows/*.workflow.json` 自定义模板：
- 12 种步骤类型，各有预定义风险配置文件
- 93 个禁止键：prompt, rawPrompt, stdin, stdout, stderr, diff, rawDiff, body, command, branches, loop, while, forEach, policyOverride 等
- 需要子批准的步骤必须有匹配的子记录哈希
- 内置生产模板 ID：local-patch-review, local-rc-bundle, github-draft-pr-chain, rework-cleanup

---

## 五、测试与审计基础设施

### 5.1 verify:foundation 六层验证

```
scaffold:health → audit:boundaries → audit:sqlite-isolation → audit:no-live-automation → audit:skills → lint → test → build
```

**Layer 1 — scaffold:health** (1038 行)
- 验证恰好 56 个 Nx 项目
- 验证约 489 个治理文档文件
- 验证恰好 957 个 contract 导出

**Layer 2 — audit:boundaries** (163 行)
- 禁止 `@codexhub/package/subpath` 深层导入
- 检测跨项目边界的相对导入
- 使用 TypeScript compiler API 解析 import/export/dynamic-import

**Layer 3 — audit:sqlite-isolation** (106 行)
- 仅 `packages/store-sqlite` 可包含 SQLite 相关代码

**Layer 4 — audit:no-live-automation** (~3095 行) — 最庞大的审计工具
- 13 个边界白名单集合，强制精确文件计数
- 144+ 对抗性哨兵测试用例（内联合成，非磁盘文件）
- 93 个禁止的自定义工作流模板键
- 18+ 领域特定的禁止词列表
- 自我引用验证：`adversarialSentinelWouldViolate()` 对审计工具自身运行完整审计管线

**Layer 5 — audit:skills** (219 行)
- 验证 12 个必需技能（3 工作流 + 9 项目）
- 验证 AGENTS.md 引用和输出章节

**Layer 6 — lint → test → build**: 标准 Nx 多目标命令

### 5.2 对抗性审计（Adversarial Audit）

这是 CodexHub 最独特的设计——一个自我验证的元审计系统：

- 144+ 哨兵测试用例定义在 `sentinelCases` 数组中
- 每条哨兵包含伪造文件路径和内联合成源代码（含已知禁止模式）
- 每个哨兵通过完整审计管线运行，验证其被正确捕获
- 如任何哨兵逃脱检测，审计工具报告自身的违规
- 对抗性文件（如 `adversarial-github.ts`）不存在于磁盘——纯内存 TypeScript 源文件

### 5.3 对抗性公共输出固件（Adversarial Public Output Fixture）

位于 `test-fixtures/adversarial-public-output-fixture.ts`：
- 37 个对抗性公开输出词：原始 prompts, diffs, file contents, tokens, request/response bodies, policies, selectors, SQL, commands 等
- `findAdversarialPublicOutputLeaks()` 和 `findAdversarialPublicOutputRoundTripLeaks()` 验证敏感文本在 JSON 序列化往返后不存活
- 几乎所有内核测试文件均导入并使用此固件

### 5.4 禁止词系统

`audit-no-live-automation.ts` 维护 18+ 领域特定的禁止词列表：

- `executableTextTerms` — 可执行代码术语
- `cdpHttpBoundaryTerms` / `cdpForbiddenTransportTerms` / `cdpCommandPassthroughTerms` — Chrome DevTools Protocol
- `gitBoundaryTerms` / `githubHttpBoundaryTerms` / `githubForbiddenRemoteMutationTerms` — Git/GitHub
- `browserDirectActionTerms` — 浏览器直接操作
- `electronRuntimeEvaluateTerms` — Electron 运行时
- `mcpWriteToolDirectTerms` — MCP 写工具
- `dashboardMutationSurfaceTerms` — Dashboard 变更表面
- `cliTokenOptionTerms` / `cliControlledWriteRouteBypassTerms` — CLI 令牌
- 等等

`discoverPublicExecuteTerms()` 函数自动发现所有导出的 `execute*` 函数，形成动态演进的禁止词列表。

---

## 六、从 Round 4H.16 到 M77 的完整里程碑演进

### 6.1 历史阻塞与突破

项目的关键转折点发生在 Round 4H.16 之后。当时 input-governance 问题（无法在不持久化原始 prompt 的前提下为 Codex CLI 子进程提供输入）是主要阻塞。该问题在 **M50.x 系列**（Supervisor Core Read Control Plane）中得到解决——通过统一元数据合约（M51.x）和 Supervisor 路由门控硬化，建立了从治理层到真实进程边界的受控通道。

### 6.2 里程碑全景 (M50 → M77)

| 里程碑 | 交付内容 | 意义 |
|--------|----------|------|
| M50.1-.4 | Supervisor 核心控制平面 + 路由门控 + 变更 Shell | **突破 input-governance 阻塞** |
| M51.1-.3 | 统一元数据合约/存储/Supervisor 投射 | 元数据层标准化 |
| M52.1 | ChatGPT Business 适配器基础 | 外部代理集成 |
| M53.1 | Chrome Profile 注册表健康 | 浏览器配置文件治理 |
| M62-65.5 | 业务配额（合约→控制平面→金丝雀→交叉检查） | 配额治理体系 |
| M66 | 高权限 UI 授权 | 管理员界面安全 |
| M67 | Owner/Admin 深度提取器 | 权限数据治理 |
| M68 | 业务成员对账 | 成员数据一致性 |
| M69 | Codex 配额融合 | 跨账户配额编排 |
| M70 | 特权业务数据存储 | 敏感数据治理 |
| M71 | Admin 写自动化 CDP | 受控写自动化 |
| M72 | 金丝雀漂移硬化 | 生产稳定性 |
| M73 | 真实客户端直接自动化 | 首次真实客户端 |
| M74 | 生产主权真实客户端自动化 | 生产级真实自动化 |
| M75 | Codex Desktop 账户容量编排 | Desktop 编排层 |
| M75.5 | 真实预演验收 | 端到端真实验证 |
| **M76** | **真实客户端校准** | **首个显式受控真实写入阶段！** |
| **M77** | **Codex Desktop CDP 结构映射** | 真实 CDP 连接的结构映射 |

### 6.3 M76 — 首个受控真实写入

M76 是项目的一个重要拐点——首次引入显式的真实校准阶段，允许在 TTL 绑定的校准会话内进入真实写入表面，但严格受以下约束：

- 必须通过注册清单（registered manifest）和存储解析的校准授权
- 默认管理员预演为 `chatgpt.workspace.calibration_member_remove_then_add.v1`
- 仅允许 `calibrationSafe=true` 且 `restoreAllowed=true` 的已注册目标
- Owner、admin、last-admin 和未知目标被阻止
- 所有禁止材料（cookies、tokens、passwords、raw selectors、raw DOM、network bodies）持续被拒绝
- 包含真实本地 live-touch smoke 测试：通过 loopback CDP 到达 Chrome，记录 product/version 类别和 target 计数（无原始 URL 或页面内容）

### 6.4 M77 — 当前最新里程碑

M77 增加了受控的 Codex Desktop CDP 结构映射路径：

- **真实网络边界**：通过 `fetch`（loopback HTTP）和 `WebSocket`（loopback CDP）连接到 Codex Desktop 的 DevTools 端点
- **固定 CDP 命令集**：仅允许 14 个特定读域命令（Page/DOM/CSS/Accessibility/Network/Log/Runtime/Input）+ 仅 4 个安全标签（"设置"、"剩余额度"、"插件"、"搜索"）的受控点击
- **元数据仅存储**：原始 DOM、DOMSnapshot、console 文本、network body 仅瞬态存在，不持久化
- **危险控制阻止**：10 种危险控制模式（logout、purchase、upgrade、add_credits、save、submit、delete、account_switch、git_write、new_task、external_link）被识别并记录为 blocked-control，不执行
- **回环限制**：端点必须是 localhost/127.0.0.1/::1，WebSocket URL 必须与 HTTP 端点匹配
- **Supervisor 后台作业**：长时间运行的结构映射探索可通过 Supervisor 后台作业队列异步执行
- **漂移签名**：记录兼容性状态——若 Desktop 形状变化，记录 drift/blocker 而非扩展为任意 CDP 命令

---

## 七、包与内核全量地图

### 7.1 核心内核（Kernels）

| 包名 | 行数 | 职责 |
|------|------|------|
| contracts | 23,500 | 共享 Zod Schema，唯一真相源 |
| security-kernel | 319 | 策略引擎，风险推断，批准门控 |
| evidence-kernel | 144 | 证据创建，多层脱敏，哈希工具 |
| orchestrator-kernel | 2,208 | 编排引擎：规划、治理、预飞行、调度生命周期 |
| workflow-kernel | 2,744 | 自定义工作流引擎：模板、步骤配置、生产预演与恢复 |
| codex-kernel | ~337KB | Codex 只读适配器：治理生命周期、进程边界、预飞行、审查 |
| observer-kernel | ~150 | OS 进程白名单观察 |
| governance-projection-kernel | ~200 | 统一运行投射：20+ 源归一化、状态标准化 |
| secret-governance-kernel | ~300 | 密钥配置就绪管理（4 提供商） |
| approval-ux-kernel | ~200 | 批准 UX：7 种批准类型投影、状态机 |
| review-package-kernel | ~300 | 审查包投影、导出边界、批准门控 |
| browser-profile-kernel | — | Chrome 浏览器配置文件管理 |
| electron-cdp-kernel | — | Electron CDP 观察管理 |
| capability-adapter-kernel | — | 能力适配器抽象 |
| worktree-manager | — | 隔离工作树管理 |
| skill-registry | — | 技能注册与发现 |
| store-core | — | 存储抽象接口 |
| store-sqlite | — | SQLite 存储实现（唯一可使用 SQLite 的包） |
| mcp-tool-contracts | — | MCP 工具契约定义 |

### 7.2 适配器

| 包名 | 职责 |
|------|------|
| codex-exec-adapter | Codex CLI 执行 |
| nx-verification-adapter | Nx affected 验证 |
| github-provider-adapter | GitHub API：分支、PR、合并、Actions、发布 |
| electron-cdp-adapter | Electron CDP 适配 |
| playwright-observer-adapter | Playwright 浏览器自动化 |
| otel-adapter | OpenTelemetry 导出 |
| policy-backend-adapter | 外部策略后端（OPA/Cedar） |
| deployment-provider-adapter | 部署同步/回滚 |
| external-agent-adapter | 外部 AI 代理集成 |
| codex-app-server-adapter | Codex App Server 会话管理 |
| chatgpt-business-adapter | ChatGPT Business 集成 |

### 7.3 运维内核

| 包名 | 行数 | 职责 |
|------|------|------|
| diagnosis-kernel | 251 | 10 种诊断类型，决策树分类 |
| recovery-kernel | 163 | 12 种高风险恢复类型，仅元数据恢复计划 |
| task-closure-kernel | 685 | 4 种投射类型，6 种预演场景 |
| business-quota-kernel | ~1,440 | 12 个配额函数，12 种配额源 |
| business-quota-debug-kernel | 672 | 6 个探针函数，基于角色的访问控制 |
| platform-operations-kernel | 827 | 6 个操作族，14 种灾备场景 |
| runtime-operations-kernel | 391 | 作业生命周期：计划→入队→租约→锁→检查点→运行 |
| operator-readiness-kernel | 1,091 | 操作员就绪报告，M10/M11 pilot |
| ui-automation-kernel | 746 | UI 自动化操作分类 |
| production-ga-kernel | 1,027 | 9 个产品表面，8 个 E2E 步骤，15 个预演场景 |
| production-real-client-kernel | — | 真实客户端生产编排 |
| real-client-calibration-kernel | — | 真实客户端校准 |
| codex-desktop-orchestration-kernel | — | Codex Desktop 编排 |
| codex-scheduler-kernel | — | Codex 调度器 |
| release-candidate-kernel | — | RC 发布候选人管理 |
| release-lifecycle-kernel | — | 发布生命周期管理 |

---

## 八、关键评估

### 8.1 架构优势

1. **治理嵌入而非外挂**: 治理不是事后审计，而是每个内核和适配器的内在属性。`noRealWrite`, `bodyStored: false`, `processBoundaryInvoked` 等标志贯穿整个代码库

2. **Contracts 作为唯一真相源**: 23,500 行的单一 Zod Schema 文件使类型安全覆盖整个 monorepo，杜绝了接口不一致的可能性

3. **自验证元审计**: `audit-no-live-automation.ts` 的 144+ 对抗性哨兵测试和自引用验证代表了一种罕见的工程严谨性——审计工具审计自身

4. **边界隔离模式**: 每个外部资源类型（进程、HTTP、文件系统、CDP 等）有且仅有一个特许边界文件，其余代码严禁直接使用对应 API——这是纵深防御的极致实践

5. **多层脱敏**: 证据层在键名、路径、正文三个层面实施脱敏，且对抗性固件自动检测敏感文本在 JSON 序列化后的泄漏

### 8.2 当前挑战

1. **从模拟到真实的渐进过渡**：M76-M77 已突破全模拟模式，但真实自动化仍仅限于 TTL 绑定的校准会话和固定 CDP 探针。通用的真实任务执行仍需要审批链的每个环节就绪

2. **复杂度持续增长**：从 Round 4H 的 ~40 包扩展到 M77 的 ~50+ 包，随着真实能力边界扩展，维护负担线性增长

3. **回环依赖限制**：M77 的真实 CDP 连接要求 Codex Desktop 在同一台机器上运行且暴露 DevTools 端点。在 Desktop 形状或 CDP 兼容性变化时，系统设计为记录 drift 而非自动适应

4. **后台作业的进程内限制**：Supervisor 重启会丢弃内存中的作业进度（持久化的校准观察/运行在完成后仍可用），长运行结构映射的可靠性依赖 Supervisor 持续运行

### 8.3 推荐关注方向

1. **M77 后的自然扩展**：结构映射完成后，可考虑基于映射结果建立 Desktop UI 漂移监控——当 Desktop 面板标签或目标形状变化时自动生成 drift signature 而非静默失败

2. **校准会话治理深化**：M76 的 TTL 绑定校准是受控真实写入的第一个出口——随着更多真实写入路径开放，需要验证 TTL 机制、回滚能力和审计完整性

3. **后台作业持久化**：M77 的结构映射探索作业在 Supervisor 重启后丢失进度——考虑将作业状态持久化到 SQLite

4. **集成测试覆盖真实边界**：随着 M76-M77 引入真实网络边界（loopback HTTP + WebSocket CDP），需要对应的集成测试验证这些边界在真实环境中的行为

---

## 九、文件参考

| 文件 | 路径 |
|------|------|
| 根 package.json | `C:\Users\Thomas\CodexHub\package.json` |
| Nx 配置 | `C:\Users\Thomas\CodexHub\nx.json` |
| TS 基础配置 | `C:\Users\Thomas\CodexHub\tsconfig.base.json` |
| Contracts (单一真相源) | `C:\Users\Thomas\CodexHub\packages\contracts\src\index.ts` |
| Security Kernel | `C:\Users\Thomas\CodexHub\packages\security-kernel\src\index.ts` |
| Orchestrator Kernel | `C:\Users\Thomas\CodexHub\packages\orchestrator-kernel\src\index.ts` |
| Workflow Kernel | `C:\Users\Thomas\CodexHub\packages\workflow-kernel\src\index.ts` |
| Codex Kernel | `C:\Users\Thomas\CodexHub\packages\codex-kernel\src\index.ts` |
| Evidence Kernel | `C:\Users\Thomas\CodexHub\packages\evidence-kernel\src\index.ts` |
| 审计工具 (最庞大) | `C:\Users\Thomas\CodexHub\tools\audit-no-live-automation.ts` |
| Scaffold Health | `C:\Users\Thomas\CodexHub\tools\scaffold-health.ts` |
| CLI 入口 | `C:\Users\Thomas\CodexHub\apps\cli\src\main.ts` |
| Supervisor | `C:\Users\Thomas\CodexHub\apps\supervisor\src\server.ts` |
| Orchestrator | `C:\Users\Thomas\CodexHub\apps\orchestrator\src\server.ts` |
| Dashboard | `C:\Users\Thomas\CodexHub\apps\dashboard\src\App.tsx` |
| MCP Server | `C:\Users\Thomas\CodexHub\apps\codexhub-mcp-server\src\main.ts` |
| 对抗性输出固件 | `C:\Users\Thomas\CodexHub\test-fixtures\adversarial-public-output-fixture.ts` |

---

*本分析基于 2026-05-10 对 C:\Users\Thomas\CodexHub 目录的完整代码审查，包括所有 apps/、packages/、tools/ 和 test-fixtures/ 目录的 TypeScript 源文件。*
