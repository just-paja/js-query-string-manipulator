export const URL_REMOVE = 'remove';
export const URL_SET = 'set';
export const URL_TOGGLE = 'toggle';


const findParamIndex = (params, paramName) => params.findIndex(item => item.key === paramName);

const removeParam = (params, paramName) => {
  const paramIndex = params.findIndex(item => item.key === paramName);
  if (paramIndex !== -1) {
    params.splice(paramIndex, 1);
  }
};

export const getUrlParams = (url) => {
  const queryStart = url.indexOf('?');
  const urlParamPairs = queryStart === -1 ? [] : url.substr(queryStart + 1).split('&');
  return urlParamPairs.filter(param => param).map((paramPair) => {
    const [key, value] = paramPair.split('=');
    return { key, value };
  });
};

export const resolveUrlParams = (prevParams, paramActions) => {
  const urlParams = prevParams.slice();
  let urlParamsSet = [];

  if (paramActions[URL_SET]) {
    urlParamsSet = Object.keys(paramActions[URL_SET]).map(key => ({
      key,
      value: paramActions[URL_SET][key],
    }));
  }

  if (paramActions[URL_TOGGLE]) {
    Object.keys(paramActions[URL_TOGGLE]).forEach((key) => {
      const paramIndex = findParamIndex(urlParams, key);
      const value = paramActions[URL_TOGGLE][key];
      if (paramIndex === -1) {
        urlParamsSet.push({ key, value });
      } else {
        const param = urlParams[paramIndex];
        if (param.value === value) {
          removeParam(urlParams, key);
        } else {
          urlParamsSet.push({ key, value });
        }
      }
    });
  }

  if (paramActions[URL_REMOVE]) {
    paramActions[URL_REMOVE].forEach(paramName => removeParam(urlParams, paramName));
  }

  const urlParamsNext = [...urlParamsSet];

  return [
    ...urlParams.filter(param => !urlParamsNext.find(nextParam => nextParam.key === param.key)),
    ...urlParamsNext,
  ];
};

export const constructUrlParams = params =>
  params.map(param => `${encodeURI(param.key)}=${encodeURI(param.value)}`).join('&');

export default (url, paramActions = {}) => {
  const params = constructUrlParams(resolveUrlParams(getUrlParams(url), paramActions));
  const queryStart = url.indexOf('?');
  const strippedUrl = queryStart === -1 ? url : url.substr(0, queryStart);
  return params.length === 0 ? strippedUrl : `${strippedUrl}?${params}`;
};
