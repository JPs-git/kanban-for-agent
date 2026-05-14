## Git 非交互式配置指南（供 Coding Agent 使用）

为确保 Git 命令在非交互环境下流畅运行，不会因为分页、编辑器等待等原因阻塞 Agent，请按以下要求配置环境。

### 1. 基础配置（全局或按仓库）

在 Agent 运行环境中执行以下命令：

```bash
# 禁用全部分页器，让输出直接打印
git config --global core.pager cat

# 禁用交互式编辑器（如 vim/nano），避免等待用户输入
git config --global core.editor true

# 可选：显式关闭常用命令的分页
git config --global pager.branch false
git config --global pager.log false
git config --global pager.diff false
git config --global pager.show false

# 避免合并冲突时打开交互式合并工具
git config --global merge.tool true
```

> 如果只需对当前仓库生效，去掉 `--global`。

### 2. 命令执行时的临时保护

如果无法修改全局配置，也可在每次执行 Git 命令时通过环境变量强制无交互：

```bash
GIT_PAGER=cat GIT_EDITOR=true git <command>
```

例如：

```bash
GIT_PAGER=cat GIT_EDITOR=true git branch -a
GIT_PAGER=cat GIT_EDITOR=true git commit -m "message"
```

### 3. 常见交互场景及规避方法

| 操作                   | 可能阻塞点       | Agent 应执行的替代方案                                                |
| ---------------------- | ---------------- | --------------------------------------------------------------------- |
| `git branch -a`        | 分页等待按键     | 使用 `--no-pager` 或配置 `pager.branch = false`                       |
| `git log` / `git diff` | 分页             | 使用 `--no-pager` 或配置对应 pager                                    |
| `git commit`           | 打开编辑器       | 始终使用 `-m` 或 `-F` 提供提交信息                                    |
| `git rebase -i`        | 打开序列编辑器   | 改用非交互的 `git rebase` 或设置 `GIT_SEQUENCE_EDITOR=true`           |
| `git merge` 冲突       | 打开 `mergetool` | 设置 `merge.tool = true` 避免打开工具                                 |
| `git add -p`           | 交互式暂存       | 直接用 `git add`                                                      |
| 任何凭证或确认提示     | 等待输入         | 通过凭证助手或环境变量提前配置（如 `GIT_ASKPASS` 设置为 `/bin/true`） |

## 分支命名规则

- master: 主分支, 开启了分支保护, 禁止直接push, 需要PR
- v*.*: 版本分支, 开启了分支保护, 禁止直接push, 需要PR
- patch/\*: 特性分支, 需要从版本分支签出, 推送前需要rebase操作

## 关于git推送

1. master分支已经开启了分支保护, 不要直接推送到master分支, 也不要commit代码到master分支
2. 版本分支vx.x分支开启了分支保护, 不允许直接push到版本分支, 也不要commit代码到版本分支
3. commit代码前需要从版本分支vx.x版本分支签出patch分支, 具体版本查看VERSION文件, 比如VERSION文件是0.7.1, 则从 origin/v0.7版本分支签出新分支
4. 推送patch分支之前需要进行rebase操作, 流程如下:
   # 1. 获取远程仓库最新数据
   git fetch origin
   # 2. 将你的 patch 分支变基到最新的版本分支 origin/vx.x 上
   git rebase origin/vx.x
   # 如果有冲突，逐项解决后执行：
   # git add .
   # git rebase --continue
   # 重复直到完成
   # 3. 强制推送更新你的远程 PR 分支（因为历史被改写了）
   # 强烈推荐使用 --force-with-lease，它更安全，不会覆盖别人新推的提交
   git push --force-with-lease origin patch
5. **禁止使用** --force --no-verify强制推送
6. 推送patch分支后使用gh pr create 创建PR, 目标是版本分支,启用自动合并 gh pr merge --auto --squash --delete-branch
