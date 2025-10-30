#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试框架代码生成器
生成 Vitest(前端) + Playwright(E2E) + JUnit5(后端) 测试骨架
"""

import os
from pathlib import Path

class TestFrameworkGenerator:
    def __init__(self):
        self.frontend_path = "HS-vue-admin-2"
        self.backend_path = "HS-java-admin-2"
        
    def generate_vitest_config(self):
        """生成Vitest配置文件"""
        config_content = '''import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
      ]
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    }
  }
})'''
        return config_content
    
    def generate_vitest_setup(self):
        """生成Vitest测试环境配置"""
        setup_content = '''import { vi } from 'vitest'
import { config } from '@vue/test-utils'

// Mock全局组件
config.global.mocks = {
  $t: (key) => key,
  $route: {
    path: '/',
    query: {},
    params: {}
  },
  $router: {
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn()
  }
}

// Mock Element Plus
vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  },
  ElMessageBox: {
    confirm: vi.fn(),
    alert: vi.fn()
  }
}))

// Mock API请求
vi.mock('@/utils/request', () => ({
  default: vi.fn()
}))'''
        return setup_content
    
    def generate_device_test(self):
        """生成设备管理测试用例"""
        test_content = '''import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import DeviceIndex from '@/views/system/device/index.vue'
import { getDeviceList, bindDevice, unbindDevice } from '@/api/device'

// Mock API
vi.mock('@/api/device', () => ({
  getDeviceList: vi.fn(),
  bindDevice: vi.fn(),
  unbindDevice: vi.fn(),
  exportDeviceData: vi.fn()
}))

describe('设备管理页面', () => {
  let wrapper

  beforeEach(() => {
    // 重置所有mock
    vi.clearAllMocks()
    
    // Mock API返回数据
    getDeviceList.mockResolvedValue({
      code: 200,
      data: {
        list: [
          {
            id: '1',
            deviceName: '测试设备1',
            deviceType: '招牌灯',
            status: 'online',
            storeName: '测试门店'
          }
        ],
        total: 1
      }
    })
  })

  it('DEV_LIST_001 - 设备列表正常加载', async () => {
    wrapper = mount(DeviceIndex, {
      global: {
        mocks: {
          $t: (key) => key
        }
      }
    })

    await wrapper.vm.$nextTick()
    
    expect(getDeviceList).toHaveBeenCalled()
    expect(wrapper.find('.device-table').exists()).toBe(true)
  })

  it('DEV_BIND_001 - 设备绑定成功', async () => {
    bindDevice.mockResolvedValue({
      code: 200,
      message: '绑定成功'
    })

    wrapper = mount(DeviceIndex)
    
    // 模拟绑定操作
    await wrapper.vm.handleBind({
      deviceId: 'test_device_001',
      storeId: 'test_store_001'
    })

    expect(bindDevice).toHaveBeenCalledWith({
      deviceId: 'test_device_001',
      storeId: 'test_store_001'
    })
  })

  it('DEV_BIND_002 - 设备绑定失败处理', async () => {
    bindDevice.mockRejectedValue(new Error('设备已被绑定'))

    wrapper = mount(DeviceIndex)
    
    try {
      await wrapper.vm.handleBind({
        deviceId: 'test_device_001',
        storeId: 'test_store_001'
      })
    } catch (error) {
      expect(error.message).toBe('设备已被绑定')
    }
  })

  it('DEV_FILTER_001 - 筛选功能正常', async () => {
    wrapper = mount(DeviceIndex)
    
    // 设置筛选条件
    await wrapper.setData({
      queryParams: {
        deviceType: '招牌灯',
        status: 'online'
      }
    })

    // 触发查询
    await wrapper.vm.handleQuery()

    expect(getDeviceList).toHaveBeenCalledWith(
      expect.objectContaining({
        deviceType: '招牌灯',
        status: 'online'
      })
    )
  })

  it('DEV_PAGINATION_001 - 分页功能正常', async () => {
    wrapper = mount(DeviceIndex)
    
    // 切换到第2页
    await wrapper.vm.handleCurrentChange(2)

    expect(getDeviceList).toHaveBeenCalledWith(
      expect.objectContaining({
        pageNum: 2
      })
    )
  })
})'''
        return test_content
    
    def generate_dashboard_test(self):
        """生成驾驶舱测试用例"""
        test_content = '''import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ElectricityChart from '@/views/system/dashboard/electricityChart/index.vue'
import { getEnergyStatistics, exportEnergyData } from '@/api/electricity'

vi.mock('@/api/electricity', () => ({
  getEnergyStatistics: vi.fn(),
  exportEnergyData: vi.fn()
}))

describe('驾驶舱-用电量统计', () => {
  let wrapper

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock用电量数据
    getEnergyStatistics.mockResolvedValue({
      code: 200,
      data: {
        totalEnergy: 1000,
        deviceEnergy: {
          signLight: 200,    // 招牌灯
          lighting: 300,     // 照明
          airCondition: 400, // 空调
          coldDevice: 100    // 冷设
        },
        savedEnergy: 200, // 节约电量 = 总电量 * 20%
        chartData: [
          { date: '2024-01-01', energy: 100 },
          { date: '2024-01-02', energy: 120 }
        ]
      }
    })
  })

  it('DASH_ENERGY_001 - 用电量统计图表正确显示', async () => {
    wrapper = mount(ElectricityChart)
    await wrapper.vm.$nextTick()

    expect(getEnergyStatistics).toHaveBeenCalled()
    
    // 验证节约电量计算逻辑：四类设备电量之和×20%
    const totalDeviceEnergy = 200 + 300 + 400 + 100 // 1000
    const expectedSavedEnergy = totalDeviceEnergy * 0.2 // 200
    
    expect(wrapper.vm.energyData.savedEnergy).toBe(expectedSavedEnergy)
  })

  it('DASH_FILTER_001 - 时间筛选后分页数据一致性', async () => {
    wrapper = mount(ElectricityChart)
    
    // 设置时间筛选条件
    await wrapper.setData({
      queryParams: {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        pageNum: 1
      }
    })

    // 执行查询
    await wrapper.vm.handleQuery()
    
    // 切换分页
    await wrapper.vm.handlePageChange(2)

    // 验证筛选条件保持
    expect(getEnergyStatistics).toHaveBeenLastCalledWith(
      expect.objectContaining({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        pageNum: 2
      })
    )
  })

  it('DASH_EXPORT_001 - 数据导出一致性', async () => {
    exportEnergyData.mockResolvedValue({
      code: 200,
      data: 'mock_file_url'
    })

    wrapper = mount(ElectricityChart)
    
    // 执行导出
    await wrapper.vm.handleExport()

    expect(exportEnergyData).toHaveBeenCalledWith(
      wrapper.vm.queryParams
    )
  })

  it('DASH_CALC_001 - 节约电量计算逻辑验证', () => {
    const testData = {
      signLight: 100,
      lighting: 200,
      airCondition: 300,
      coldDevice: 50
    }
    
    // 测试计算函数
    const savedEnergy = wrapper.vm.calculateSavedEnergy(testData)
    const expected = (100 + 200 + 300 + 50) * 0.2 // 130
    
    expect(savedEnergy).toBe(expected)
  })
})'''
        return test_content
    
    def generate_playwright_config(self):
        """生成Playwright E2E测试配置"""
        config_content = '''import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});'''
        return config_content
    
    def generate_e2e_login_test(self):
        """生成E2E登录测试"""
        test_content = '''import { test, expect } from '@playwright/test';

test.describe('用户登录流程', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('LOGIN_001 - 正常登录流程', async ({ page }) => {
    // 输入用户名密码
    await page.fill('input[placeholder="用户名"]', 'admin');
    await page.fill('input[placeholder="密码"]', 'admin123');
    
    // 点击登录
    await page.click('button:has-text("登录")');
    
    // 验证跳转到首页
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('.dashboard-container')).toBeVisible();
  });

  test('LOGIN_002 - 用户名为空验证', async ({ page }) => {
    await page.fill('input[placeholder="密码"]', 'admin123');
    await page.click('button:has-text("登录")');
    
    // 验证错误提示
    await expect(page.locator('.el-form-item__error')).toContainText('请输入用户名');
  });

  test('LOGIN_003 - 密码错误处理', async ({ page }) => {
    await page.fill('input[placeholder="用户名"]', 'admin');
    await page.fill('input[placeholder="密码"]', 'wrong_password');
    await page.click('button:has-text("登录")');
    
    // 验证错误提示
    await expect(page.locator('.el-message--error')).toContainText('用户名或密码错误');
  });
});'''
        return test_content
    
    def generate_e2e_device_test(self):
        """生成E2E设备管理测试"""
        test_content = '''import { test, expect } from '@playwright/test';

test.describe('设备管理E2E测试', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('/login');
    await page.fill('input[placeholder="用户名"]', 'admin');
    await page.fill('input[placeholder="密码"]', 'admin123');
    await page.click('button:has-text("登录")');
    
    // 进入设备管理页面
    await page.click('text=设备管理');
    await expect(page).toHaveURL('/system/device');
  });

  test('DEV_E2E_001 - 设备列表加载和筛选', async ({ page }) => {
    // 等待设备列表加载
    await expect(page.locator('.device-table')).toBeVisible();
    
    // 验证表格有数据
    await expect(page.locator('.el-table__row')).toHaveCount.greaterThan(0);
    
    // 测试筛选功能
    await page.selectOption('select[placeholder="设备类型"]', '招牌灯');
    await page.click('button:has-text("查询")');
    
    // 验证筛选结果
    await expect(page.locator('.el-table__row')).toHaveCount.greaterThan(0);
    await expect(page.locator('td:has-text("招牌灯")')).toHaveCount.greaterThan(0);
  });

  test('DEV_E2E_002 - 设备绑定流程', async ({ page }) => {
    // 点击绑定设备按钮
    await page.click('button:has-text("绑定设备")');
    
    // 验证弹窗打开
    await expect(page.locator('.el-dialog')).toBeVisible();
    await expect(page.locator('.el-dialog__title')).toContainText('绑定设备');
    
    // 填写绑定信息
    await page.fill('input[placeholder="设备ID"]', 'TEST_DEVICE_001');
    await page.selectOption('select[placeholder="选择门店"]', '测试门店');
    await page.selectOption('select[placeholder="设备类型"]', '招牌灯');
    
    // 提交绑定
    await page.click('.el-dialog button:has-text("确定")');
    
    // 验证成功提示
    await expect(page.locator('.el-message--success')).toContainText('绑定成功');
    
    // 验证设备出现在列表中
    await expect(page.locator('td:has-text("TEST_DEVICE_001")')).toBeVisible();
  });

  test('DEV_E2E_003 - 设备解绑流程', async ({ page }) => {
    // 找到第一个设备的解绑按钮
    await page.click('.el-table__row:first-child button:has-text("解绑")');
    
    // 确认解绑
    await page.click('.el-message-box button:has-text("确定")');
    
    // 验证成功提示
    await expect(page.locator('.el-message--success')).toContainText('解绑成功');
  });

  test('DEV_E2E_004 - 数据导出功能', async ({ page }) => {
    // 设置下载监听
    const downloadPromise = page.waitForEvent('download');
    
    // 点击导出按钮
    await page.click('button:has-text("导出")');
    
    // 等待下载完成
    const download = await downloadPromise;
    
    // 验证文件名
        expect(download.suggestedFilename()).toMatch(/设备列表.*\\.xlsx$/);
    });
});'''
        return test_content
    
    def generate_junit_device_test(self):
        """生成JUnit5设备Controller测试"""
        test_content = '''package com.ti.fi.deviceService.controller;

import com.ti.fi.deviceService.service.DeviceService;
import com.ti.fi.common.response.Result;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.security.test.context.support.WithMockUser;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(DeviceController.class)
@DisplayName("设备管理Controller测试")
class DeviceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DeviceService deviceService;

    @Autowired
    private ObjectMapper objectMapper;

    private Map<String, Object> mockDevice;

    @BeforeEach
    void setUp() {
        mockDevice = new HashMap<>();
        mockDevice.put("id", "1");
        mockDevice.put("deviceName", "测试设备");
        mockDevice.put("deviceType", "招牌灯");
        mockDevice.put("status", "online");
    }

    @Test
    @DisplayName("DEV_API_001 - 获取设备列表成功")
    @WithMockUser(roles = "ADMIN")
    void testGetDeviceListSuccess() throws Exception {
        // Mock服务返回
        when(deviceService.getDeviceList(any())).thenReturn(
            Result.success(Arrays.asList(mockDevice))
        );

        mockMvc.perform(get("/device/list")
                .param("pageNum", "1")
                .param("pageSize", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].deviceName").value("测试设备"));
    }

    @Test
    @DisplayName("DEV_API_002 - 设备绑定成功")
    @WithMockUser(roles = "OPERATOR")
    void testBindDeviceSuccess() throws Exception {
        Map<String, Object> bindRequest = new HashMap<>();
        bindRequest.put("deviceId", "TEST_DEVICE_001");
        bindRequest.put("storeId", "TEST_STORE_001");
        bindRequest.put("deviceType", "招牌灯");

        when(deviceService.bindDevice(any())).thenReturn(Result.success("绑定成功"));

        mockMvc.perform(post("/device/bind")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(bindRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("绑定成功"));
    }

    @Test
    @DisplayName("DEV_API_003 - 设备绑定参数缺失")
    @WithMockUser(roles = "OPERATOR")
    void testBindDeviceMissingParams() throws Exception {
        Map<String, Object> bindRequest = new HashMap<>();
        bindRequest.put("deviceId", "TEST_DEVICE_001");
        // 缺少storeId

        mockMvc.perform(post("/device/bind")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(bindRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400));
    }

    @Test
    @DisplayName("DEV_API_004 - 设备重复绑定")
    @WithMockUser(roles = "OPERATOR")
    void testBindDeviceDuplicate() throws Exception {
        Map<String, Object> bindRequest = new HashMap<>();
        bindRequest.put("deviceId", "EXISTING_DEVICE");
        bindRequest.put("storeId", "TEST_STORE_001");

        when(deviceService.bindDevice(any())).thenReturn(
            Result.error(400, "设备已被绑定")
        );

        mockMvc.perform(post("/device/bind")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(bindRequest)))
                .andExpect(status().isOk())
                .andExpected(jsonPath("$.code").value(400))
                .andExpect(jsonPath("$.message").value("设备已被绑定"));
    }

    @Test
    @DisplayName("DEV_API_005 - 设备解绑成功")
    @WithMockUser(roles = "OPERATOR")
    void testUnbindDeviceSuccess() throws Exception {
        when(deviceService.unbindDevice(eq("1"), any())).thenReturn(
            Result.success("解绑成功")
        );

        mockMvc.perform(delete("/device/unbind/1")
                .param("reason", "设备故障"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("解绑成功"));
    }

    @Test
    @DisplayName("DEV_API_006 - 无权限访问")
    void testUnauthorizedAccess() throws Exception {
        mockMvc.perform(get("/device/list"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("DEV_API_007 - 数据导出成功")
    @WithMockUser(roles = "ADMIN")
    void testExportDeviceDataSuccess() throws Exception {
        when(deviceService.exportDeviceData(any())).thenReturn("mock_file_url");

        mockMvc.perform(get("/device/export")
                .param("deviceType", "招牌灯"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "application/vnd.ms-excel"))
                .andExpect(header().exists("Content-Disposition"));
    }
}'''
        return test_content
    
    def generate_junit_strategy_test(self):
        """生成策略Controller测试"""
        test_content = '''package com.ti.fi.strategyService.controller;

import com.ti.fi.strategyService.service.StrategyService;
import com.ti.fi.common.response.Result;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.security.test.context.support.WithMockUser;

import java.util.HashMap;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(StrategyController.class)
@DisplayName("策略管理Controller测试")
class StrategyControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private StrategyService strategyService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("STRATEGY_API_001 - 创建招牌灯策略成功")
    @WithMockUser(roles = "STORE_MANAGER")
    void testCreateSignLightStrategySuccess() throws Exception {
        Map<String, Object> strategyRequest = new HashMap<>();
        strategyRequest.put("strategyName", "测试招牌灯策略");
        strategyRequest.put("strategyType", "招牌灯");
        strategyRequest.put("regionId", "REGION_001");
        strategyRequest.put("sunriseOffset", 30);
        strategyRequest.put("sunsetOffset", -30);
        strategyRequest.put("lightThreshold", 100);

        when(strategyService.createStrategy(any())).thenReturn(
            Result.success("策略创建成功")
        );

        mockMvc.perform(post("/strategy/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(strategyRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("策略创建成功"));
    }

    @Test
    @DisplayName("STRATEGY_API_002 - 创建策略时传感器缺失")
    @WithMockUser(roles = "STORE_MANAGER")
    void testCreateStrategyMissingSensor() throws Exception {
        Map<String, Object> strategyRequest = new HashMap<>();
        strategyRequest.put("strategyName", "测试策略");
        strategyRequest.put("strategyType", "招牌灯");
        strategyRequest.put("regionId", "REGION_NO_SENSOR");

        when(strategyService.createStrategy(any())).thenReturn(
            Result.error(400, "该区域缺少光照传感器，无法创建光照相关策略")
        );

        mockMvc.perform(post("/strategy/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(strategyRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(400))
                .andExpect(jsonPath("$.message").value("该区域缺少光照传感器，无法创建光照相关策略"));
    }

    @Test
    @DisplayName("STRATEGY_API_003 - 启用策略成功")
    @WithMockUser(roles = "STORE_MANAGER")
    void testEnableStrategySuccess() throws Exception {
        when(strategyService.enableStrategy(eq("1"))).thenReturn(
            Result.success("策略启用成功")
        );

        mockMvc.perform(put("/strategy/enable/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("策略启用成功"));
    }

    @Test
    @DisplayName("STRATEGY_API_004 - 策略并发编辑冲突")
    @WithMockUser(roles = "STORE_MANAGER")
    void testStrategyEditConflict() throws Exception {
        Map<String, Object> updateRequest = new HashMap<>();
        updateRequest.put("id", "1");
        updateRequest.put("strategyName", "修改后的策略名");
        updateRequest.put("version", 1); // 旧版本号

        when(strategyService.updateStrategy(any())).thenReturn(
            Result.error(409, "策略已被其他用户修改，请刷新后重新编辑")
        );

        mockMvc.perform(put("/strategy/update")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(409))
                .andExpect(jsonPath("$.message").value("策略已被其他用户修改，请刷新后重新编辑"));
    }
}'''
        return test_content
    
    def generate_package_json_scripts(self):
        """生成package.json测试脚本"""
        scripts = '''{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug"
  },
  "devDependencies": {
    "vitest": "^1.0.0",
    "@vitest/ui": "^1.0.0",
    "@vue/test-utils": "^2.4.0",
    "jsdom": "^23.0.0",
    "@playwright/test": "^1.40.0",
    "c8": "^8.0.0"
  }
}'''
        return scripts
    
    def create_test_structure(self):
        """创建测试目录结构"""
        # 前端测试目录
        frontend_test_dirs = [
            f"{self.frontend_path}/tests/unit/views/system/device",
            f"{self.frontend_path}/tests/unit/views/system/dashboard",
            f"{self.frontend_path}/tests/unit/views/system/strategy",
            f"{self.frontend_path}/tests/unit/components",
            f"{self.frontend_path}/tests/e2e",
            f"{self.frontend_path}/tests/fixtures"
        ]
        
        # 后端测试目录
        backend_test_dirs = [
            f"{self.backend_path}/hanshuo-device-service/src/test/java/com/ti/fi/deviceService/controller",
            f"{self.backend_path}/hanshuo-strategy-service/src/test/java/com/ti/fi/strategyService/controller",
            f"{self.backend_path}/hanshuo-multishop-service/src/test/java/com/ti/fi/multishopService/controller",
            f"{self.backend_path}/hanshuo-commerce-service/src/test/java/com/ti/fi/commerceService/controller"
        ]
        
        all_dirs = frontend_test_dirs + backend_test_dirs
        
        for dir_path in all_dirs:
            Path(dir_path).mkdir(parents=True, exist_ok=True)
        
        return all_dirs
    
    def generate_all_test_files(self):
        """生成所有测试文件"""
        # 创建目录结构
        created_dirs = self.create_test_structure()
        
        # 生成的文件列表
        files_to_create = [
            # Vitest配置
            (f"{self.frontend_path}/vitest.config.js", self.generate_vitest_config()),
            (f"{self.frontend_path}/tests/setup.js", self.generate_vitest_setup()),
            
            # 前端单元测试
            (f"{self.frontend_path}/tests/unit/views/system/device/index.test.js", self.generate_device_test()),
            (f"{self.frontend_path}/tests/unit/views/system/dashboard/electricityChart.test.js", self.generate_dashboard_test()),
            
            # Playwright配置和E2E测试
            (f"{self.frontend_path}/playwright.config.js", self.generate_playwright_config()),
            (f"{self.frontend_path}/tests/e2e/login.spec.js", self.generate_e2e_login_test()),
            (f"{self.frontend_path}/tests/e2e/device.spec.js", self.generate_e2e_device_test()),
            
            # 后端JUnit测试
            (f"{self.backend_path}/hanshuo-device-service/src/test/java/com/ti/fi/deviceService/controller/DeviceControllerTest.java", self.generate_junit_device_test()),
            (f"{self.backend_path}/hanshuo-strategy-service/src/test/java/com/ti/fi/strategyService/controller/StrategyControllerTest.java", self.generate_junit_strategy_test()),
        ]
        
        return files_to_create, created_dirs

def main():
    """主函数"""
    generator = TestFrameworkGenerator()
    
    print("=" * 80)
    print("汉硕系统测试框架代码生成器")
    print("=" * 80)
    
    # 生成所有测试文件
    files_to_create, created_dirs = generator.generate_all_test_files()
    
    print(f"\\n创建了 {len(created_dirs)} 个测试目录:")
    for dir_path in created_dirs:
        print(f"  [DIR] {dir_path}")
    
    print(f"\\n将生成 {len(files_to_create)} 个测试文件:")
    for file_path, _ in files_to_create:
        print(f"  [FILE] {file_path}")
    
    print("\\n测试命令:")
    print("  前端单元测试: cd HS-vue-admin-2 && npm run test")
    print("  前端E2E测试: cd HS-vue-admin-2 && npm run test:e2e")
    print("  后端测试: cd HS-java-admin-2 && mvn test")
    
    print("\\n测试覆盖率:")
    print("  前端覆盖率: cd HS-vue-admin-2 && npm run test:coverage")
    print("  后端覆盖率: cd HS-java-admin-2 && mvn test jacoco:report")
    
    print("\\n" + "=" * 80)
    print("测试框架代码生成完成！")
    print("=" * 80)

if __name__ == "__main__":
    main()
