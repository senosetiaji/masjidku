import SelectField from "@/components/fields/SelectField"
import { getRoles } from "@/store/actions/roles.action"
import React from "react"
import { useDispatch, useSelector } from "react-redux"

const SelectRoles = ({...props}) => {
  const dispatch = useDispatch()
  const { data } = useSelector((state) => state.roles)

  React.useEffect(() => {
    if (!Array.isArray(data) || data.length === 0) {
      dispatch(getRoles())
    }
  }, [dispatch, data])

  const options = React.useMemo(() => {
    return (data || []).map((item) => ({
      label: (item?.name || '').charAt(0).toUpperCase() + (item?.name || '').slice(1),
      value: item?.name,
    }))
  }, [data])

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