import React from 'react';
import FormControl from '@mui/material/FormControl';
import { Box } from '@mui/material';
import Button from '@mui/material/Button';
import PropTypes from 'prop-types';
import SelectMonthYear from '../forms/SelectMonthYear';
import moment from 'moment';
// ===== Redux bindings =====
import { useDispatch, useSelector } from 'react-redux';
import { setFilter, clearFilter } from '@/store/slices/filter.slice';
import SelectTipeKeuangan from '../forms/SelectTipeKeuangan';
import SelectBulan from '../forms/SelectBulan';
import SelectYear from '../forms/SelectYear';
import SelectPaymentStatus from '../forms/SelectPaymentStatus';
import SelectConsumer from '../forms/SelectConsumer';
import SelectZakatType from '../forms/SelectZakatType';
import SelectKategori from '../forms/SelectKategori';

function FilterIcon () {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
    </svg>
  );
}

function Filter({ filters, multipleFilters, onSubmit, filterState, requiredField = [], keyName = '', loading = false }) {
  const [submitBtnDisabled, setSubmitBtnDisabled] = React.useState(false);

  // ===== Read saved filter from Redux by keyName =====
  const dispatch = useDispatch();
  const { values : savedRedux } = keyName ? useSelector(state => state.filter[keyName]) : { values: null };

  // State lokal untuk menampung perubahan filter sebelum ditekan "Terapkan"
  const [localFilterState, setLocalFilterState] = React.useState(
    // prioritas: redux -> prop filterState -> {}
    savedRedux || filterState || {}
  );

  React.useEffect(() => {
    if (!savedRedux) {
      // Jika tidak ada di Redux, bersihkan filter di Redux untuk key ini
      dispatch(clearFilter({ key: keyName }));
      return;
    } 
    onSubmit(savedRedux);
    
  }, [savedRedux]);

  // Sinkronisasi ketika prop filterState berubah dari luar
  React.useEffect(() => {
    // Jika ada Redux yang tersimpan, utamakan itu
    if (savedRedux && !filterState) {
      setLocalFilterState(savedRedux);
    } else {
      setLocalFilterState(filterState || {});
    }
  }, [filterState, savedRedux]);

  // Normalisasi multipleFilters ke bentuk lookup { normalizedKey: { key,label,count } }
  const normalizedMulti = React.useMemo(() => {
    if (!multipleFilters) return {};
    const add = (obj, def) => {
      if (!def || !def.key) return;
      const norm = def.key.replace(/-/g, '_');
      obj[norm] = { ...def };
    };
    const result = {};
    if (Array.isArray(multipleFilters)) {
      multipleFilters.forEach(def => add(result, def));
    } else if (multipleFilters.key && multipleFilters.count) {
      add(result, multipleFilters);
    } else {
      // format lama: { tipeFilter: jumlahDuplikasi }
      Object.entries(multipleFilters).forEach(([k, v]) => {
        if (typeof v === 'number') {
          result[k.replace(/-/g, '_')] = { key: k.replace(/-/g, '_'), label: null, count: v };
        }
      });
    }
    return result;
  }, [multipleFilters]);

  const getMultipleDefByType = (type) => {
    // type di filters bisa pakai '-' (contoh "month-year")
    const normType = type.replace(/-/g, '_');
    return normalizedMulti[normType];
  };

  const getCountForType = (type) => {
    return getMultipleDefByType(type)?.count || 1;
  };

  React.useEffect(() => {
    if (requiredField.length === 0) {
      setSubmitBtnDisabled(false);
      return;
    }
    const isValueEmpty = (v) =>
      !v ||
      (typeof v === 'object' && !v.value && !Array.isArray(v) && v !== null) ||
      (Array.isArray(v) && v.length === 0);

    let disable = false;

    for (const rawField of requiredField) {
      // Normalisasi nama base (ganti '-' ke '_')
      const base = rawField.replace(/-/g, '_');
      const expectedCount = normalizedMulti[base]?.count || 1;

      // Bangun daftar nama key yang wajib ada
      const requiredNames =
        expectedCount === 1
          ? [base]
          : Array.from({ length: expectedCount }, (_, i) => `${base}_${i + 1}`);

      // Cek setiap key wajib
      for (const reqName of requiredNames) {
        const val = localFilterState?.[reqName];
        if (isValueEmpty(val)) {
          disable = true;
          break;
        }
      }
      if (disable) break;
    }

    setSubmitBtnDisabled(disable);
  }, [localFilterState, requiredField, normalizedMulti]);

  const baseNameFromName = (n) => n.replace(/_\d+$/, ''); // hapus suffix angka
  const ensureDefault = (name, value) => {
    if (value) return value;
    const base = baseNameFromName(name);
    const defaults = {
      month_year: moment().format('YYYY-MM')
    };
    return defaults[base] || null;
  };

  const handleChange = (name, value) => {
    const v = ensureDefault(name, value);
    const base = baseNameFromName(name);
    setLocalFilterState(prev => {
      let newState = {
        ...prev,
        [name]: v
      };
      if (base === 'dir') {
        Object.keys(newState).forEach(k => {
          if (k.startsWith('div') || k.startsWith('multiple_div') || k.startsWith('kpi')) {
            newState[k] = null;
          }
        });
      }
      return newState;
    });
  };

  const getFirstValue = (base) => {
    if (localFilterState?.[base]) return localFilterState[base];
    const dynKey = Object.keys(localFilterState || {}).find(k => k.startsWith(base + '_'));
    return dynKey ? localFilterState[dynKey] : null;
  };

  const renderFilter = (type, name, keyIdx, overrideLabel) => {
    // overrideLabel dari multipleFilters.label bila disediakan
    switch (type) {
      case 'month-year':
        return (
          <FormControl key={keyIdx}>
            <SelectMonthYear
              label={overrideLabel || 'Bulan dan Tahun'}
              placeholder="Pilih Bulan dan Tahun"
              name={name}
              id={name}
              size="small"
              value={localFilterState?.[name]}
              onChange={handleChange}
            />
          </FormControl>
        );
        case 'tahun':
        return (
          <FormControl key={keyIdx}>
            <SelectYear
              label={overrideLabel || 'Tahun'}
              placeholder="Pilih Tahun"
              name={name}
              id={name}
              size="small"
              onlyYear={true}
              value={localFilterState?.[name]}
              onChange={handleChange}
            />
          </FormControl>
        );
        case 'bulan':
        return (
          <FormControl key={keyIdx}>
            <SelectBulan
              label={overrideLabel || 'Bulan'}
              placeholder="Pilih Bulan"
              name={name}
              id={name}
              size="small"
              value={localFilterState?.[name]}
              onChange={handleChange}
            />
          </FormControl>
        );
        case 'payment_status':
        return (
          <FormControl key={keyIdx}>
            <SelectPaymentStatus
              label={overrideLabel || 'Status Pembayaran'}
              placeholder="Pilih Status Pembayaran"
              name={name} 
              id={name}
              size="small"
              value={localFilterState?.[name]}
              onChange={handleChange}
            />
          </FormControl>
        );
        case 'tipe_transaksi':
        return (
          <FormControl key={keyIdx}>
            <SelectTipeKeuangan
              label={overrideLabel || 'Tipe Transaksi'}
              placeholder="Pilih Tipe Transaksi"
              name={name} 
              id={name}
              size="small"
              value={localFilterState?.[name]}
              onChange={handleChange}
            />
          </FormControl>
        );
        case 'pelanggan':
        return (
          <FormControl key={keyIdx}>
            <SelectConsumer
              label={overrideLabel || 'Pelanggan'}
              placeholder="Pilih Pelanggan"
              name={name} 
              id={name}
              size="small"
              value={localFilterState?.[name]}
              onChange={handleChange}
            />
          </FormControl>
        );
        case 'zakat_type':
        return (
          <FormControl key={keyIdx}>
            <SelectZakatType
              label={overrideLabel || 'Tipe Zakat'}
              placeholder="Pilih Tipe Zakat"
              name={name} 
              id={name}
              size="small"
              value={localFilterState?.[name]}
              onChange={handleChange}
            />
          </FormControl>
        );
        case 'kategori':
        return (
          <FormControl key={keyIdx}>
            <SelectKategori
              label={overrideLabel || 'Kategori'}
              placeholder="Pilih Kategori"
              name={name} 
              id={name}
              size="small"
              value={localFilterState?.[name]}
              onChange={handleChange}
            />
          </FormControl>
        );
      default:
        return null;
    }
  };

  if (!filters || filters.length === 0) return null;

  const renderedFilters = [];
  filters.forEach(type => {
    const count = getCountForType(type);
    const multiDef = getMultipleDefByType(type);
    for (let i = 0; i < count; i++) {
      // Gunakan key dari multipleFilters (norm underscore) bila ada, jika tidak pakai type asli
      const baseKey = multiDef ? multiDef.key : type.replace(/-/g, '_');
      const name = count > 1 ? `${baseKey}_${i + 1}` : baseKey;
      renderedFilters.push(
        renderFilter(
          type, // tetap pakai type untuk switch
          name,
            `${type}-${i}`,
          multiDef?.label || null
        )
      );
    }
  });

  return (
    <div className="relative w-full animate__animated animate__fadeIn p-4 mb-6 bg-white border border-dashed border-gray-200 rounded-lg">
      <Box component={'div'} className='relative' borderRadius="8px">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-[repeat(auto-fit,minmax(220px,_1fr))]">
            {renderedFilters}
          </div>
          {/* Submit button (opsional) */}
          <div className="flex items-start pt-7 md:pl-4 w-full md:w-auto">
            <Button
              variant="outlined"
              color="inherit"
              fullWidth
              startIcon={<FilterIcon />}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderColor: '#d1d5db',
                color: '#374151',
                backgroundColor: '#ffffff',
                '&:hover': {
                  backgroundColor: '#f3f4f6',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                }
              }}
              onClick={() => {
                // Simpan ke Redux berdasarkan keyName (wajib isi keyName di halaman pemakai)
                if (keyName) {
                  dispatch(setFilter({ key: keyName, values: localFilterState }));
                }
                // Lanjutkan callback agar halaman melakukan fetch
                onSubmit(localFilterState);
              }}
              disabled={submitBtnDisabled}
              size="medium"
            >
              Terapkan
            </Button>
          </div>
        </div>
      </Box>
    </div>
  );
}

Filter.propTypes = {
  filters: PropTypes.arrayOf(PropTypes.string).isRequired,
  multipleFilters: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array
  ]),
  onSubmit: PropTypes.func.isRequired,
  filterState: PropTypes.object,
  requiredField: PropTypes.array,
};

export default Filter;
