# Codex Desktop + Chrome 协同自动化：能力差距分析（修订版）

**场景**: Codex Desktop 任务因额度不足停止 → 诊断确认 → 通过 Chrome/CDP 切换到 Business 工作区内有额度的账户 → 回到 Desktop 点击"继续"

**日期**: 2026-05-10  
**当前阶段**: M77  
**修订**: 基于完整能力文档，纠正对 Chrome CDP 边界和账户切换路径的理解

---

## 架构理解纠正

### Chrome CDP 边界的真实模型

之前的分析错误地将 Chrome CDP 的 loopback 限制理解为"只能访问 loopback URL 的页面"。正确模型是：

```
Chrome CDP 控制通道: WebSocket ws://127.0.0.1:9222/...  ← loopback-only
Chrome 浏览目标: Chrome 可通过该通道导航到任何 URL       ← 不受 loopback 限制
```

这意味着通过 loopback CDP 连接，可以驱动 Chrome 访问 `chatgpt.com` 的 Business 工作区管理页面。M76-M77 的真实校准已证明：

- ✅ 能通过 loopback Chrome CDP 发现 ChatGPT/Workspace Admin 页面
- ✅ 能读取 AX/DOM/DOMSnapshot/CSS/Layout/Network/Log metadata
- ✅ 能安全点击只读入口（ChatGPT 搜索、模型选择器、个人资料菜单、设置、Admin 成员页导航）
- ❌ 退出登录、邀请、移除、购买、升级、分享链接、发送/提交等高风险控件识别但不执行

### 账户切换的正确路径

用户明确指出：**不能走 API，必须用 ChatGPT 账户登录，使用 Business 工作区内成员的 Codex 额度。** 这意味着账户切换需要：
- 在 Chrome 中登出当前 ChatGPT 账户 / 切换登录
- 以 Business 工作区成员身份登录
- Codex Desktop 使用该会话的额度

---

## 逐步骤能力对照（修订）

### 步骤 1：检测任务停止原因

| 维度 | 状态 | 详情 |
|------|------|------|
| 诊断决策树 | ✅ 已就绪 | `diagnosis-kernel` 的 `decideDiagnosis()` 包含 `failed_quota`（confidence 0.9），还有 `failed_auth`、`desktop_ui_frozen`、`app_server_unresponsive`、`model_stalled`、`tool_stuck` 等分类 |
| Desktop 状态读取 | ⚠️ 部分就绪 | M77 结构映射可读 Desktop AX/DOM 布局、面板标签、blocked controls。但 `taskState` 字段当前默认为 `'unknown'` |
| 额度检测输入 | ⚠️ 有框架无数据 | `CodexAccountCapacityState` 的 `capacityStatus` 支持 `quota_exhausted`。`CODEXHUB_CODEX_DESKTOP_STATE_READER_ENABLED` 控制状态读取的启用 |
| 诊断输入装配 | ❌ 未接通 | 无人将结构映射输出 + App Server 事件摘要装配为 `CodexTaskDiagnosisInput` |

**关键环境变量**: `CODEXHUB_CODEX_DESKTOP_STATE_READER_ENABLED`、`CODEXHUB_CODEX_DESKTOP_CDP_ENDPOINT`

---

### 步骤 2：额度检测与路由决策

| 维度 | 状态 | 详情 |
|------|------|------|
| 配额感知路由 | ✅ 已就绪 | `routeCodexTaskByCapacity()` 完整实现四策略（use_current_account / switch_authorized_account / wait_for_capacity / blocked） |
| 反规避 | ✅ 自动 | memberMutationForCapacity、accountCreationForCapacity、workspaceChurnForCapacity 自动 blocked |
| 批准/授权标记 | ✅ 自动 | 切换策略自动 `approvalRequired: true`、`authorityRequired: true` |
| 账户注册表 | ⚠️ 需填充 | `createCodexAccountRecord()` 接受 seed hash。需要从真实数据源填充 `authorizedAccounts` |
| 登录状态检查 | ✅ 逻辑完备 | `login_required`、`mfa_required`、`permission_denied` 自动 blocked |

**关键环境变量**: `CODEXHUB_CODEX_DESKTOP_ORCHESTRATION_ENABLED`

---

### 步骤 3：通过 Chrome 切换账户

这是最复杂的步骤。根据能力文档，真实校准已证明能做到和不能做到的：

| 操作 | 状态 | 说明 |
|------|------|------|
| Chrome CDP 连接 | ✅ | `CODEXHUB_CHROME_CDP_ENDPOINT=http://127.0.0.1:9222` |
| 导航到 ChatGPT Admin 页面 | ✅ | 校准已证明可发现 ChatGPT/Workspace Admin 页面 |
| Admin 成员页导航 | ✅ | 校准已证明可安全点击导航到 Admin 成员页 |
| 读取成员列表 | ⚠️ | AX/DOM 结构可读，但输出仅 hash/count/masked labels |
| **登出当前账户** | ❌ | "退出登录" 在 blocked controls 列表中 |
| **切换登录** | ❌ | 涉及登出 + 新登录 = 两个 blocked 操作 |
| 邀请新成员 | ❌ | "邀请" 在 blocked controls 列表中 |
| 发送/提交表单 | ❌ | "发送/提交" 在 blocked controls 列表中 |
| 购买/升级额度 | ❌ | "购买"/"升级" 在 blocked controls 列表中 |

