import React from 'react'
import { Alert, Box, Button, CircularProgress } from '@mui/material'
import MyLocationIcon from '@mui/icons-material/MyLocation'
import { useDispatch, useSelector } from 'react-redux'
import { getJadwalShalatBulanan, getShalatKabkota } from '@/store/actions/shalat.action'

const normalize = (value = '') =>
  String(value)
    .toLowerCase()
    .replace(/kota\s*/g, '')
    .replace(/kabupaten\s*/g, '')
    .replace(/kab\.?\s*/g, '')
    .replace(/[()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const titleCase = (value = '') =>
  String(value)
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')

const buildKabkotaCandidates = (cityRaw = '') => {
  const city = titleCase(normalize(cityRaw))
  if (!city) return []
  return [
    `Kota ${city}`,
    `Kab. ${city}`,
    `Kabupaten ${city}`,
    city,
  ]
}

const findBestMatch = (list = [], raw = '') => {
  if (!raw || !Array.isArray(list) || list.length === 0) return null

  const rawNorm = normalize(raw)
  const exact = list.find((item) => normalize(item) === rawNorm)
  if (exact) return exact

  const contains = list.find((item) => normalize(item).includes(rawNorm) || rawNorm.includes(normalize(item)))
  if (contains) return contains

  return null
}

const PRAYER_ITEMS = [
  { key: 'imsak', label: 'Imsak' },
  { key: 'subuh', label: 'Subuh' },
  { key: 'terbit', label: 'Terbit' },
  { key: 'dhuha', label: 'Dhuha' },
  { key: 'dzuhur', label: 'Dzuhur' },
  { key: 'ashar', label: 'Ashar' },
  { key: 'maghrib', label: 'Maghrib' },
  { key: 'isya', label: 'Isya' },
]

const parsePrayerTime = (dateRef, timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return null
  const [h, m] = timeStr.split(':').map((val) => Number(val))
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null

  const parsed = new Date(dateRef)
  parsed.setHours(h, m, 0, 0)
  return parsed
}

function ShalatWidget() {
  const dispatch = useDispatch()
  const { jadwal, isLoadingJadwal } = useSelector((state) => state.shalat)

  const [isLocating, setIsLocating] = React.useState(false)
  const [error, setError] = React.useState('')
  const [locationLabel, setLocationLabel] = React.useState('')
  const [nowTime, setNowTime] = React.useState(() => new Date())

  React.useEffect(() => {
    const id = setInterval(() => setNowTime(new Date()), 60 * 1000)
    return () => clearInterval(id)
  }, [])

  const todaySchedule = React.useMemo(() => {
    if (!jadwal?.jadwal || !Array.isArray(jadwal.jadwal)) return null
    const now = new Date()
    const dateNow = now.toISOString().slice(0, 10)

    return (
      jadwal.jadwal.find((item) => item.tanggal_lengkap === dateNow) ||
      jadwal.jadwal.find((item) => Number(item.tanggal) === now.getDate()) ||
      null
    )
  }, [jadwal])

  const nextPrayerInfo = React.useMemo(() => {
    if (!todaySchedule) return null

    const timeline = PRAYER_ITEMS
      .map((item) => ({
        ...item,
        value: todaySchedule[item.key],
        date: parsePrayerTime(nowTime, todaySchedule[item.key]),
      }))
      .filter((item) => item.date)

    if (timeline.length === 0) return null

    const upcoming = timeline.find((item) => item.date >= nowTime)
    if (upcoming) {
      return {
        ...upcoming,
        isTomorrow: false,
      }
    }

    return {
      ...timeline[0],
      isTomorrow: true,
    }
  }, [todaySchedule, nowTime])

  const locateAndFetch = async () => {
    setError('')

    if (!navigator.geolocation) {
      setError('Browser tidak mendukung geolocation.')
      return
    }

    setIsLocating(true)

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 0,
        })
      })

      const { latitude, longitude } = position.coords

      const reverseUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=id`
      const reverseRes = await fetch(reverseUrl)
      if (!reverseRes.ok) {
        throw new Error('Gagal mengambil lokasi administratif.')
      }

      const reverseJson = await reverseRes.json()
      const address = reverseJson?.address || {}

      const provinceRaw =
        address.state ||
        address.province ||
        ''

      const cityRaw =
        address.city ||
        address.regency ||
        address.county ||
        address.town ||
        address.municipality ||
        ''

      if (!provinceRaw || !cityRaw) {
        throw new Error('Lokasi terdeteksi, tetapi provinsi/kabupaten tidak ditemukan.')
      }

      const provinsi = titleCase(provinceRaw)

      const kabkotaRes = await dispatch(getShalatKabkota({ provinsi })).unwrap()
      const kabkotaList = kabkotaRes?.data || []

      const candidates = buildKabkotaCandidates(cityRaw)
      let kabkota = null

      for (const candidate of candidates) {
        kabkota = findBestMatch(kabkotaList, candidate)
        if (kabkota) break
      }

      if (!kabkota) {
        kabkota = findBestMatch(kabkotaList, cityRaw)
      }

      if (!kabkota) {
        throw new Error(`Kab/Kota tidak cocok untuk "${cityRaw}" di provinsi "${provinsi}".`)
      }

      const now = new Date()

      await dispatch(
        getJadwalShalatBulanan({
          payload: {
            provinsi,
            kabkota,
            bulan: now.getMonth() + 1,
            tahun: now.getFullYear(),
          },
        })
      ).unwrap()

      setLocationLabel(`${kabkota}, ${provinsi}`)
    } catch (err) {
      const geoCode = err?.code
      if (geoCode === 1) {
        setError('Izin lokasi ditolak. Aktifkan izin lokasi lalu coba lagi.')
      } else if (geoCode === 2) {
        setError('Lokasi tidak tersedia.')
      } else if (geoCode === 3) {
        setError('Permintaan lokasi timeout. Coba lagi.')
      } else {
        setError(err?.message || 'Gagal mengambil jadwal shalat berdasarkan lokasi.')
      }
    } finally {
      setIsLocating(false)
    }
  }

  return (
    <Box className="p-4 rounded-lg border border-gray-200 bg-white">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-3">
        <div>
          <div className="text-[18px] font-semibold text-[#333]">Jadwal Shalat Hari Ini</div>
          <div className="text-[13px] text-gray-500">Deteksi lokasi otomatis untuk provinsi dan kabupaten/kota.</div>
        </div>
        <Button
          variant="outlined"
          startIcon={isLocating || isLoadingJadwal ? <CircularProgress size={16} /> : <MyLocationIcon />}
          onClick={locateAndFetch}
          disabled={isLocating || isLoadingJadwal}
        >
          {isLocating || isLoadingJadwal ? 'Memproses...' : 'Deteksi Lokasi Saya'}
        </Button>
      </div>

      {error && <Alert severity="error" className="mb-3">{error}</Alert>}

      {locationLabel && <div className="text-[13px] text-gray-600 mb-3">Lokasi: <span className="font-semibold">{locationLabel}</span></div>}

      {nextPrayerInfo && (
        <div className="text-[13px] text-emerald-700 mb-3">
          Sholat berikutnya: <span className="font-semibold">{nextPrayerInfo.label} ({nextPrayerInfo.value})</span>{' '}
          {nextPrayerInfo.isTomorrow ? '(besok)' : ''}
        </div>
      )}

      {todaySchedule ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {PRAYER_ITEMS.map((item) => {
            const isNext = nextPrayerInfo?.key === item.key
            return (
              <div
                key={item.key}
                className={`p-3 rounded-md border ${isNext ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-300' : 'bg-[#f7f7f7] border-transparent'}`}
              >
                <div className={`text-[12px] ${isNext ? 'text-emerald-700 font-semibold' : 'text-gray-500'}`}>{item.label}</div>
                <div className="text-[16px] font-semibold">{todaySchedule[item.key]}</div>
                {isNext && <div className="text-[11px] text-emerald-700 mt-1">Berikutnya</div>}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-[13px] text-gray-500">Belum ada data jadwal. Klik "Deteksi Lokasi Saya" untuk memuat jadwal shalat.</div>
      )}
    </Box>
  )
}

export default ShalatWidget
