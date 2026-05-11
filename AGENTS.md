关于git推送

1. master分支已经开启了分支保护, 不要直接推送到master分支
2. 推送前需要从master分支创建相应的patch分支
3. 如果当前不在master分支上需要git stash暂存, 从最新的远程master分支签出新的patch分支后使用git pop 应用修改, 可能需要处理冲突
4. 直接运行git命令推送到远程的patch分支