export const getFilterParams = (filters) => {
  const params = {};
  Object.keys(filters).forEach(filter => {
    if (filters[filter] && typeof filters[filter] === 'object' && 'value' in filters[filter]) {
      params[filter] = filters[filter].value;
    } else {
      params[filter] = filters[filter];
    }
  });
  return params;
};