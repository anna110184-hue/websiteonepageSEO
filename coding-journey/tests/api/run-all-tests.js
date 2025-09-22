#!/usr/bin/env node

// 執行所有 API 測試
// 使用方法: node run-all-tests.js

import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import { fileURLToPath } from 'url'

const execAsync = promisify(exec)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🧪 塔羅牌應用 API 測試套件')
console.log('=' .repeat(50))

async function runTest(testName, testFile) {
  console.log(`\n🚀 開始執行: ${testName}`)
  console.log('-'.repeat(30))

  try {
    const { stdout, stderr } = await execAsync(`node ${path.join(__dirname, testFile)}`)

    if (stdout) {
      console.log(stdout)
    }

    if (stderr) {
      console.error('⚠️  警告輸出:', stderr)
    }

    console.log(`✅ ${testName} 測試完成`)

  } catch (error) {
    console.error(`❌ ${testName} 測試失敗:`)
    console.error('錯誤輸出:', error.stdout || error.message)
    if (error.stderr) {
      console.error('錯誤詳情:', error.stderr)
    }
  }
}

async function runAllTests() {
  console.log('🔧 環境檢查...')

  // 檢查環境變數
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.error('❌ 缺少必要的環境變數:')
    console.error('   SUPABASE_URL - Supabase 項目 URL')
    console.error('   SUPABASE_ANON_KEY - Supabase 匿名金鑰')
    console.error('\n請確保已設置 .env 檔案')
    process.exit(1)
  }

  console.log('✅ 環境變數檢查通過')
  console.log(`🔗 Supabase URL: ${process.env.SUPABASE_URL}`)

  const tests = [
    {
      name: '每日卡片 API 測試',
      file: 'test-daily-card-api.js'
    },
    {
      name: '三卡占卜 API 測試',
      file: 'test-three-card-reading-api.js'
    }
  ]

  console.log(`\n📋 準備執行 ${tests.length} 個測試套件\n`)

  for (const test of tests) {
    await runTest(test.name, test.file)

    // 在測試之間稍作停頓
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  console.log('\n' + '='.repeat(50))
  console.log('🎉 所有測試執行完成!')
  console.log('\n📊 測試結果摘要:')
  console.log('   🗓️  每日卡片 API - GET/POST/PUT 端點')
  console.log('   🔮 三卡占卜 API - 完整占卜流程')
  console.log('   👤 用戶認證系統 - JWT 驗證')
  console.log('   🗄️  資料庫操作 - CRUD 功能')

  console.log('\n💡 後續步驟:')
  console.log('   1. 檢查所有測試是否通過')
  console.log('   2. 如有錯誤，檢查 Supabase 設定')
  console.log('   3. 確認 Edge Functions 已正確部署')
  console.log('   4. 驗證資料庫 schema 已執行')

  console.log('\n🔗 相關檔案:')
  console.log('   - setup-tarot-backend.sql (資料庫 schema)')
  console.log('   - supabase/functions/daily-card/index.ts')
  console.log('   - supabase/functions/three-card-reading/index.ts')
}

// 處理未捕獲的錯誤
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ 未處理的 Promise 拒絕:', reason)
})

process.on('uncaughtException', (error) => {
  console.error('❌ 未捕獲的異常:', error)
  process.exit(1)
})

// 執行所有測試
runAllTests().catch(error => {
  console.error('❌ 測試套件執行失敗:', error.message)
  process.exit(1)
})