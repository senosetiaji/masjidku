import React from 'react';
import FormControl from '@mui/material/FormControl';
import { Box } from '@mui/material';
import Button from '../buttons/Button';
import PropTypes from 'prop-types';
import SelectMonthYear from '../forms/SelectMonthYear';
import moment from 'moment';
// ===== Redux bindings =====
import { useDispatch, useSelector } from 'react-redux';
import { setFilter, clearFilter } from '@/store/slices/filter.slice';
import SelectTipeKeuangan from '../forms/SelectTipeKeuangan';
import SelectBulan from '../forms/SelectBulan';
import SelectYear from '../forms/SelectYear';

function Filter({ filters, multipleFilters, onSubmit, filterState, requiredField = [], keyName = '', loading = false }) {
  const [className, setClassName] = React.useState('');
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
    console.log('save redux: ', savedRedux);
    
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

  React.useEffect(() => {
    let total = 0;
    for (const t of filters) {
      total += getCountForType(t);
    }
    setClassName(`grid-cols-${total}`);
  }, [filters, normalizedMulti]);

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
        case 'tipe-transaksi':
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
    <div className="relative z-50 animate__animated animate__fadeIn p-4 mb-6 bg-white border border-dashed border-gray-200 rounded-lg shadow-sm">
      <Box component={'div'} className='relative' borderRadius="8px">
        <div className="flex justify-between gap-4">
          <div className={`w-6/6 grid ${className} gap-4 mb-6`}>
            {renderedFilters}
          </div>
          {/* Submit button (opsional) */}
          <div className="w-1/6 flex items-center">
            <Button
              label="Terapkan"
              icon={'/assets/icons/icon-util-filter.svg'}
              className="border border-gray-300 min-w-full! bg-white text-gray-700 hover:bg-gray-100 hover:shadow-md"
              onClick={() => {
                // Simpan ke Redux berdasarkan keyName (wajib isi keyName di halaman pemakai)
                if (keyName) {
                  console.log(keyName);
                  
                  dispatch(setFilter({ key: keyName, values: localFilterState }));
                }
                // Lanjutkan callback agar halaman melakukan fetch
                onSubmit(localFilterState);
              }}
              disabled={submitBtnDisabled}
              size={'small'}
              loading={loading}
            />
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
