# 第二批详细测试用例：A2. 门店管理 API (35 条)

## 门店管理 API 测试用例详情

| ID            | 模块     | 子模块/页面 | 角色       | 前置条件               | 用例标题                | 输入/操作                                                                           | 期望结果                                          | 等级 | 类型 | 关联接口/组件                                                          | 备注                 |
| ------------- | -------- | ----------- | ---------- | ---------------------- | ----------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------- | ---- | ---- | ---------------------------------------------------------------------- | -------------------- |
| STORE_API_001 | 门店管理 | 门店列表    | 超级管理员 | 已登录，系统有门店数据 | 获取门店列表-正常流程   | GET /store/list?pageNum=1&pageSize=10                                               | 返回 200，data 包含门店列表，分页信息正确         | P0   | 功能 | StoreController#getStoreList                                           |                      |
| STORE_API_002 | 门店管理 | 门店列表    | 门店店长   | 已登录                 | 获取门店列表-权限隔离   | GET /store/list                                                                     | 返回 200，只包含当前用户管理的门店                | P0   | 权限 | StoreController#getStoreList                                           | 数据权限隔离         |
| STORE_API_003 | 门店管理 | 门店列表    | 超级管理员 | 已登录                 | 获取门店列表-地区筛选   | GET /store/list?province=广东省&city=深圳市                                         | 返回 200，只包含深圳市的门店                      | P1   | 功能 | StoreController#getStoreList                                           |                      |
| STORE_API_004 | 门店管理 | 门店列表    | 超级管理员 | 已登录                 | 获取门店列表-状态筛选   | GET /store/list?status=active                                                       | 返回 200，只包含激活状态门店                      | P1   | 功能 | StoreController#getStoreList                                           |                      |
| STORE_API_005 | 门店管理 | 门店列表    | 超级管理员 | 已登录，大量门店数据   | 获取门店列表-性能测试   | GET /store/list?pageSize=500                                                        | 3 秒内返回结果，数据完整                          | P2   | 性能 | StoreController#getStoreList                                           |                      |
| STORE_API_006 | 门店管理 | 门店详情    | 门店店长   | 门店已创建             | 获取门店详情-正常流程   | GET /store/detail/STORE001                                                          | 返回 200，包含门店基本信息、设备统计、用电数据    | P0   | 功能 | StoreController#getStoreDetail                                         |                      |
| STORE_API_007 | 门店管理 | 门店详情    | 门店店长   | 已登录                 | 获取门店详情-门店不存在 | GET /store/detail/NOT_EXIST                                                         | 返回 404，提示门店不存在                          | P1   | 异常 | StoreController#getStoreDetail                                         |                      |
| STORE_API_008 | 门店管理 | 门店详情    | 门店店长 A | 门店 B 已创建          | 获取门店详情-跨门店访问 | GET /store/detail/STORE_B                                                           | 返回 403，提示无权限访问其他门店                  | P0   | 权限 | StoreController#getStoreDetail                                         |                      |
| STORE_API_009 | 门店管理 | 门店创建    | 超级管理员 | 已登录，有完整门店信息 | 门店创建-正常流程       | POST /store/create {name:"新门店",address:"深圳市南山区",contact:"张三"}            | 返回 200，门店创建成功，生成门店 ID               | P0   | 功能 | StoreController#createStore                                            |                      |
| STORE_API_010 | 门店管理 | 门店创建    | 超级管理员 | 已登录                 | 门店创建-必填参数校验   | POST /store/create {name:"新门店"}                                                  | 返回 400，提示地址和联系人必填                    | P0   | 边界 | StoreController#createStore                                            |                      |
| STORE_API_011 | 门店管理 | 门店创建    | 超级管理员 | 已登录                 | 门店创建-名称重复       | POST /store/create {name:"已存在门店名"}                                            | 返回 400，提示门店名称已存在                      | P1   | 边界 | StoreController#createStore                                            |                      |
| STORE_API_012 | 门店管理 | 门店创建    | 门店店长   | 已登录                 | 门店创建-权限校验       | POST /store/create {name:"新门店"}                                                  | 返回 403，提示无权限创建门店                      | P0   | 权限 | StoreController#createStore                                            |                      |
| STORE_API_013 | 门店管理 | 门店更新    | 超级管理员 | 门店已存在             | 门店更新-正常流程       | PUT /store/update {id:"STORE001",name:"更新后门店名"}                               | 返回 200，门店信息更新成功                        | P1   | 功能 | StoreController#updateStore                                            |                      |
| STORE_API_014 | 门店管理 | 门店更新    | 门店店长   | 管理的门店已存在       | 门店更新-店长权限       | PUT /store/update {id:"MY_STORE",contact:"新联系人"}                                | 返回 200，允许更新部分信息                        | P1   | 权限 | StoreController#updateStore                                            | 店长只能更新联系信息 |
| STORE_API_015 | 门店管理 | 门店更新    | 门店店长 A | 门店 B 已存在          | 门店更新-跨门店操作     | PUT /store/update {id:"STORE_B",name:"新名称"}                                      | 返回 403，提示无权限更新其他门店                  | P0   | 权限 | StoreController#updateStore                                            |                      |
| STORE_API_016 | 门店管理 | 门店删除    | 超级管理员 | 门店已存在且无设备     | 门店删除-正常流程       | DELETE /store/delete/EMPTY_STORE                                                    | 返回 200，门店删除成功                            | P1   | 功能 | StoreController#deleteStore                                            |                      |
| STORE_API_017 | 门店管理 | 门店删除    | 超级管理员 | 门店有绑定设备         | 门店删除-有设备限制     | DELETE /store/delete/STORE_WITH_DEVICES                                             | 返回 400，提示门店有设备无法删除                  | P1   | 边界 | StoreController#deleteStore                                            |                      |
| STORE_API_018 | 门店管理 | 门店删除    | 门店店长   | 门店已存在             | 门店删除-权限校验       | DELETE /store/delete/MY_STORE                                                       | 返回 403，提示无权限删除门店                      | P0   | 权限 | StoreController#deleteStore                                            |                      |
| STORE_API_019 | 门店管理 | 设备统计    | 门店店长   | 门店有设备             | 门店设备统计-按类型     | GET /store/STORE001/device/statistics?groupBy=type                                  | 返回 200，按设备类型统计数量和状态                | P1   | 功能 | StoreController#getDeviceStatistics                                    |                      |
| STORE_API_020 | 门店管理 | 设备统计    | 门店店长   | 门店有设备             | 门店设备统计-按状态     | GET /store/STORE001/device/statistics?groupBy=status                                | 返回 200，按设备状态统计数量                      | P1   | 功能 | StoreController#getDeviceStatistics                                    |                      |
| STORE_API_021 | 门店管理 | 用电分析    | 门店店长   | 门店有用电数据         | 门店用电分析-日统计     | GET /store/STORE001/energy/analysis?period=day&date=2024-01-15                      | 返回 200，包含当日各时段用电量                    | P1   | 功能 | StoreController#getEnergyAnalysis                                      |                      |
| STORE_API_022 | 门店管理 | 用电分析    | 门店店长   | 门店有用电数据         | 门店用电分析-月统计     | GET /store/STORE001/energy/analysis?period=month&date=2024-01                       | 返回 200，包含当月每日用电量                      | P1   | 功能 | StoreController#getEnergyAnalysis                                      |                      |
| STORE_API_023 | 门店管理 | 用电分析    | 门店店长   | 门店有用电数据         | 门店用电分析-节能计算   | GET /store/STORE001/energy/analysis?includeStrategy=true                            | 返回 200，包含策略节能数据：节约电量=总电量 ×20%  | P0   | 功能 | StoreController#getEnergyAnalysis                                      | 关键业务逻辑         |
| STORE_API_024 | 门店管理 | 用电分析    | 门店店长   | 门店无用电数据         | 门店用电分析-无数据     | GET /store/EMPTY_STORE/energy/analysis                                              | 返回 200，data 为空，提示暂无用电数据             | P2   | 边界 | StoreController#getEnergyAnalysis                                      |                      |
| STORE_API_025 | 门店管理 | 数据导出    | 门店店长   | 门店有完整数据         | 门店数据导出-完整报告   | GET /store/STORE001/export?type=full                                                | 返回 Excel 文件，包含门店信息、设备列表、用电分析 | P1   | 功能 | StoreController#exportStoreData                                        |                      |
| STORE_API_026 | 门店管理 | 数据导出    | 门店店长   | 门店有设备数据         | 门店数据导出-设备报告   | GET /store/STORE001/export?type=device                                              | 返回 Excel 文件，只包含设备相关数据               | P1   | 功能 | StoreController#exportStoreData                                        |                      |
| STORE_API_027 | 门店管理 | 数据导出    | 门店店长   | 门店有用电数据         | 门店数据导出-用电报告   | GET /store/STORE001/export?type=energy&startDate=2024-01-01&endDate=2024-01-31      | 返回 Excel 文件，包含指定时间段用电数据           | P1   | 功能 | StoreController#exportStoreData                                        |                      |
| STORE_API_028 | 门店管理 | 数据导出    | 门店店长   | 大量历史数据           | 门店数据导出-大数据量   | GET /store/STORE001/export?type=energy&startDate=2023-01-01&endDate=2024-01-31      | 30 秒内完成导出，文件大小合理                     | P2   | 性能 | StoreController#exportStoreData                                        |                      |
| STORE_API_029 | 门店管理 | 门店搜索    | 超级管理员 | 系统有多个门店         | 门店搜索-按名称         | GET /store/search?keyword=测试门店                                                  | 返回 200，包含名称匹配的门店                      | P1   | 功能 | StoreController#searchStore                                            |                      |
| STORE_API_030 | 门店管理 | 门店搜索    | 超级管理员 | 系统有多个门店         | 门店搜索-按地址         | GET /store/search?keyword=深圳市                                                    | 返回 200，包含地址匹配的门店                      | P1   | 功能 | StoreController#searchStore                                            |                      |
| STORE_API_031 | 门店管理 | 门店搜索    | 超级管理员 | 已登录                 | 门店搜索-无结果         | GET /store/search?keyword=不存在的门店                                              | 返回 200，data 为空数组                           | P2   | 边界 | StoreController#searchStore                                            |                      |
| STORE_API_032 | 门店管理 | 批量操作    | 超级管理员 | 有多个门店             | 批量更新门店状态        | POST /store/batch/updateStatus {storeIds:["STORE001","STORE002"],status:"inactive"} | 返回 200，所有门店状态更新成功                    | P1   | 功能 | StoreController#batchUpdateStatus                                      |                      |
| STORE_API_033 | 门店管理 | 批量操作    | 超级管理员 | 部分门店有设备         | 批量删除门店-部分失败   | POST /store/batch/delete {storeIds:["EMPTY_STORE","STORE_WITH_DEVICES"]}            | 返回 207，返回成功和失败的门店列表                | P1   | 异常 | StoreController#batchDeleteStore                                       |                      |
| STORE_API_034 | 门店管理 | 数据一致性  | 门店店长   | 门店有实时数据变化     | 门店统计数据一致性      | 同时调用设备统计和用电分析 API                                                      | 两个接口返回的设备数量一致                        | P1   | 功能 | StoreController#getDeviceStatistics, StoreController#getEnergyAnalysis | 数据一致性校验       |
| STORE_API_035 | 门店管理 | 并发安全    | 两个管理员 | 同一门店               | 门店信息并发更新        | 同时 PUT /store/update 相同门店 ID                                                  | 后更新的请求提示数据已被修改，需要刷新            | P1   | 异常 | StoreController#updateStore                                            | 乐观锁机制           |

