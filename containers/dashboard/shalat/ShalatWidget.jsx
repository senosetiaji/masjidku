import React from 'react'
import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import MyLocationIcon from '@mui/icons-material/MyLocation'
import { useDispatch, useSelector } from 'react-redux'
import EditLocationAltIcon from '@mui/icons-material/EditLocationAlt'
import { getJadwalShalatBulanan, getShalatKabkota, getShalatProvinsi } from '@/store/actions/shalat.action'
import { clearKabkota } from '@/store/slices/shalat.slice'

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

const formatCountdown = (targetDate, nowDate) => {
  if (!targetDate || !nowDate) return '-'

  const diffMs = targetDate.getTime() - nowDate.getTime()
  const safeDiffMs = diffMs > 0 ? diffMs : 0
  const totalMinutes = Math.floor(safeDiffMs / (1000 * 60))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  return `${String(hours).padStart(2, '0')}j ${String(minutes).padStart(2, '0')}m`
}

function ShalatWidget() {
  const dispatch = useDispatch()
  const { jadwal, provinsi, kabkota, isLoadingJadwal, isLoadingProvinsi, isLoadingKabkota } = useSelector((state) => state.shalat)

  const [isLocating, setIsLocating] = React.useState(false)
  const [error, setError] = React.useState('')
  const [manualModalOpen, setManualModalOpen] = React.useState(false)
  const [manualError, setManualError] = React.useState('')
  const [manualProvinsi, setManualProvinsi] = React.useState('')
  const [manualKabkota, setManualKabkota] = React.useState('')
  const [detectedLocation, setDetectedLocation] = React.useState({
    cityRaw: '',
    provinceRaw: '',
    kabkota: '',
    provinsi: '',
  })
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
        countdown: formatCountdown(upcoming.date, nowTime),
      }
    }

    const tomorrowFirst = new Date(nowTime)
    tomorrowFirst.setDate(tomorrowFirst.getDate() + 1)
    const nextDayDate = parsePrayerTime(tomorrowFirst, timeline[0]?.value)

    return {
      ...timeline[0],
      isTomorrow: true,
      countdown: formatCountdown(nextDayDate, nowTime),
    }
  }, [todaySchedule, nowTime])

  const fetchJadwalByLocation = async (selectedProvinsi, selectedKabkota) => {
    const now = new Date()

    await dispatch(
      getJadwalShalatBulanan({
        payload: {
          provinsi: selectedProvinsi,
          kabkota: selectedKabkota,
          bulan: now.getMonth() + 1,
          tahun: now.getFullYear(),
        },
      })
    ).unwrap()
  }

  const openManualModal = async () => {
    setManualError('')
    setManualModalOpen(true)
    if (!provinsi?.length) {
      await dispatch(getShalatProvinsi()).unwrap().catch(() => {})
    }
  }

  const closeManualModal = () => {
    setManualModalOpen(false)
    setManualError('')
  }

  React.useEffect(() => {
    if (!manualProvinsi) {
      dispatch(clearKabkota())
      setManualKabkota('')
      return
    }

    setManualKabkota('')
    dispatch(getShalatKabkota({ provinsi: manualProvinsi }))
  }, [dispatch, manualProvinsi])

  const submitManualLocation = async () => {
    setManualError('')
    setError('')

    if (!manualProvinsi || !manualKabkota) {
      setManualError('Pilih provinsi dan kab/kota terlebih dahulu.')
      return
    }

    try {
      await fetchJadwalByLocation(manualProvinsi, manualKabkota)

      setDetectedLocation({
        cityRaw: manualKabkota,
        provinceRaw: manualProvinsi,
        kabkota: manualKabkota,
        provinsi: manualProvinsi,
      })

      closeManualModal()
    } catch (err) {
      setManualError(err?.message || 'Gagal mengambil jadwal shalat dari lokasi manual.')
    }
  }

  const locateAndFetch = async () => {
    setError('')
    setDetectedLocation({
      cityRaw: '',
      provinceRaw: '',
      kabkota: '',
      provinsi: '',
    })

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

      await fetchJadwalByLocation(provinsi, kabkota)

      setDetectedLocation({
        cityRaw,
        provinceRaw,
        kabkota,
        provinsi,
      })
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
        <div className="flex gap-4">
          <Button
            variant="text"
            startIcon={<EditLocationAltIcon />}
            onClick={openManualModal}
            disabled={isLocating || isLoadingJadwal}
          >
            Pilih Lokasi Manual
          </Button>
          <Button
            variant="outlined"
            startIcon={isLocating || isLoadingJadwal ? <CircularProgress size={16} /> : <MyLocationIcon />}
            onClick={locateAndFetch}
            disabled={isLocating || isLoadingJadwal}
          >
            {isLocating || isLoadingJadwal ? 'Memproses...' : 'Deteksi Lokasi Saya'}
          </Button>
        </div>
      </div>

      {error && <Alert severity="error" className="mb-3">{error}</Alert>}

      {(detectedLocation?.kabkota || detectedLocation?.cityRaw) && (
        <div className="text-[13px] text-gray-600 mb-3 space-y-1">
          {detectedLocation?.kabkota && detectedLocation?.provinsi && (
            <div>
              <MyLocationIcon className="text-sky-700" /> <span className="font-semibold">{detectedLocation.kabkota}, {detectedLocation.provinsi}</span>
            </div>
          )}
        </div>
      )}

      {nextPrayerInfo && (
        <div className="text-[13px] text-emerald-700 mb-3">
          Sholat berikutnya: <span className="font-semibold">{nextPrayerInfo.label} ({nextPrayerInfo.value})</span>{' '}
          {nextPrayerInfo.isTomorrow ? '(besok)' : ''}
          {' · '}
          <span className="font-semibold">{nextPrayerInfo.countdown}</span>
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
                {isNext && <div className="text-[11px] text-emerald-700 mt-1">Berikutnya · {nextPrayerInfo?.countdown}</div>}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-[13px] text-gray-500">Belum ada data jadwal. Klik "Deteksi Lokasi Saya" untuk memuat jadwal shalat.</div>
      )}

      <Dialog open={manualModalOpen} onClose={closeManualModal} fullWidth maxWidth="sm">
        <DialogTitle>Pilih Lokasi Manual</DialogTitle>
        <DialogContent className="space-y-4! pt-2!">
          {manualError && <Alert severity="error">{manualError}</Alert>}

          <FormControl fullWidth size="small" sx={{ mt: 1 }}>
            <InputLabel id="manual-provinsi-label">Provinsi</InputLabel>
            <Select
              labelId="manual-provinsi-label"
              value={manualProvinsi}
              label="Provinsi"
              onChange={(e) => setManualProvinsi(e.target.value)}
              disabled={isLoadingProvinsi}
            >
              {provinsi.map((item) => (
                <MenuItem key={item} value={item}>{item}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" sx={{ mt: 2 }}>
            <InputLabel id="manual-kabkota-label">Kab/Kota</InputLabel>
            <Select
              labelId="manual-kabkota-label"
              value={manualKabkota}
              label="Kab/Kota"
              onChange={(e) => setManualKabkota(e.target.value)}
              disabled={!manualProvinsi || isLoadingKabkota}
            >
              {kabkota.map((item) => (
                <MenuItem key={item} value={item}>{item}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeManualModal}>Batal</Button>
          <Button variant="contained" onClick={submitManualLocation} disabled={isLoadingJadwal || isLoadingKabkota || !manualProvinsi || !manualKabkota}>
            Gunakan Lokasi Ini
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ShalatWidget
