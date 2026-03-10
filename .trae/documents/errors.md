# 错误总结文档

## 错误记录

### 格式
- 每条错误按照条目记录
- 包含错误发生时间、错误信息、错误原因、解决方案（如果有）

### 错误列表

1. **错误发生时间**: 2026-03-10
   **错误信息**: curl : 无法分析响应内容，因为 Internet Explorer 引擎不可用，或者 Internet Explorer 的首次启动配置不完整。请指定 UseBasicParsing 参数，然后再试一次。
   **错误原因**: PowerShell中的curl是Invoke-WebRequest的别名，默认使用IE引擎解析响应，而IE引擎未正确配置。
   **解决方案**: 使用带UseBasicParsing参数的Invoke-WebRequest命令，或者使用其他HTTP客户端工具。

