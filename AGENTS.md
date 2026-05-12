## 分支命名规则
- master: 主分支, 开启了分支保护, 禁止直接push, 需要PR
- v*.*: 版本分支, 开启了分支保护, 禁止直接push, 需要PR
- patch/*: 特性分支, 需要从版本分支签出, 推送前需要rebase操作

## 关于git推送
1. master分支已经开启了分支保护, 不要直接推送到master分支
2. 版本分支vx.x分支开启了分支保护, 不允许直接push到版本
3. 推送patch分支之前需要进行rebase操作, 流程如下:
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
4. **禁止使用** --force --no-verify强制推送

