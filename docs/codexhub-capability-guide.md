# CodexHub 能力说明

Status: M77 后的能力地图，面向新加入的人类 operator 和 AI agent。

CodexHub 是一个受治理的 DevOps / Codex / ChatGPT / real-client 自动化控制面。它不是单个浏览器脚本，也不是一个任意远控工具。项目的核心价值是：把本地开发、Codex Desktop、Chrome/ChatGPT、GitHub、部署、运维、外部 agent、证据、审计、审批和校准统一到一条可解释、可阻断、可复盘的自动化链路中。

## 一句话模型

CodexHub 的正确使用方式是：

1. 用 `packages/contracts` 定义共享 DTO/schema/type。
2. 用 kernel package 做计划、策略、投影、校验和摘要。
3. 用 adapter package 触碰外部能力，但 adapter 不是 authority。
4. 用 `apps/supervisor` 做唯一受控 API 面。
5. 用 store-resolved approval、evidence、audit 证明每一步。
6. 用 Dashboard / CLI / MCP 观察或发起已审查的控制面操作。

任何能力提供者都只能执行或观察；最终是否允许执行由 CodexHub governance 决定。

## 不可突破的边界

永远禁止读取、保存、打印或返回：

- cookie、session token、refresh token、password、MFA/passkey、private key、浏览器凭据库、原始 profile 材料；
- raw prompt、raw completion、raw stdout/stderr、raw tool output、raw App Server response；
- raw DOM、raw selector、raw JavaScript、raw network body、raw request/response body；
- raw diff、raw patch、raw file body、raw local path、raw URL、raw database row、raw audit body。

允许作为治理状态读取的内容包括：账号身份、workspace 身份、登录/会话健康、quota/capacity、任务状态、业务管理字段。公开输出仍应是 id/hash/count/status/summary/evidence ref/audit id/boundary boolean。

## 总体架构

| 层 | 主要位置 | 责任 |
| --- | --- | --- |
| Contracts | `packages/contracts` | 所有共享 schema、DTO、risk/action/evidence 类型。 |
| Kernels | `packages/*-kernel` | 纯逻辑、计划、投影、策略、readiness、rehearsal、summary。 |
| Adapters | `packages/*-adapter` | 固定边界外部能力，例如 GitHub、CDP、Codex CLI、App Server、Deployment provider。 |
| Store | `packages/store-core`, `packages/store-sqlite` | async repository 接口和 SQLite 实现。SQLite runtime 只允许在 `store-sqlite`。 |
| Supervisor | `apps/supervisor` | Fastify 控制面；所有 POST 需要 local-control / origin / gate / policy。 |
| Operator UX | `apps/dashboard`, `apps/cli` | 只读或 guided UX。Dashboard token 仅内存；CLI 避免 generic POST。 |
| MCP | `apps/codexhub-mcp-server` | 默认 read-only 工具；写工具必须声明 risk/action/evidence/approval。 |
| Audits | `tools/audit-*.ts`, `tools/scaffold-health.ts` | 包边界、SQLite 隔离、无未审查 live automation、skills、scaffold 注册。 |

## 核心治理能力

| 能力 | 说明 | 状态 |
| --- | --- | --- |
| Policy | `security-kernel` 是最终 authority；OPA/Cedar backend 只 advisory。 | 可用，默认保守。 |
| Approval | 支持 approval request、manual approval、store-resolved authority、used/expired/revoked 语义。 | 可用。 |
| Evidence | evidence ref、bundle、metadata/hash-only 证据链。 | 可用。 |
| Audit | audit event、boundary truth、liveExecution/externalProcessStarted 事实链。 | 可用。 |
| Governance projection | 统一 run/evidence/audit/operator readiness 投影。 | 可用。 |
| Risk model | low/medium/high/critical；高风险/关键风险要求审批。 | 可用。 |

关键规则：

- request body 里的 `approvalArtifact`、`executionAuthority`、`authority` 永远不可信。
- pre-boundary block 不消费 approval。
- boundary reached 之后失败也要保留 boundary booleans，并且匹配 approval 只能消费一次。

## Supervisor API 面

当前 Supervisor 大约 200 条 route，核心 family 包括：

