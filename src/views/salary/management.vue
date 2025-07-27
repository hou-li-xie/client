<script setup lang="ts">
import {ref, onMounted, watch} from 'vue'
import {ElMessage} from 'element-plus'
import {uploadCSV, getCsvData, getExpenseCategoryAmount, getExpenseCategoryRanking} from '@/api/api'
import * as echarts from 'echarts'
import {useSalaryStore} from '@/stores/salary'
import dayjs from 'dayjs'

const salaryStore = useSalaryStore()
const upload = ref()
const isUploading = ref(false)
const selectedFile = ref<File | null>(null)

// 图表相关
const lineChartContainer = ref<HTMLDivElement | null>(null)
const barChartContainer = ref<HTMLDivElement | null>(null)
const pieChartContainer = ref<HTMLDivElement | null>(null)
let lineChartInstance: echarts.ECharts | null = null
let barChartInstance: echarts.ECharts | null = null
let pieChartInstance: echarts.ECharts | null = null

// 日期范围选择
const size = ref<'default' | 'large' | 'small'>('default')
const currentDate = dayjs()
const defaultValue1 = [
  currentDate.startOf('month').format('YYYY-MM-DD'),
  currentDate.endOf('month').format('YYYY-MM-DD')
]
const value1 = ref<[string, string]>([defaultValue1[0], defaultValue1[1]])

const shortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = dayjs()
      const start = end.subtract(7, 'day')
      return [start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD')]
    },
  },
  {
    text: '最近一个月',
    value: () => {
      const end = dayjs()
      const start = end.subtract(1, 'month')
      return [start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD')]
    },
  },
  {
    text: '最近三个月',
    value: () => {
      const end = dayjs()
      const start = end.subtract(3, 'month')
      return [start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD')]
    },
  },
]

const handleFileChange = async (file: any) => {
  if (file.raw && file.raw.name.endsWith('.csv')) {
    selectedFile.value = file.raw
    try {
      isUploading.value = true
      if (!selectedFile.value) throw new Error('文件为空')

      const uploadParams = new FormData()
      uploadParams.append('file', selectedFile.value as File)
      await uploadCSV(uploadParams)
      ElMessage.success('文件上传成功')
    } catch (error) {
      ElMessage.error('文件上传失败')
      console.error('文件上传失败:', error)
      selectedFile.value = null
    } finally {
      isUploading.value = false
    }
  } else {
    ElMessage.error('请选择CSV文件')
    selectedFile.value = null
  }
}

const queryDataByDateRange = async () => {
  if (!value1.value || value1.value.length !== 2) {
    ElMessage.warning('请选择时间范围')
    return
  }

  try {
    isUploading.value = true
    const [start, end] = value1.value
    salaryStore.setTimeRange(start, end)

    // 获取图表数据
    const response = await getCsvData(start, end)
    ElMessage.success('数据获取成功')
    if (response.data) {
      salaryStore.setChartData({
        total: response.data.total || [],
        originData: response.data.originData || []
      })
    }

    // 获取支出分类金额
    const expenseResponse = await getExpenseCategoryAmount()
    const responseData = expenseResponse.data || expenseResponse
    if (responseData) {
      const formattedData: Record<string, number> = {}
      if (Array.isArray(responseData)) {
        responseData.forEach((item: { category: string; amount: string }) => {
          formattedData[item.category] = parseFloat(item.amount)
        })
      }
      salaryStore.setExpenseCategoryAmount(formattedData)
    }

    // 获取支出排行数据
    const rankingResponse = await getExpenseCategoryRanking()
    if (rankingResponse.data) {
      salaryStore.setExpenseCategoryRanking(rankingResponse.data)
    }
  } catch (error) {
    ElMessage.error('数据获取失败')
    console.error('数据获取失败:', error)
  } finally {
    isUploading.value = false
  }
}

const initCharts = () => {
  if (lineChartContainer.value) lineChartInstance = echarts.init(lineChartContainer.value)
  if (barChartContainer.value) barChartInstance = echarts.init(barChartContainer.value)
  if (pieChartContainer.value) pieChartInstance = echarts.init(pieChartContainer.value)
  renderCharts()
}

const renderCharts = () => {
  if (!salaryStore.chartData.total || !salaryStore.chartData.total.length) return

  let processData = salaryStore.chartData.total.map(item => {
    const date = item.time ? item.time.substring(5, 10).replace('-', '/') : ''
    const income = item.income ? parseFloat(String(item.income)) : 0
    const expense = item.expense ? parseFloat(String(item.expense)) : 0
    return {
      date,
      time: item.time,
      income,
      expense: -Math.abs(expense)
    }
  }).filter(item => item.date && !isNaN(item.income) && !isNaN(item.expense))

  processData.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())

  const incomeData = processData.map(item => item.income)
  const expenseData = processData.map(item => item.expense)
  const dates = processData.map(item => item.date)

  // 折线图配置
  if (lineChartInstance) {
    lineChartInstance.setOption({
      title: {text: '收入与支出趋势', left: 'left'},
      tooltip: {trigger: 'axis'},
      legend: {data: ['支出', '收入']},
      xAxis: {type: 'category', boundaryGap: false, data: dates},
      yAxis: {type: 'value'},
      series: [
        {name: '支出', type: 'line', data: expenseData, smooth: true, itemStyle: {color: '#f56c6c'}},
        {name: '收入', type: 'line', data: incomeData, smooth: true, itemStyle: {color: '#67c23a'}}
      ]
    }, true)
  }

  // 柱状图配置
  if (barChartInstance) {
    barChartInstance.setOption({
      title: {text: '收入与支出对比', left: 'left'},
      tooltip: {trigger: 'axis'},
      legend: {data: ['支出', '收入']},
      xAxis: {type: 'category', data: dates},
      yAxis: {type: 'value'},
      series: [
        {name: '支出', type: 'bar', data: expenseData, itemStyle: {color: '#f56c6c'}},
        {name: '收入', type: 'bar', data: incomeData, itemStyle: {color: '#67c23a'}}
      ]
    }, true)
  }
  // 定义颜色数组
  const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#E7E9ED']
  // 饼图配置
  if (pieChartInstance && salaryStore.expenseCategoryAmount) {
    let pieData = Object.entries(salaryStore.expenseCategoryAmount)
        .map(([name, value]) => ({name, value}))
        .sort((a, b) => b.value - a.value)

    pieChartInstance.setOption({
      title: {
        text: '支出占比概况',
        left: 'left',
        textStyle: {fontSize: 20, fontWeight: '400', fontFamily: 'KaiTi', color: '#333'}
      },
      tooltip: {trigger: 'item', formatter: '{a} <br/>{b}: {c} ({d}%)'},
      legend: {orient: 'vertical', left: 'right'},
      series: [{
        name: '支出分类',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        label: {show: true, position: 'outside', formatter: '{b}: {d}%'},
        emphasis: {
          label: {
            show: true,
            fontSize: '20',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: true
        },
        data: pieData,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#fff',
          borderWidth: 2
        },
        color: colors // 使用定义的颜色数组
      }
      ]
    }, true)
  }
}

