import React from 'react';

const Alert = ({ type = 'error', children }) => (
  <div className={`alert alert-${type}`}>{children}</div>
);

export default Alert;