**核心矛盾**: 账户切换需要"退出登录"（blocked）和可能的"登录"操作（未在安全列表中）。如果目标账户已是工作区成员，不需要 invite，但仍需要登出当前账户。

**可能路径**:

(a) **Codex Desktop 内切换**（绕过 Chrome 登出）: 如果 Codex Desktop 支持多账户且可在应用内切换（而非通过 Chrome 登出/登录），可能不需要触碰 blocked controls。M75 的 `CODEXHUB_CODEX_DESKTOP_ACCOUNT_SWITCH_ENABLED` 暗示这个能力在设计考虑中。

(b) **校准会话内登出/登录**: 如果"退出登录"被注册为校准会话内的受控操作（类似 M76 成员 remove/add），需要在 TTL 绑定、restore 保证、delegated-admin authority 下执行。

(c) **Chrome Profile 切换**: `browser-profile-kernel` 管理 Chrome profile。如果不同账户使用不同 Chrome profile，切换 profile 可能比登出/登录更干净。

---

### 步骤 4：Desktop 点击"继续"

| 维度 | 状态 | 详情 |
|------|------|------|
| Desktop CDP 连接 | ⚠️ 环境依赖 | M76 校准中 Desktop CDP "不可达"。M77 需要 `CODEXHUB_CODEX_DESKTOP_CDP_ENDPOINT` 且 Desktop 暴露 DevTools |
| "继续"安全点击 | ❌ 不在白名单 | M77 安全标签：`['设置', '剩余额度', '插件', '搜索']` |
| 任务分发 | ❌ dry-run only | `CODEXHUB_CODEX_DESKTOP_TASK_DISPATCH_ENABLED` 存在但当前路由为 dry-run |
| prompt 提交 | ❌ 不支持 | M76："No text was typed, no task was submitted" |

---

## 修订后端到端总结

```
步骤1: 检测停止    [诊断逻辑 ✅] [数据管道 ❌]
       ↓
步骤2: 额度路由    [路由算法 ✅] [账户数据 ⚠️ 需填充]
       ↓
步骤3: Chrome切换  [CDP导航 ✅] [登出操作 ❌ block] [登录操作 ❌ 未定义]
       ↓
步骤4: Desktop继续 [CDP可达 ⚠️] [继续点击 ❌ 不在白名单]
```

**与初版分析的关键差异**: 步骤 3 的阻塞原因不是"Chrome 无法访问外部域名"（可以），而是"登出/登录"操作被标记为 blocked control 且无对应的受控执行路径。

---

## 最小可行实现路径（修订）

### Phase 1: 诊断数据管道

将真实数据接入诊断和路由：
- 填充 `authorizedAccounts` 从 business 工作区成员列表（可通过 Chrome CDP 读取 Admin 成员页结构获得 hashed 成员信息）
- 装配 `CodexTaskDiagnosisInput` 从 Desktop 结构映射 + App Server 事件摘要
- 验证 `routeCodexTaskByCapacity()` 在真实账户数据上产生正确的切换决策

### Phase 2: 账户切换的受控路径

选择以下路径之一突破 Blocked Controls 限制：

**路径 A（推荐）**: Codex Desktop 内账户切换
- 启用 `CODEXHUB_CODEX_DESKTOP_ACCOUNT_SWITCH_ENABLED`
- 在 Desktop CDP 中注册"账户切换"为受控操作（点击 Desktop 内的账户切换 UI，而非 Chrome 中的登出）
- Desktop 内的账户切换不经过 ChatGPT Web UI，可能不受 blocked controls 限制

**路径 B**: 校准会话登出/登录
- 在 M76 校准框架下注册"ChatGPT 账户登出/切换"为校准操作
- 要求 restorationTarget（切换后能切回原账户？）
- TTL-bound session，delegated-admin authority

**路径 C**: Chrome Profile 切换
- 利用 `browser-profile-kernel` 切换 Chrome profile
- 不同 profile 对应不同 ChatGPT 登录会话
- 可能完全绕过登出/登录操作

### Phase 3: Desktop "继续"操作

- 将"继续"/"resume"注册为 M77+ 安全操作，附带严格约束：
  - 必须通过步骤 1 的诊断确认原因为 `failed_quota`
  - 必须通过步骤 2 的路由确认切换目标有效
  - 必须通过步骤 3 确认账户切换已完成
- 实现真实 Desktop CDP 任务分发边界
- prompt 仅通过 hash 引用，不传输原始文本

### Phase 4: 协同编排

- 新增 `DesktopTaskRecoveryWorkflow` 将四步串联
- 继承 `workflow-kernel` 的自定义工作流模板
- 每步有独立 dry-run/approval/evidence/audit

---

## 当前可验证的能力

```bash
# Desktop 结构映射（需 Desktop 运行 + DevTools 端点）
CODEXHUB_CODEX_DESKTOP_CDP_ENDPOINT=http://127.0.0.1:9223 \
pnpm codexhub codex-desktop structure-map

# Chrome CDP 导航验证（需 Chrome 运行 + CDP 端点）
CODEXHUB_CHROME_CDP_ENDPOINT=http://127.0.0.1:9222 \
CODEXHUB_BUSINESS_ADMIN_UI_LIVE_WRITES_ENABLED=true \
pnpm codexhub real-clients connection-probes

# 诊断决策树验证
pnpm nx run diagnosis-kernel:test --skip-nx-cache

# 路由决策验证
pnpm nx run codex-desktop-orchestration-kernel:test --skip-nx-cache
```
