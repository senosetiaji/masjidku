import SelectField from "@/components/fields/SelectField"
import { useEffect, useState } from "react"
import moment from "moment"

const SelectYear = ({...props}) => {
  const [options, setOptions] = useState([])

  useEffect(() => {
    const currentYear = moment().year()
    const years = []
    for (let i = 0; i < 10; i++) {
      const year = currentYear - i
      years.push({
        label: year.toString(),
        value: year.toString()
      })
    }
    setOptions(years)
  }, [])

  return (
    <SelectField 
      options={options}
      {...props}
    />  
  )
}

export default SelectYear