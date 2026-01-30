import SelectField from "@/components/fields/SelectField"

const SelectRoles = ({...props}) => {
  const options = [
    { label: 'Ketua', value: 'ketua' },
    { label: 'Sekretaris', value: 'sekretaris' },
    { label: 'Bendahara', value: 'bendahara' },
    { label: 'Anggota', value: 'anggota' },
    
  ]

  return (
    <div>
      <SelectField
        options={options}
        {...props}
      />
    </div>
  )
}

export default SelectRoles