| Route family | 能力 |
| --- | --- |
| `/health`, `/capabilities` | 健康检查和能力摘要。 |
| `/accounts`, `/clients`, `/tasks` | M51+ 账号、客户端、任务、诊断、恢复、闭环投影。 |
| `/workflows`, `/api/workflows/*` | workflow catalog、custom workflow、production recovery。 |
| `/approvals`, `/api/approvals/*` | 审批 inbox 和 decision。 |
| `/evidence`, `/audit` | 证据与审计查询。 |
| `/api/browser/observation/*` | Browser observation dry-run/approval/run。 |
| `/api/electron-cdp/observation/*` | Electron/CDP observation dry-run/approval/run。 |
| `/api/worktrees/*` | 受控 sibling worktree plan/run/cleanup。 |
| `/api/review-packages/*` | review package 生成。 |
| `/api/release-candidates/*` | release candidate dry-run/run。 |
| `/api/github/*` | GitHub metadata、draft PR、branch publish、PR lifecycle、cleanup 等。 |
| `/api/codex/*` | Codex exec、fixture replay、preflight、adapter skeleton/review 等。 |
| `/api/real-clients/*` | M74 real-client surface / manifest / authority / job / evidence / audit。 |
| `/api/codex-desktop-orchestration/*` | M75 Codex Desktop account/capacity/session/task orchestration。 |
| `/api/real-client-calibration/*` | M76/M77 真实客户端校准、structure map、drift/correction。 |
| `/api/business-quota/*` | Business quota、owner admin、reconciliation、privileged store、admin UI governance。 |
| `/api/production-ga/*` | M48 GA matrix、threat model、training、E2E rehearsal、RC signoff。 |

POST 路由原则：

- 需要 local-control token。
- 需要 trusted loopback Origin/Host。
- 禁止 request-body authority/approval artifact/raw payload。
- 写/admin/live 操作必须 dry-run first，并按 risk 走 approval/evidence/audit。

## 开发自动化能力

| 能力 | 包/面 | 说明 |
| --- | --- | --- |
| Codex exec | `codex-exec-adapter`, `codex-kernel` | Codex CLI/exec 的受控计划、preflight、read-only adapter、approval-boundary 试点。 |
| Nx verification | `nx-verification-adapter` | lint/test/build/affected 计划和验证摘要。 |
| Worktree | `worktree-manager` | sibling isolated worktree、diff summary、cleanup，禁止 repo-root 随意改动。 |
| Review package | `review-package-kernel` | 汇总 task、diff、verification、approval、evidence/audit。 |
| Release candidate | `release-candidate-kernel`, `release-lifecycle-kernel` | RC plan/run、release lifecycle、tag/draft release 治理。 |
| Task lifecycle | `task-closure-kernel`, `diagnosis-kernel`, `recovery-kernel` | 任务诊断、恢复、闭环状态。 |

## GitHub 能力

`github-provider-adapter` 提供固定 GitHub HTTP 边界，支持多条 route family：

- metadata observation；
- branch publish；
- draft PR；
- PR lifecycle；
- PR labels / assignees / reviewers / milestones / comments；
- merge；
- GitHub Actions observe / rerun / cancel / dispatch；
- release tag / draft；
- remote supersede / cleanup。

GitHub 默认 disabled。任何远端写都需要固定 endpoint、runtime gate、dry-run、approval、evidence、audit。禁止 token value storage、arbitrary URL/API passthrough、push/force/update-ref 漂移、release publish 越权。

## 部署与 secrets 能力

| 领域 | 包 | 能力 |
| --- | --- | --- |
| Deployment | `deployment-provider-adapter` | Docker、Kubernetes、Helm、Argo CD、Terraform、OpenTofu 的 governed apply/sync/rollback plan/run。 |
| Rollback | deployment kernel/store | rollback 需要持久化 rollback plan，hash-bind source run/env/provider/target/artifact。 |
| Secrets readiness | `secret-governance-kernel` | Vault、SOPS、1Password、Doppler readiness；只 configured/missing/hash，不读 secret value。 |
| Production gates | Supervisor routes | prod deployment 双审批，provider write flag 和 prod write flag 独立。 |

Terraform/OpenTofu rollback 的语义是 apply approved rollback plan hash，不是 destroy。

## Policy 与 telemetry 能力

| 能力 | 包 | 说明 |
| --- | --- | --- |
| OPA/Cedar backend | `policy-backend-adapter` | 支持 local CLI / loopback HTTP；advisory-only，不能授予或撤销 CodexHub authority。 |
| OpenTelemetry | `otel-adapter` | 本地 in-memory export 和 OTLP HTTP exporter path；网络 exporter 默认关闭。 |
| Evidence/Audit | `evidence-kernel`, audit records | Telemetry 不能替代 Evidence/Audit。 |

## Runtime、队列与外部 agent

