import SelectField from '@/components/fields/SelectField'

const kategoriOptions = [
  { label: 'Warga', value: 'warga' },
  { label: 'Pemuka Agama', value: 'pemuka agama' },
  { label: 'Lembaga Sosial', value: 'lembaga sosial' },
]

const SelectKategori = ({ ...props }) => {
  return (
    <SelectField
      options={kategoriOptions}
      {...props}
    />
  )
}

export default SelectKategori
