import React from 'react'
import dynamic from 'next/dynamic'
import Highcharts from 'highcharts'
import { useSelector } from 'react-redux'

const HighchartsReact = dynamic(() => import('highcharts-react-official'), { ssr: false })

function Chart() {
  const { pam } = useSelector(state => state.dashboard)
  const { chart, isLoading } = pam

  const categories = React.useMemo(() => {
    if (Array.isArray(chart) && chart.length > 0) {
      return chart[0]?.pamUsed?.map(item => item?.bulan ?? '-') ?? []
    }
    return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  }, [chart])

  const series = React.useMemo(() => {
    if (!Array.isArray(chart)) return []

    return chart
      .map((item, idx) => ({
        name: item?.customer || item?.pelangganId || `Pelanggan ${idx + 1}`,
        data: (item?.pamUsed || []).map(pam => Number(pam?.water_bill) || 0),
        lineWidth: 2,
        marker: {
          radius: 3,
        },
      }))
      .filter(serie => Array.isArray(serie.data) && serie.data.some(val => Number(val) > 0))
  }, [chart])

  const hasData = series.length > 0

  const options = React.useMemo(() => ({
    chart: {
      type: 'line',
      backgroundColor: 'transparent',
      height: 380,
      zoomType: 'x',
    },
    title: { text: '' },
    credits: { enabled: false },
    xAxis: {
      categories,
      tickmarkPlacement: 'on',
      lineColor: '#e2e8f0',
    },
    yAxis: {
      title: { text: 'Pemakaian Air (m³)' },
      min: 0,
      allowDecimals: false,
      gridLineColor: '#f1f5f9',
    },
    tooltip: {
      shared: true,
      valueSuffix: ' m³',
      backgroundColor: '#0f172a',
      style: { color: '#e2e8f0' },
    },
    legend: {
      align: 'center',
      verticalAlign: 'bottom',
      itemStyle: { color: '#0f172a' },
    },
    plotOptions: {
      series: {
        marker: { symbol: 'circle' },
        states: { hover: { lineWidthPlus: 1 } },
      },
    },
    responsive: {
      rules: [
        {
          condition: { maxWidth: 640 },
          chartOptions: {
            chart: { height: 320 },
            legend: { layout: 'horizontal', itemWidth: 120 },
          },
        },
      ],
    },
    series,
    lang: {
      noData: 'Data tidak tersedia',
    },
  }), [categories, series])

  return (
    <div className="p-4 shadow-md rounded-lg border border-slate-100 bg-white">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Grafik Pemakaian PAM</h3>
          <p className="text-xs text-slate-500">Line chart interaktif & responsif berdasarkan data bulanan.</p>
        </div>
        {isLoading && <span className="text-xs text-slate-500">Memuat...</span>}
      </div>

      {!isLoading && !hasData && (
        <div className="text-sm text-slate-500">Data tidak tersedia untuk filter yang dipilih.</div>
      )}

      {hasData && (
        <div className="h-90">
          <HighchartsReact highcharts={Highcharts} options={options} immutable={false} updateArgs={[true, true]} />
        </div>
      )}
    </div>
  )
}

export default Chart