---

## 门店管理关键测试场景

### 1. 数据权限隔离测试

- **场景**: 门店店长只能访问自己管理的门店数据
- **验证点**:
  - 门店列表只显示有权限的门店
  - 门店详情 API 跨门店访问被拒绝
  - 统计数据不包含其他门店信息

### 2. 驾驶舱数据一致性测试

- **场景**: 门店驾驶舱显示的统计数据必须一致
- **验证点**:
  - 设备统计数量与实际设备列表一致
  - 用电分析中的设备数量与设备统计一致
  - 节能计算公式：节约电量 = 四类设备总电量 × 20%

### 3. 级联地区选择测试

- **场景**: 门店创建时的地区选择功能
- **验证点**:
  - 国家 → 省/城市 → 区县 → 门店的级联逻辑
  - 最后一级支持多选，其他级别单选
  - 门店列表来自 `/ems/hs/store/getStoreInfoList` 接口
  - 选择完成后正确带回门店 ID 集合

### 4. 导出数据一致性测试

- **场景**: 导出的 Excel 数据与页面显示数据一致
- **验证点**:
  - 导出字段与页面表格字段对应
  - 筛选条件在导出时生效
  - 大数据量导出的性能和完整性

### 5. 门店生命周期测试

- **场景**: 门店从创建到删除的完整流程
- **验证点**:
  - 创建门店后自动生成唯一 ID
  - 门店有设备时无法删除
  - 删除门店后相关数据清理