| 能力 | 包 | 说明 |
| --- | --- | --- |
| Scheduler/queue | `runtime-operations-kernel` | job queue、lease、lock、timeout、cancel、retry、checkpoint、concurrency。 |
| External agents | `external-agent-adapter` | Codex CLI 和 Claude Code CLI 作为受治理外部 agent；只能在 controlled sibling worktree 产出 patch summary。 |
| Multi-agent coordination | `workflow-kernel` | 多 agent 协调只能通过 workflow-kernel，不允许 UI/CLI/MCP 直接调用 agent adapter。 |

## Platform operations 能力

`platform-operations-kernel` 覆盖平台自身运维：

- local backup catalog；
- isolated restore rehearsal；
- active store restore replacement，默认 disabled，要求 scheduler quiescence、manifest hash match、双审批；
- built-in migration ids，禁止 request-body SQL；
- retention preview/run；
- metadata-only audit export JSONL；
- operator role assignment，存 operator hash 和 role scope；
- disaster recovery rehearsal/runbook。

## Production GA 能力

`production-ga-kernel` 和 `/api/production-ga/*` 提供 GA 聚合签核：

- full capability matrix；
- threat model；
- operator training；
- E2E rehearsal：patch -> verify -> PR -> merge -> release -> deploy -> observe -> rollback；
- release candidate signoff；
- residual risk register；
- evidence bundle summary。

GA signoff 是聚合控制面：它只聚合 child control-plane records 和 evidence，不直接调用 child adapters。GA signoff 要求两个不同 approver hashes，不能替代 child approvals。

## Browser / Chrome / ChatGPT 能力

| 阶段 | 包/面 | 能力 |
| --- | --- | --- |
| Browser profile | `browser-profile-kernel` | profile registry/readiness/health，路径 hash-only，不读 cookie/session/token。 |
| Playwright observation | `playwright-observer-adapter` | read-only observation，默认 disabled。 |
| ChatGPT Business | `chatgpt-business-adapter`, `business-quota-kernel` | workspace/member/quota/readiness/reconciliation，owner admin projections。 |
| Privileged business store | `business-quota-kernel`, `store-sqlite` | 可保存授权业务明文：邮箱、角色、席位、发票金额、额度摘要；凭据类永久禁止。 |
| Admin UI governance | `ui-automation-kernel` | admin write intent/dry-run/authority/run/post-write verification；固定 flow，无 generic CDP passthrough。 |
| Real client automation | `production-real-client-kernel` | Chrome/ChatGPT surfaces、operation manifests、authority、evidence、audit、jobs、break-glass。 |
| Calibration | `real-client-calibration-kernel` | TTL-bound live calibration、selector samples、drift signatures、manifest correction proposals。 |

最近真实校准已经证明：

- 能通过 loopback Chrome CDP 发现 ChatGPT/Workspace Admin 页面；
- 能读取 AX/DOM/DOMSnapshot/CSS/Layout/Network metadata/Log metadata；
- 能安全点击只读入口，如 ChatGPT 搜索、模型选择器、个人资料菜单、设置、Admin 成员页导航；
- 能识别并 blocked 退出登录、邀请、移除、购买、升级、分享链接、发送/提交等高风险控件。

这些探索数据保存在 `.codexhub/data/chatgpt-real-automation/`，只保存 hash/count/status/masked summary，不保存 raw DOM 或凭据。

## Codex Desktop / Electron / CDP 能力

| 能力 | 包/面 | 说明 |
| --- | --- | --- |
| Electron CDP observation | `electron-cdp-adapter`, `electron-cdp-kernel` | loopback target/page/AX/DOM/Network/Log metadata observation。 |
| Real client readiness | `/api/real-clients/connection-readiness`, `/connection-probes` | Chrome 和 Codex Desktop loopback readiness。 |
| Codex Desktop orchestration | `codex-desktop-orchestration-kernel` | account registry、Desktop observed state、capacity state、routing decision、account switch plan、task dispatch plan。 |
| Structure map | M77 routes | Codex Desktop 多轮 CDP read-click 结构地图、blocked controls、locator candidates、drift signatures。 |
| Calibration data | `real-client-calibration-kernel` | session、authority、observation、drift、selector sample、correction proposal。 |

Codex Desktop 真实结构探索已经能通过 CDP 读取目标数量、页面/worker/WebSocket target、AX/DOM/DOMSnapshot 摘要，并通过后台 job 运行长链路 structure-map。危险项如退出、购买、升级、提交、删除、账号切换、Git 写操作只记录 blocked，不执行。

