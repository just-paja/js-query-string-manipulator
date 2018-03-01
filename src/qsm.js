export const URL_REMOVE = 'remove';
export const URL_SET = 'set';
export const URL_TOGGLE = 'toggle';

const filterByParamName = paramName => param => param.key === paramName;

const findParamIndex = (params, paramName) => params.findIndex(filterByParamName(paramName));

const removeParam = (params, paramName) => {
  const paramIndex = params.findIndex(filterByParamName(paramName));
  if (paramIndex !== -1) {
    params.splice(paramIndex, 1);
  }
};

const findQueryStart = url => url.indexOf('?');

const removeParams = (urlParams, params) =>
  params.forEach(paramName => removeParam(urlParams, paramName));

const mapInputToParams = params => Object.keys(params).map(key => ({
  key,
  value: params[key],
}));

const toggleParams = (urlParams, urlParamsNext, params) => {
  Object.keys(params).forEach((key) => {
    const paramIndex = findParamIndex(urlParams, key);
    const value = params[key];
    if (paramIndex === -1) {
      urlParamsNext.push({ key, value });
    } else {
      const param = urlParams[paramIndex];
      if (param.value === value) {
        removeParam(urlParams, key);
      } else {
        urlParamsNext.push({ key, value });
      }
    }
  });
};

export const getUrlParams = (url) => {
  const queryStart = findQueryStart(url);
  const urlParamPairs = queryStart === -1 ? [] : url.substr(queryStart + 1).split('&');
  return urlParamPairs.filter(param => param).map((paramPair) => {
    const [key, value] = paramPair.split('=');
    return { key, value };
  });
};

export const resolveUrlParams = (prevParams, paramActions) => {
  const urlParams = prevParams.slice();
  const urlParamsNext = paramActions[URL_SET] ? mapInputToParams(paramActions[URL_SET]) : [];

  if (paramActions[URL_TOGGLE]) {
    toggleParams(urlParams, urlParamsNext, paramActions[URL_TOGGLE]);
  }

  if (paramActions[URL_REMOVE]) {
    removeParams(urlParams, paramActions[URL_REMOVE]);
  }

  return [
    ...urlParams.filter(param => findParamIndex(urlParamsNext, param.key) === -1),
    ...urlParamsNext,
  ];
};

export const constructUrlParams = params =>
  params.map(param => `${encodeURI(param.key)}=${encodeURI(param.value)}`).join('&');

export default (url, paramActions = {}) => {
  if (!url || typeof url !== 'string') {
    return null;
  }
  const params = constructUrlParams(resolveUrlParams(getUrlParams(url), paramActions));
  const queryStart = findQueryStart(url);
  const strippedUrl = queryStart === -1 ? url : url.substr(0, queryStart);
  return params.length === 0 ? strippedUrl : `${strippedUrl}?${params}`;
};