watch(() => salaryStore.chartData, renderCharts, {deep: true})
watch(() => salaryStore.expenseCategoryAmount, renderCharts, {deep: true})
// watch(() => expenseRanking.value, ()=>{
//
//   if (salaryStore.tableData){
//     console.log('11111')
//     expenseRanking.value=salaryStore.tableData
//   }
//
// }, {deep: true})
onMounted(() => {
  initCharts()
  window.addEventListener('resize', () => {
    [lineChartInstance, barChartInstance, pieChartInstance].forEach(chart => {
      chart?.resize()
    })
  })
})
</script>

<template>
  <div class="management-container">
    <!-- 操作卡片 -->
    <div class="operation-card">
      <el-upload
          ref="upload"
          action="#"
          :auto-upload="false"
          :on-change="handleFileChange"
          :show-file-list="false"
          accept=".csv"
      >
        <el-button type="primary" :loading="isUploading">
          {{ isUploading ? '上传中...' : '选择CSV文件' }}
        </el-button>
      </el-upload>

      <div class="date-picker">
        <el-date-picker
            v-model="value1"
            type="daterange"
            unlink-panels
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :shortcuts="shortcuts"
            :size="size"
        />
      </div>

      <el-button
          type="primary"
          @click="queryDataByDateRange"
          style="margin-left: 70px;"
          :loading="isUploading"
      >
        查询数据
      </el-button>
    </div>

    <!-- 第一个内容卡片 -->
    <div class="content-card">
      <div class="chart-container" ref="lineChartContainer"></div>
      <div class="chart-container" ref="barChartContainer"></div>
    </div>

    <!-- 第二个内容卡片 -->
    <div class="additional-content-card">
      <div class="chart-container pie-chart-container" ref="pieChartContainer"></div>

      <div class="chart-container right-content">
        <el-table  :data="salaryStore.expenseCategoryRanking" style="width: 100%">
          <el-table-column prop="category" label="类目" width="180" />
          <el-table-column prop="count" label="笔数" width="180" />
          <el-table-column sortable  prop="amount" label="金额" >
            <template #default="{row}">
              <div>{{ row.amount.toFixed(2) }}</div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.management-container {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow-y: auto;
}

.operation-card {
  height: 120px;
  margin-bottom: 15px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
}

.content-card, .additional-content-card {
  flex: 1;
  display: flex;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
  box-sizing: border-box;
  margin-bottom: 15px;
}

.chart-container {
  flex: 1;
  height: 400px;
  padding: 20px;
  box-sizing: border-box;

  &:first-child {
    border-right: 1px solid #eee;
  }
}

.pie-chart-container {
  border-right: 1px solid #eee;
}

.right-content {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding: 20px;
}

.date-picker {
  width: 300px;
  margin-left: 20px;
}

.expense-ranking {
  width: 100%;
  max-width: 400px;

  h3 {
    font-size: 18px;
    font-weight: 500;
    margin-bottom: 20px;
    color: #333;
    text-align: center;
  }
}

.ranking-list {
  width: 100%;
}

.ranking-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.category {
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

.details {
  display: flex;
  flex-direction: column;
  align-items: flex-end;

  .amount {
    font-size: 16px;
    color: #f56c6c;
    font-weight: 500;
  }

  .count {
    font-size: 12px;
    color: #999;
    margin-top: 4px;
  }
}

.view-more {
  margin-top: 20px;
  text-align: center;
  color: #409eff;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    text-decoration: underline;
  }
}
</style>