## Codex App Server 能力

`codex-app-server-adapter` 覆盖：

- stdio / wire summary；
- initialize lifecycle；
- account/read；
- account/rateLimits/read；
- thread start/resume；
- turn start；
- event ingest；
- approval bridge；
- protocol drift detector；
- metadata-only wire summaries。

App Server 相关输出禁止保存 raw prompt、raw server response、raw event body、approval secret 或本地真实路径。真实 dispatch 需要 M75/M76 后续 surface/manifest/authority 支持。

## Real-client production automation 能力

M74 之后，项目拥有一套通用真实客户端治理模型：

| 构件 | 说明 |
| --- | --- |
| Capability class | `standard-production`, `restricted-production`, `high-risk-production`, `break-glass-production`, `forbidden`。 |
| Surface Registry v2 | 只允许 server/store 注册的 surface。请求体不能提供 raw endpoint。 |
| Operation Manifest | reviewed operation id、surface id、risk tier、selector/script hash、inputRef schema、evidence policy。 |
| Authority Engine | 标准/限制/高危/break-glass authority resolution。 |
| Approval Binder | dry-run + persisted approval + hash-bound input。 |
| Evidence Vault | E0-E4 证据等级；E5 secret material 永不存储。 |
| Audit Ledger | append-only 行为事实链。 |
| Break-glass Controller | 两人审批、incidentId、TTL、post-run review。 |

生产真实自动化不是“任意点击”。它必须通过注册 surface 和 reviewed manifest。禁止 raw selector、raw JS、operate-any-page、generic CDP passthrough。

## Dashboard / CLI / MCP 能力

| App | 说明 |
| --- | --- |
| `apps/dashboard` | Operator UX，覆盖 governance、readiness、GitHub、workflows、deployments、secrets、policy/telemetry、runtime、operations、production GA、Codex Desktop、real calibration 等视图。 |
| `apps/cli` | `pnpm codexhub ...` 命令入口；多数命令 read-only；精确 mutation command 必须走 local-control token 和 audited route。 |
| `apps/codexhub-mcp-server` | MCP read-only tools 为默认；写工具必须 approval/evidence/audit，不能绕过 Supervisor/workflow-kernel。 |
| `apps/orchestrator` | 早期/基础 orchestrator shell，真实执行仍受 governance gate 管控。 |

## Store 与数据策略

| 数据类别 | 策略 |
| --- | --- |
| 普通 operational metadata | SQLite，ids/hashes/counts/status/summaries/evidence/audit。 |
| Privileged business data | 单独 privileged business store/table family，可存业务明文字段，需 high-privilege approval 和 access log。 |
| 凭据/会话材料 | 永不保存。 |
| Raw DOM / DOMSnapshot | 只允许 transient 用于结构分析，不持久化。 |
| Raw network body | 禁止。 |
| Raw prompt / raw patch / raw diff | 禁止，使用 inputRef/hash/summary。 |

## 典型工作流

### 1. 让 Codex 做一个受治理开发任务

1. 创建 task intent，保存 inputRef/inputHash。
2. 选择 controlled sibling worktree。
3. 生成 dry-run plan。
4. policy decision。
5. 如需写入，创建 approval request。
6. store-resolved approval。
7. 执行 Codex/App Server/CLI 或 external agent 固定边界。
8. 收集 changed file count、diff hash、verification result。
9. 生成 review package。
10. 可选 GitHub branch/draft PR/PR lifecycle。

### 2. 读取 ChatGPT / Chrome 结构

1. 使用 registered Chrome CDP surface。
2. 选择 reviewed operation manifest。
3. 读取 Target/Page/AX/DOM/DOMSnapshot/CSS/Layout/Network metadata。
4. 只保存结构 hash、role counts、masked labels、blocked controls。
5. 如果是 read-click，只点击 safe panel/menu，之后 Esc/restore。

### 3. Codex Desktop account-capacity routing

1. 读取 Desktop observed state。
2. 识别 account hash、workspace hash、login state、capacity state、task state。
3. 如果当前账号合法且有容量，继续。
4. 如果需要切换，只能切到 registered authorized account，且策略允许。
5. login/MFA/permission/quota exhausted/unknown workspace 一律 block。
6. dispatch task 只用 inputRef，不存 raw prompt。

### 4. Business admin write calibration

