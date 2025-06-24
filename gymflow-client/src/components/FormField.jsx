import React from 'react';

const FormField = ({
  label,
  name,
  value,
  onChange,
  type = 'text',
  options = [],
  placeholder = '',
  required = false,
  ...rest
}) => {
  return (
    <div className="form-group" style={{ marginBottom: 12 }}>
      {label && <label htmlFor={name}>{label}</label>}
      {type === 'select' ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className="form-control"
          {...rest}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className="form-control"
          placeholder={placeholder}
          {...rest}
        />
      ) : (
        <input
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          type={type}
          required={required}
          className="form-control"
          placeholder={placeholder}
          {...rest}
        />
      )}
    </div>
  );
};

export default FormField;
