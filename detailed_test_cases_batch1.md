# 汉硕智能设备管理系统 - 详细测试用例集

## 测试目录大纲总览

**总计：740 条测试用例**

### A. 后端 API 测试组 (230 条)

- A1. 设备管理 API: 45 条用例 (DeviceController, DeviceMobileController)
- A2. 门店管理 API: 35 条用例 (StoreController, StoreMobileController)
- A3. 策略管理 API: 40 条用例 (StrategyController, ConfigurationController)
- A4. 商业化 API: 30 条用例 (CommercializationStrategyController)
- A5. 产品管理 API: 25 条用例 (ProductController, ProductTypeController)
- A6. 数据统计 API: 35 条用例 (ElectricityController, OperationStatisController)
- A7. 涂鸦集成 API: 20 条用例 (TuyaDeviceController)

### B. 前端 UI 测试组 (160 条)

- B1. 驾驶舱页面: 25 条用例 (dashboard/electricityChart, operationChart)
- B2. 设备管理页面: 30 条用例 (system/device/index.vue)
- B3. 门店管理页面: 20 条用例 (system/store/index.vue, details)
- B4. 策略管理页面: 40 条用例 (system/strategy/\*_/_.vue)
- B5. 商业化管理页面: 25 条用例 (system/commerce/\*_/_.vue)
- B6. 产品管理页面: 20 条用例 (system/ems/\*_/_.vue)

### C. 设备策略计量组 (150 条)

- C1. 设备生命周期: 50 条用例 (8 种设备类型)
- C2. 策略生命周期: 45 条用例 (4 种策略类型)
- C3. 计量绑定管理: 30 条用例 (多路电表、设备绑定、解绑回滚)
- C4. 手动模式联动: 25 条用例 (策略转手动、联动提示、统计合并)

### D. 商业化产品组 (75 条)

- D1. 商业化策略: 20 条用例 (免费试用正式、生效期限、服务天数)
- D2. 故障权限管理: 15 条用例 (权限授权、门店联动、去重置灰)
- D3. 品类产品管理: 25 条用例 (品类库、产品管理、转协议配置)
- D4. 用户产品分配: 15 条用例 (移动端分配、品牌型号选择)

### E. 挑刺者专项组 (125 条)

- E1. 权限安全测试: 30 条用例 (越权访问、权限校验、安全防护)
- E2. 并发一致性: 25 条用例 (设备绑定、策略编辑、数据冲突)
- E3. 国际化兼容: 20 条用例 (中英切换、文本显示、格式适配)
- E4. 导出一致性: 15 条用例 (字段对齐、数据完整、格式正确)
- E5. 网络异常处理: 20 条用例 (超时重试、断网提示、兜底机制)
- E6. 性能压力测试: 15 条用例 (大数据导出、页面加载、并发访问)

---

## 第一批详细测试用例：A1. 设备管理 API (45 条)