1. 目标必须 `calibrationSafe=true`、`restoreAllowed=true`。
2. 需要 delegated-admin authority。
3. dry-run。
4. calibration authority grant。
5. live remove/add 只在 TTL-bound session 内允许。
6. before/after/post-write verification。
7. restore 失败立即停止，要求人工恢复。

## 当前默认关闭的能力

大量真实能力已经有 contracts/store/routes/kernel，但产品默认仍关闭，需要 env gate 和审批，例如：

- `CODEXHUB_PRODUCTION_REAL_CLIENTS_ENABLED`
- `CODEXHUB_CHROME_CDP_ENDPOINT`
- `CODEXHUB_CODEX_DESKTOP_CDP_ENDPOINT`
- `CODEXHUB_REAL_CLIENT_CALIBRATION_ENABLED`
- `CODEXHUB_REAL_CLIENT_CALIBRATION_LIVE_WRITES_ENABLED`
- `CODEXHUB_REAL_CLIENT_CALIBRATION_ADMIN_WRITE_ENABLED`
- `CODEXHUB_CODEX_DESKTOP_ORCHESTRATION_ENABLED`
- `CODEXHUB_CODEX_DESKTOP_STATE_READER_ENABLED`
- `CODEXHUB_CODEX_DESKTOP_ACCOUNT_SWITCH_ENABLED`
- `CODEXHUB_CODEX_DESKTOP_TASK_DISPATCH_ENABLED`
- `CODEXHUB_BUSINESS_ADMIN_UI_LIVE_WRITES_ENABLED`
- `CODEXHUB_GITHUB_PROVIDER_ENABLED`
- `CODEXHUB_DEPLOYMENT_OPERATOR_ENABLED`
- `CODEXHUB_SECRETS_GOVERNANCE_ENABLED`

## AI agent 接手规则

新 AI agent 进入本项目时，先读：

1. `AGENTS.md`
2. `docs/codexhub-capability-guide.md`
3. `.codexhub/orchestration.yaml`
4. `.codexhub/integrations.yaml`
5. `docs/security-boundaries.md`
6. 相关 release/review/runbook 文档

开发前必须声明：

- Workflow Skills Used and Why
- Project Skills Used and Why
- Skills Not Used and Why

开发顺序：

1. contracts
2. kernels
3. store
4. supervisor
5. dashboard/cli/mcp
6. docs/audits

验证顺序：

1. focused tests for touched projects
2. `pnpm scaffold:health`
3. `pnpm audit:boundaries`
4. `pnpm audit:sqlite-isolation`
5. `pnpm audit:no-live-automation`
6. `pnpm audit:skills`
7. `pnpm verify:foundation` when appropriate
8. `git diff --check`

## Stop conditions for any agent

立刻停止并汇报，如果出现：

- route、CLI、Dashboard、MCP 或测试直接调用 adapter execute；
- public response 出现 raw prompt/diff/path/url/body/token/cookie/session/MFA/DOM/network body；
- write/admin/live action 没有 dry-run/policy/approval/evidence/audit；
- request body authority 被接受；
- capability provider 变成 authority provider；
- live boundary 在没有 env gate、approval、evidence/audit 的情况下被触达；
- browser/electron/cdp 路径变成 generic passthrough；
- quota-aware routing 被实现成 quota evasion。

## 快速判断一个能力是否“可生产使用”

只有同时满足以下条件，才能称为生产可用：

1. 有 contract 和 forbidden fixture。
2. 有 kernel 计划/校验/投影。
3. 有 store round-trip，且 metadata-only。
4. 有 Supervisor route gates。
5. 有 dry-run。
6. 有 policy decision。
7. 高风险/关键风险有 persisted approval。
8. 有 evidence 和 audit。
9. 有 runtime gate。
10. 有 runbook、review、release 文档。
11. `audit:no-live-automation` 没有被绕过。
12. Dashboard/CLI/MCP 没有直接执行 adapter。

## 简短结论

CodexHub 当前已经具备完整的治理骨架和大量受控能力：从本地开发、worktree、Codex exec、App Server、GitHub、部署、secrets、policy/telemetry、runtime/external agents、平台运维、GA 签核，到 Chrome/ChatGPT 与 Codex Desktop 的真实客户端校准。

但项目的生产哲学是“能力可以强，入口必须窄”。任何真实读写都必须走注册 surface、reviewed manifest、dry-run、approval、authority、evidence、audit 和 runtime gate。这样后续即使 Chrome、ChatGPT、Codex Desktop UI 改版，也可以通过 calibration、drift signature 和 manifest correction proposal 持续修正，而不是靠脆弱脚本硬跑。

