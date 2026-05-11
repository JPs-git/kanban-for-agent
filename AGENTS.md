关于git推送

1. master分支已经开启了分支保护, 不要直接推送到master分支
2. 确保目前处于最新的远程master分支, 推送前需要从master分支checkout -b 新的patch分支, 不要使用已经有的分支
3. 如果当前不在master分支上需要git stash暂存, 从最新的远程master分支签出(checkout -b)新的patch分支后使用git pop 应用修改, 可能需要处理冲突
4. 在本地运行merge操作, 尝试将patch分支合并到本地的master分支, 确保master分支已经pull过, 如有冲突需要解决
5. 运行git push命令推送到远程的patch分支
6. **禁止使用** --force --no-verify强制推送