| ID          | 模块     | 子模块/页面 | 角色       | 前置条件                    | 用例标题                  | 输入/操作                                                                  | 期望结果                                  | 等级 | 类型 | 关联接口/组件                        | 备注                                |
| ----------- | -------- | ----------- | ---------- | --------------------------- | ------------------------- | -------------------------------------------------------------------------- | ----------------------------------------- | ---- | ---- | ------------------------------------ | ----------------------------------- |
| DEV_API_001 | 设备管理 | 设备列表    | 门店店长   | 已登录，门店有设备数据      | 获取设备列表-正常流程     | GET /device/list?pageNum=1&pageSize=10                                     | 返回 200，data 包含设备列表，分页信息正确 | P0   | 功能 | DeviceController#getDeviceList       |                                     |
| DEV_API_002 | 设备管理 | 设备列表    | 门店店长   | 已登录                      | 获取设备列表-分页参数校验 | GET /device/list?pageNum=0&pageSize=0                                      | 返回 400，提示分页参数无效                | P1   | 边界 | DeviceController#getDeviceList       | pageNum 最小为 1，pageSize 最小为 1 |
| DEV_API_003 | 设备管理 | 设备列表    | 未登录用户 | 未登录状态                  | 获取设备列表-权限校验     | GET /device/list                                                           | 返回 401，提示未授权访问                  | P0   | 权限 | DeviceController#getDeviceList       |                                     |
| DEV_API_004 | 设备管理 | 设备列表    | 门店店长   | 已登录                      | 获取设备列表-筛选功能     | GET /device/list?deviceType=招牌灯&status=online                           | 返回 200，只包含在线招牌灯设备            | P1   | 功能 | DeviceController#getDeviceList       |                                     |
| DEV_API_005 | 设备管理 | 设备列表    | 门店店长   | 已登录，大量设备数据        | 获取设备列表-性能测试     | GET /device/list?pageSize=1000                                             | 3 秒内返回结果，数据完整                  | P2   | 性能 | DeviceController#getDeviceList       |                                     |
| DEV_API_006 | 设备管理 | 设备绑定    | 实施操作员 | 已登录，有设备 ID 和门店 ID | 设备绑定-正常流程         | POST /device/bind {deviceId:"DEV001",storeId:"STORE001"}                   | 返回 200，绑定成功，设备状态变为在线      | P0   | 功能 | DeviceController#bindDevice          |                                     |
| DEV_API_007 | 设备管理 | 设备绑定    | 实施操作员 | 已登录                      | 设备绑定-参数缺失         | POST /device/bind {deviceId:"DEV001"}                                      | 返回 400，提示 storeId 必填               | P0   | 边界 | DeviceController#bindDevice          |                                     |
| DEV_API_008 | 设备管理 | 设备绑定    | 实施操作员 | 设备已被绑定                | 设备绑定-重复绑定         | POST /device/bind {deviceId:"BOUND_DEV",storeId:"STORE001"}                | 返回 400，提示设备已被绑定                | P0   | 异常 | DeviceController#bindDevice          |                                     |
| DEV_API_009 | 设备管理 | 设备绑定    | 实施操作员 | 已登录                      | 设备绑定-设备 ID 不存在   | POST /device/bind {deviceId:"NOT_EXIST",storeId:"STORE001"}                | 返回 404，提示设备不存在                  | P1   | 异常 | DeviceController#bindDevice          |                                     |
| DEV_API_010 | 设备管理 | 设备绑定    | 实施操作员 | 已登录                      | 设备绑定-门店 ID 不存在   | POST /device/bind {deviceId:"DEV001",storeId:"NOT_EXIST"}                  | 返回 404，提示门店不存在                  | P1   | 异常 | DeviceController#bindDevice          |                                     |
| DEV_API_011 | 设备管理 | 设备绑定    | 实施操作员 | 两个操作员同时操作          | 设备绑定-并发冲突         | 同时 POST /device/bind 相同 deviceId                                       | 只有一个成功，另一个返回冲突错误          | P1   | 异常 | DeviceController#bindDevice          | 需要数据库乐观锁                    |
| DEV_API_012 | 设备管理 | 设备解绑    | 实施操作员 | 设备已绑定                  | 设备解绑-正常流程         | DELETE /device/unbind/DEV001?reason=设备故障                               | 返回 200，解绑成功，生成解绑日志          | P0   | 功能 | DeviceController#unbindDevice        |                                     |
| DEV_API_013 | 设备管理 | 设备解绑    | 实施操作员 | 已登录                      | 设备解绑-设备不存在       | DELETE /device/unbind/NOT_EXIST                                            | 返回 404，提示设备不存在                  | P1   | 异常 | DeviceController#unbindDevice        |                                     |
| DEV_API_014 | 设备管理 | 设备解绑    | 实施操作员 | 设备未绑定                  | 设备解绑-设备未绑定       | DELETE /device/unbind/UNBOUND_DEV                                          | 返回 400，提示设备未绑定                  | P1   | 异常 | DeviceController#unbindDevice        |                                     |
| DEV_API_015 | 设备管理 | 设备解绑    | 门店店长   | 设备已绑定到其他门店        | 设备解绑-跨门店操作       | DELETE /device/unbind/OTHER_STORE_DEV                                      | 返回 403，提示无权限操作其他门店设备      | P0   | 权限 | DeviceController#unbindDevice        |                                     |
| DEV_API_016 | 设备管理 | 设备状态    | 门店店长   | 设备已绑定                  | 获取设备状态-正常流程     | GET /device/status/DEV001                                                  | 返回 200，包含设备在线状态、信号强度等    | P0   | 功能 | DeviceController#getDeviceStatus     |                                     |
| DEV_API_017 | 设备管理 | 设备状态    | 门店店长   | 设备离线超过 5 分钟         | 获取设备状态-故障检测     | GET /device/status/OFFLINE_DEV                                             | 返回 200，status 为 fault，包含离线时长   | P0   | 功能 | DeviceController#getDeviceStatus     |                                     |
| DEV_API_018 | 设备管理 | 设备控制    | 门店店长   | 设备在线且支持控制          | 设备控制-开关操作         | POST /device/control {deviceId:"DEV001",command:"switch",value:true}       | 返回 200，设备执行开关操作                | P0   | 功能 | DeviceController#controlDevice       |                                     |
| DEV_API_019 | 设备管理 | 设备控制    | 门店店长   | 设备离线                    | 设备控制-设备离线         | POST /device/control {deviceId:"OFFLINE_DEV",command:"switch"}             | 返回 400，提示设备离线无法控制            | P1   | 异常 | DeviceController#controlDevice       |                                     |
| DEV_API_020 | 设备管理 | 设备控制    | 门店店长   | 设备在手动模式              | 设备控制-手动模式限制     | POST /device/control {deviceId:"MANUAL_DEV",command:"auto_mode"}           | 返回 400，提示设备在手动模式，需先退出    | P1   | 异常 | DeviceController#controlDevice       |                                     |
| DEV_API_021 | 设备管理 | 数据导出    | 门店店长   | 有设备数据                  | 设备数据导出-正常流程     | GET /device/export?format=excel                                            | 返回 Excel 文件，包含完整设备信息         | P1   | 功能 | DeviceController#exportDeviceData    |                                     |
| DEV_API_022 | 设备管理 | 数据导出    | 门店店长   | 有筛选条件                  | 设备数据导出-筛选导出     | GET /device/export?deviceType=招牌灯&format=excel                          | 返回 Excel 文件，只包含招牌灯设备         | P1   | 功能 | DeviceController#exportDeviceData    |                                     |
| DEV_API_023 | 设备管理 | 数据导出    | 门店店长   | 大量数据                    | 设备数据导出-大数据量     | GET /device/export 包含 10 万条数据                                        | 30 秒内完成导出，文件完整                 | P2   | 性能 | DeviceController#exportDeviceData    |                                     |
| DEV_API_024 | 设备管理 | 数据导出    | 门店店长   | 已登录                      | 设备数据导出-格式校验     | GET /device/export?format=invalid                                          | 返回 400，提示不支持的导出格式            | P2   | 边界 | DeviceController#exportDeviceData    |                                     |
| DEV_API_025 | 设备管理 | 设备详情    | 门店店长   | 设备已绑定                  | 获取设备详情-正常流程     | GET /device/detail/DEV001                                                  | 返回 200，包含设备完整信息和历史数据      | P1   | 功能 | DeviceController#getDeviceDetail     |                                     |
| DEV_API_026 | 设备管理 | 设备详情    | 门店店长   | 已登录                      | 获取设备详情-设备不存在   | GET /device/detail/NOT_EXIST                                               | 返回 404，提示设备不存在                  | P1   | 异常 | DeviceController#getDeviceDetail     |                                     |
| DEV_API_027 | 设备管理 | 设备更新    | 实施操作员 | 设备已绑定                  | 更新设备信息-正常流程     | PUT /device/update {id:"DEV001",name:"新设备名"}                           | 返回 200，设备信息更新成功                | P1   | 功能 | DeviceController#updateDevice        |                                     |
| DEV_API_028 | 设备管理 | 设备更新    | 实施操作员 | 已登录                      | 更新设备信息-名称重复     | PUT /device/update {id:"DEV001",name:"已存在的名称"}                       | 返回 400，提示设备名称已存在              | P1   | 边界 | DeviceController#updateDevice        |                                     |
| DEV_API_029 | 设备管理 | 设备更新    | 实施操作员 | 已登录                      | 更新设备信息-名称过长     | PUT /device/update {id:"DEV001",name:"超过 50 字符的设备名称..."}          | 返回 400，提示设备名称过长                | P2   | 边界 | DeviceController#updateDevice        |                                     |
| DEV_API_030 | 设备管理 | 批量操作    | 实施操作员 | 有多个设备                  | 批量绑定设备-正常流程     | POST /device/batch/bind {deviceIds:["DEV001","DEV002"],storeId:"STORE001"} | 返回 200，所有设备绑定成功                | P1   | 功能 | DeviceController#batchBindDevice     |                                     |
| DEV_API_031 | 设备管理 | 批量操作    | 实施操作员 | 部分设备已绑定              | 批量绑定设备-部分失败     | POST /device/batch/bind 包含已绑定设备                                     | 返回 207，返回成功和失败的设备列表        | P1   | 异常 | DeviceController#batchBindDevice     |                                     |
| DEV_API_032 | 设备管理 | 批量操作    | 实施操作员 | 有绑定的设备                | 批量解绑设备-正常流程     | POST /device/batch/unbind {deviceIds:["DEV001","DEV002"]}                  | 返回 200，所有设备解绑成功                | P1   | 功能 | DeviceController#batchUnbindDevice   |                                     |
| DEV_API_033 | 设备管理 | 设备统计    | 门店店长   | 门店有设备                  | 获取设备统计-按类型       | GET /device/statistics?groupBy=type                                        | 返回 200，按设备类型统计数量              | P1   | 功能 | DeviceController#getDeviceStatistics |                                     |
| DEV_API_034 | 设备管理 | 设备统计    | 门店店长   | 门店有设备                  | 获取设备统计-按状态       | GET /device/statistics?groupBy=status                                      | 返回 200，按设备状态统计数量              | P1   | 功能 | DeviceController#getDeviceStatistics |                                     |
| DEV_API_035 | 设备管理 | 设备统计    | 门店店长   | 门店有设备                  | 获取设备统计-时间范围     | GET /device/statistics?startDate=2024-01-01&endDate=2024-01-31             | 返回 200，指定时间范围内的设备统计        | P1   | 功能 | DeviceController#getDeviceStatistics |                                     |
| DEV_API_036 | 设备管理 | 设备日志    | 门店店长   | 设备有操作记录              | 获取设备日志-正常流程     | GET /device/logs/DEV001?pageNum=1&pageSize=10                              | 返回 200，包含设备操作日志                | P1   | 功能 | DeviceController#getDeviceLogs       |                                     |
| DEV_API_037 | 设备管理 | 设备日志    | 门店店长   | 设备有操作记录              | 获取设备日志-按类型筛选   | GET /device/logs/DEV001?logType=control                                    | 返回 200，只包含控制类型日志              | P2   | 功能 | DeviceController#getDeviceLogs       |                                     |
| DEV_API_038 | 设备管理 | 设备搜索    | 门店店长   | 门店有设备                  | 设备搜索-按名称           | GET /device/search?keyword=测试设备                                        | 返回 200，包含名称匹配的设备              | P1   | 功能 | DeviceController#searchDevice        |                                     |
| DEV_API_039 | 设备管理 | 设备搜索    | 门店店长   | 门店有设备                  | 设备搜索-按设备 ID        | GET /device/search?keyword=DEV001                                          | 返回 200，包含 ID 匹配的设备              | P1   | 功能 | DeviceController#searchDevice        |                                     |
| DEV_API_040 | 设备管理 | 设备搜索    | 门店店长   | 已登录                      | 设备搜索-无结果           | GET /device/search?keyword=不存在的设备                                    | 返回 200，data 为空数组                   | P2   | 边界 | DeviceController#searchDevice        |                                     |
| DEV_API_041 | 设备管理 | API 限流    | 门店店长   | 已登录                      | API 调用频率限制          | 1 秒内调用 100 次设备列表 API                                              | 部分请求返回 429，提示请求过于频繁        | P2   | 安全 | DeviceController#getDeviceList       |                                     |
| DEV_API_042 | 设备管理 | 数据校验    | 实施操作员 | 已登录                      | SQL 注入防护              | POST /device/bind {deviceId:"'; DROP TABLE devices; --"}                   | 返回 400，参数校验失败，数据库安全        | P0   | 安全 | DeviceController#bindDevice          |                                     |
| DEV_API_043 | 设备管理 | 数据校验    | 实施操作员 | 已登录                      | XSS 攻击防护              | POST /device/bind {deviceId:"<script>alert('xss')</script>"}               | 返回 400，参数校验失败                    | P1   | 安全 | DeviceController#bindDevice          |                                     |
| DEV_API_044 | 设备管理 | 超时处理    | 门店店长   | 数据库响应慢                | 接口超时处理              | GET /device/list (数据库响应超过 30 秒)                                    | 返回 504，提示服务超时                    | P1   | 异常 | DeviceController#getDeviceList       |                                     |
| DEV_API_045 | 设备管理 | 错误处理    | 门店店长   | 系统异常                    | 系统异常处理              | GET /device/list (系统内部错误)                                            | 返回 500，提示系统异常，记录错误日志      | P1   | 异常 | DeviceController#getDeviceList       |                                     |

---

## 测试执行说明

### 前置环境准备

1. 测试数据库：包含完整的门店、设备、用户数据
2. 测试账号：超级管理员、门店店长、实施操作员、普通用户各 1 个
3. 测试设备：每种类型设备至少 3 个（在线、离线、故障状态各 1 个）
4. 网络环境：稳定网络 + 弱网环境模拟

### API 测试工具

- 推荐使用：Postman + Newman (自动化)
- 或者：RestAssured + JUnit5 (Java 项目)
- 性能测试：JMeter

### 关键测试点

1. **权限校验**：每个接口都要验证角色权限
2. **参数校验**：必填参数、参数格式、参数范围
3. **业务逻辑**：设备状态流转、绑定解绑逻辑
4. **并发安全**：同一设备的并发操作
5. **异常处理**：网络异常、系统异常、业务异常

### 下一批预告

**第二批：A2. 门店管理 API (35 条用例)**

- 门店列表查询、门店详情、门店创建更新
- 门店设备统计、门店用电分析
- 门店权限管理、跨门店数据隔离

请确认第一批用例后，我将继续输出后续批次的详细测试用例。
