<script setup>
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale
} from 'chart.js'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale
)

const props = defineProps({
  measurements: { type: Array, required: true },
  type: { type: String, required: true }
})

const chartData = computed(() => {
  if (!props.measurements.length) return null

  const labels = props.measurements.map(m =>
    new Date(m.timestamp).toLocaleString()
  )

  let datasets = []

  if (props.type === 'BScale') {
    datasets.push({
      label: 'Poids (kg)',
      data: props.measurements.map(m => m.data?.Poids ?? null),
      borderColor: '#F6C453',
      tension: 0.3
    })
  }

  if (props.type === 'BTemp') {
    datasets.push({
      label: 'Température interne (°C)',
      data: props.measurements.map(m => m.data?.TempI ?? null),
      borderColor: '#E74C3C',
      tension: 0.3
    })
  }

  if (props.type === 'BWeath') {
    datasets.push(
      {
        label: 'Température externe (°C)',
        data: props.measurements.map(m => m.data?.TempE ?? null),
        borderColor: '#3498DB',
        tension: 0.3
      },
      {
        label: 'Humidité (%)',
        data: props.measurements.map(m => m.data?.HygE ?? null),
        borderColor: '#2ECC71',
        tension: 0.3,
      },
      {
        label: 'Pression atmosphérique (hPa)',
        data: props.measurements.map(m => m.data?.Pression ?? null),
        borderColor: '#FF9800',
        tension: 0.3, //Niveau de lissage des courbes du graphe 
      }

    )
  }

  return { labels, datasets }
})

const chartOptions = {
  responsive: true,
  interaction: { mode: 'index', intersect: false },
  scales: {
    y: { beginAtZero: false },
  }
}
</script>

<template>
  <Line
    v-if="chartData"
    :data="chartData"
    :options="chartOptions"
  />
</template>