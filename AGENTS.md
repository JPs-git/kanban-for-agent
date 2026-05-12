关于git推送

1. master分支已经开启了分支保护, 不要直接推送到master分支
2. 确保目前处于最新的远程master分支, 推送前需要从master分支checkout -b 新的patch分支, 不要使用已经有的分支
3. 如果当前不在master分支上需要git stash暂存, 从最新的远程master分支签出(checkout -b)新的patch分支后使用git pop 应用修改, 可能需要处理冲突
4. 推送patch分支之前需要进行rebase操作, 流程如下:
   # 1. 获取远程仓库最新数据
   git fetch origin
   # 2. 将你的 patch 分支变基到最新的 origin/master 上
   git rebase origin/master
   # 如果有冲突，逐项解决后执行：
   # git add .
   # git rebase --continue
   # 重复直到完成
   # 3. 强制推送更新你的远程 PR 分支（因为历史被改写了）
   # 强烈推荐使用 --force-with-lease，它更安全，不会覆盖别人新推的提交
   git push --force-with-lease origin patch
5. 运行git push命令推送到远程的patch分支
6. **禁止使用** --force --no-verify强制推送
7. 推送完成后checkout 到主分支