---

## 测试数据准备

### 门店测试数据

```json
{
  "stores": [
    {
      "id": "STORE001",
      "name": "测试门店A",
      "address": "深圳市南山区科技园",
      "province": "广东省",
      "city": "深圳市",
      "district": "南山区",
      "contact": "张三",
      "phone": "13800138001",
      "status": "active",
      "deviceCount": 15,
      "onlineDeviceCount": 12
    },
    {
      "id": "STORE002",
      "name": "测试门店B",
      "address": "上海市浦东新区陆家嘴",
      "province": "上海市",
      "city": "上海市",
      "district": "浦东新区",
      "contact": "李四",
      "phone": "13800138002",
      "status": "active",
      "deviceCount": 8,
      "onlineDeviceCount": 7
    }
  ]
}
```

### 用电数据测试样本

```json
{
  "energyData": {
    "storeId": "STORE001",
    "date": "2024-01-15",
    "totalEnergy": 1000,
    "deviceEnergy": {
      "signLight": 200,
      "lighting": 300,
      "airCondition": 400,
      "coldDevice": 100
    },
    "savedEnergy": 200,
    "hourlyData": [
      { "hour": "00:00", "energy": 45 },
      { "hour": "01:00", "energy": 42 }
    ]
  }
}
```

---

## 下一批预告

**第三批：A3. 策略管理 API (40 条用例)**

- 策略创建、启用、编辑、停用、删除
- 招牌灯日出日落+光照死区策略
- 空调温度死区+联动源配置
- 策略冲突检测和传感器依赖校验

请确认第二批用例后，我将继续输出第三批详细测试用例。
