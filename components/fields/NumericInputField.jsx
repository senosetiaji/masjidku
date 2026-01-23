import React from 'react';
import PropTypes from 'prop-types';
import TextField from '@mui/material/TextField';
import { NumericFormat } from 'react-number-format';
import { FormLabel, styled } from '@mui/material';

const StyledTextField = styled(TextField)((props) => ({
  '& .MuiOutlinedInput-input': {
    transition: 'all ease-in-out .3s'
  },
  '& .Mui-focused .MuiOutlinedInput-input': {
    borderRadius: '4px',
    color: '#4f4f4f !important'
  },
  '.MuiInputBase-root': {
    background: 'white'
  },
  '& .MuiInputBase-input': {
    color: '#4F4F4F',
    fontFamily: 'Nunito',
    fontSize: props.fontSize ? props.fontSize : '14px',
    maxHeight: '48px'
  }
}));

const Label = styled(FormLabel)((props) => ({
  '&.MuiFormLabel-root': {
    color: '#4F4F4F',
    fontFamily: 'Nunito',
    fontWeight: 500,
    marginBottom: props.mb ? props.mb : '9px',
    fontSize: props.fontSize ? props.fontSize : '14px'
  },
  '&.MuiFormLabel-root.Mui-error': {
    color: '#d32f2f'
  }
}));

function NumericInputField({
  id,
  label,
  name,
  value,
  onChange,
  placeholder,
  size = 'small',
  thousandSeparator = '.',
  decimalSeparator = ',',
  prefix,
  suffix,
  allowNegative = false,
  decimalScale,
  allowLeadingZeros = false,
  touched,
  error,
  fontSize,
  labelfontsize,
  labelMb,
  sx,
  disabled,
  onKeyUp,
  maxLength,
  isNumericString = true,
}) {
  const isError = !!(touched && error);

  const handleValueChange = (values) => {
    const raw = values.value; // numeric only (string of digits)
    onChange && onChange(name, raw, false);
  };

  return (
    <>
      {label && (
        <Label error={isError} fontSize={labelfontsize} mb={labelMb}>{label}</Label>
      )}
      <NumericFormat
        customInput={StyledTextField}
        id={id}
        name={name}
        value={value || ''}
        onValueChange={handleValueChange}
        thousandSeparator={thousandSeparator}
        decimalSeparator={decimalSeparator}
        prefix={prefix}
        suffix={suffix}
        allowNegative={allowNegative}
        decimalScale={decimalScale}
        allowLeadingZeros={allowLeadingZeros}
        isNumericString={isNumericString}
        placeholder={placeholder}
        size={size}
        error={isError}
        helperText={error}
        fontSize={fontSize}
        sx={sx}
        disabled={disabled}
        inputProps={maxLength ? { maxLength } : undefined}
        onKeyUp={onKeyUp}
      />
    </>
  );
}

NumericInputField.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  size: PropTypes.string,
  thousandSeparator: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  decimalSeparator: PropTypes.string,
  prefix: PropTypes.string,
  suffix: PropTypes.string,
  allowNegative: PropTypes.bool,
  decimalScale: PropTypes.number,
  allowLeadingZeros: PropTypes.bool,
  touched: PropTypes.bool,
  error: PropTypes.any,
  fontSize: PropTypes.string,
  labelfontsize: PropTypes.string,
  labelMb: PropTypes.string,
  sx: PropTypes.object,
  disabled: PropTypes.bool,
  onKeyUp: PropTypes.func,
  maxLength: PropTypes.number,
  isNumericString: PropTypes.bool,
};

export default NumericInputField;
