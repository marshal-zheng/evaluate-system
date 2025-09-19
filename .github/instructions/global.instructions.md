---
applyTo: '**'
---


# 全局使用说明
非必要, 不要写 try catch, 也不要在函数前后加 console.log 调试代码, 这些会影响性能.

api二次封装了 axios, 会统一拦截错误和成功, 调接口时不需要再写 try catch 了, 还有message信息操作, 只需要在函数里 return 数据即可.