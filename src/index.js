export const URL_REMOVE = 'remove'
export const URL_SET = 'set'
export const URL_TOGGLE = 'toggle'

function filterByParamName (paramName) {
  return function (param) {
    return param.key === paramName
  }
}

function findParamIndex (params, paramName) {
  return params.findIndex(filterByParamName(paramName))
}

function removeParam (params, paramName) {
  let paramIndex
  do {
    paramIndex = params.findIndex(filterByParamName(paramName))
    if (paramIndex !== -1) {
      params.splice(paramIndex, 1)
    }
  } while (paramIndex !== -1)
}

function findQueryStart (url) {
  return url.indexOf('?')
}

function removeParams (urlParams, params) {
  return params.forEach(paramName => removeParam(urlParams, paramName))
}

function mapInputKeyToParam (params, key) {
  return { key, value: params[key], encode: true }
}

function mapInputToParams (params) {
  return Object.keys(params)
    .filter(key => params[key] !== undefined)
    .reduce((aggr, key) => {
      if (params[key] instanceof Array) {
        return aggr.concat(params[key].map(value => ({ key, value, encode: true })))
      }

      return [...aggr, mapInputKeyToParam(params, key)]
    }, [])
}

function toggleParams (urlParams, urlParamsNext, params) {
  Object.keys(params).forEach((key) => {
    const paramIndex = findParamIndex(urlParams, key)
    const value = params[key]
    if (paramIndex === -1) {
      urlParamsNext.push({ key, value })
    } else {
      const param = urlParams[paramIndex]
      if (param.value === value) {
        removeParam(urlParams, key)
      } else {
        urlParamsNext.push({ key, value })
      }
    }
  })
}

export function getUrlParams (url) {
  const decodedUrl = decodeURI(url)
  const queryStart = findQueryStart(decodedUrl)
  const urlParamPairs = queryStart === -1 ? [] : decodedUrl.substr(queryStart + 1).split('&')
  return urlParamPairs.filter(param => param).map((paramPair) => {
    const [key, value] = paramPair.split('=')
    return { key, value }
  })
}

function resolveUrlParamsWithNotes (prevParams, paramActions) {
  const urlParams = prevParams.slice()
  const urlParamsNext = paramActions[URL_SET] ? mapInputToParams(paramActions[URL_SET]) : []

  if (paramActions[URL_TOGGLE]) {
    toggleParams(urlParams, urlParamsNext, paramActions[URL_TOGGLE])
  }

  if (paramActions[URL_REMOVE]) {
    removeParams(urlParams, paramActions[URL_REMOVE])
  }

  return [
    ...urlParams.filter(param => findParamIndex(urlParamsNext, param.key) === -1),
    ...urlParamsNext
  ]
}

export function resolveUrlParams (prevParams, paramActions) {
  return resolveUrlParamsWithNotes(prevParams, paramActions).map(param => ({
    key: param.key,
    value: param.value
  }))
}

export function constructUrlParams (params) {
  return params.map((param) => {
    const key = param.encode ? encodeURIComponent(param.key) : param.key
    return param.value === null
      ? `${key}`
      : `${key}=${param.encode ? encodeURIComponent(param.value) : param.value}`
  }).join('&')
}

export function qsm (url, paramActions = {}) {
  if (!url || typeof url !== 'string') {
    return null
  }
  const params = constructUrlParams(resolveUrlParamsWithNotes(getUrlParams(url), paramActions))
  const queryStart = findQueryStart(url)
  const strippedUrl = queryStart === -1 ? url : url.substr(0, queryStart)
  return params.length === 0 ? strippedUrl : `${strippedUrl}?${params}`
}

export default qsm
