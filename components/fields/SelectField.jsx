import { TextField, styled, Autocomplete, FormLabel, ClickAwayListener, Tooltip, IconButton } from '@mui/material'
import { useState } from 'react'
import HelpIcon from '@mui/icons-material/Help';
import PropTypes from 'prop-types'

const Input = styled(TextField)((props) => {
  const { disabled } = props
  return {
    '.MuiFormLabel-root':{
      fontSize:props.fontSize?props.fontSize:'13px',
    },
    '.MuiOutlinedInput-notchedOutline':{
      borderColor: '#E0E0E0'
    },
    '.Mui-focused .MuiOutlinedInput-notchedOutline':{
      borderColor:'#14A2BA'
    },
    '.MuiInputBase-root':{
      background: 'white'
    },
    '.MuiInputBase-input':{
      color:'#4F4F4F',
      fontSize:props.fontSize?props.fontSize:'13px',
      cursor:disabled?'not-allowed':'pointer',
    },
    '.MuiOutlinedInput-root' : {
      paddingBottom: '6px'
    }
  }
})

const Label = styled(FormLabel)((props) => {
  const { fontSize } = props
  return {
    '&.MuiFormLabel-root': {
      color:'#4F4F4F',
      fontFamily:'Poppins',
      fontWeight:500,
      marginBottom:props.mb?props.mb:'9px',
      fontSize:fontSize || '12px'
    },
    '&.MuiFormLabel-root.Mui-error': {
      color:'#d32f2f'
    }
  }
})

const SelectField = ({
  id,
  name,
  label,
  placeholder,
  options = [],
  value,
  onChange,
  touched,
  error,
  disabled,
  size,
  labelfontsize,
  fontSize,
  labelMb,
  className,
  hints,
  hintsText,
  sx,
  isMulti = false,
  multipleDisplay = 'chips' // 'chips' | 'join'
}) => {
  const [open, setOpen] = useState(false);


  const handleChange = (_event, val) => {
    if (isMulti) {
      // val is array of option objects
      const mapped = Array.isArray(val) ? val : [];
      onChange(name, mapped, false);
    } else {
      onChange(name, val, false);
    }
  };

  const normalizedValue = (() => {
    if (isMulti) {
      if (!Array.isArray(value)) return [];
      // Value may already be array of option objects or primitives
      if (value.length === 0) return [];
      if (typeof value[0] === 'object') return value; // assume correct shape
      // primitives -> map to option objects
      return options.filter(o => value.includes(o.value));
    }
    return value || null;
  })();
  
  const handleTooltipClose = () => {
    setOpen(false);
  };

  const handleTooltipOpen = () => {
    setOpen(true);
  };

  const isError = !!(touched && error)

  return (
    <>
    {label && (
      <Label
        error={isError}
        fontSize={labelfontsize || '13px'}
        mb={labelMb}
        sx={{display: 'flex', alignItems: 'center', height: '20px'}}
        >
        {label}
        {hints && 
          <ClickAwayListener onClickAway={handleTooltipClose}>
            <div>
              <Tooltip
                PopperProps={{
                  disablePortal: true,
                }}
                onClose={handleTooltipClose}
                open={open}
                disableFocusListener
                disableHoverListener
                disableTouchListener
                title={hintsText || "Ketik kata kunci dikolom input untuk pencarian."}
              >
                <IconButton onClick={handleTooltipOpen} aria-label="Ketik nama unit dikolom input." size="small">
                  <HelpIcon fontSize="inherit" />
                </IconButton>
              </Tooltip>
            </div>
          </ClickAwayListener>}
      </Label>
    )}
      <Autocomplete
        id={id}
        disabled={disabled}
        disablePortal
        multiple={isMulti}
        options={options}
        onChange={handleChange}
        value={normalizedValue}
        size={size || 'medium'}
        className={className}
        autoHighlight
        isOptionEqualToValue={(option, v) => option?.value === v?.value}
        getOptionLabel={(option) => option?.label || ''}
        renderTags={(tagValue, getTagProps) => {
          if (!isMulti) return null;
          if (multipleDisplay === 'join') {
            return <span className="text-xs text-gray-600">{tagValue.map(t => t.label).join(', ')}</span>;
          }
          return tagValue.map((option, index) => (
            <span
              key={option.value}
              {...getTagProps({ index })}
              className="bg-[#0e8488] text-white text-[10px] rounded px-2 py-1 mr-1"
            >
              {option.label}
            </span>
          ));
        }}
        renderInput={(params) => (
          <Input
            {...params}
            placeholder={placeholder}
            name={name}
            error={isError}
            helperText={error}
            fontSize={fontSize}
            sx={sx}
            disabled={disabled}
          />
        )}
      />
    </>
  )
}

SelectField.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  options: PropTypes.array,
  value: PropTypes.any,
  onChange: PropTypes.func,
  touched: PropTypes.bool,
  error: PropTypes.bool,
  disabled: PropTypes.bool,
  size: PropTypes.string,
  labelfontsize: PropTypes.string,
  fontSize: PropTypes.string,
  labelMb: PropTypes.string,
  className: PropTypes.string,
  hints: PropTypes.bool,
  hintsText: PropTypes.string,
  sx: PropTypes.any,
  isMulti: PropTypes.bool,
  multipleDisplay: PropTypes.oneOf(['chips','join'])
}

export default SelectField