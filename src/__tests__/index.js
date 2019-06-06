import qsm, {
  URL_REMOVE,
  URL_SET,
  URL_TOGGLE,
  constructUrlParams,
  getUrlParams,
  resolveUrlParams
} from '..'

describe('qsm', () => {
  it('returns null when URL is a null', () => {
    expect(qsm(null)).toBe(null)
  })

  it('returns null when URL is a number', () => {
    expect(qsm(654654)).toBe(null)
  })

  it('returns unchanged URL when given no actions and no query string', () => {
    expect(qsm('https://example.com/foo'))
      .toBe('https://example.com/foo')
  })

  it('returns unchanged URL when given no actions', () => {
    expect(qsm('https://example.com/foo?bar=xx&baz=FoO'))
      .toBe('https://example.com/foo?bar=xx&baz=FoO')
  })

  it('returns unchanged URL when removed params are not found', () => {
    expect(qsm('https://example.com/foo?bar=xx', {
      remove: ['foo']
    })).toBe('https://example.com/foo?bar=xx')
  })

  it('returns URL without query when params resolved as empty', () => {
    expect(qsm('https://example.com/foo?bar=xx', {
      remove: ['bar']
    })).toBe('https://example.com/foo')
  })

  it('returns URL with newly set params', () => {
    expect(qsm('https://example.com/foo?bar=xx', {
      set: {
        bar: 'XXXXX',
        page: 10
      }
    })).toBe('https://example.com/foo?bar=XXXXX&page=10')
  })

  it('works for example with adding page number', () => {
    expect(qsm('https://www.google.cz/search?q=hello+world', {
      set: {
        num: 20
      }
    })).toBe('https://www.google.cz/search?q=hello+world&num=20')
  })

  it('works for example with changing page number', () => {
    expect(qsm('https://www.google.cz/search?q=hello+world&num=20', {
      set: {
        num: 40
      }
    })).toBe('https://www.google.cz/search?q=hello+world&num=40')
  })

  it('works for example with removing page number', () => {
    expect(qsm('https://www.google.cz/search?q=hello+world&num=20', {
      remove: ['num']
    })).toBe('https://www.google.cz/search?q=hello+world')
  })

  it('works for example with removing page number and search', () => {
    expect(qsm('https://www.google.cz/search?q=hello+world&num=20', {
      remove: ['q', 'num']
    })).toBe('https://www.google.cz/search')
  })

  it('works for example with toggling on filter', () => {
    expect(qsm('https://www.google.cz/search?q=hello+world&num=20', {
      toggle: {
        tbm: 'isch'
      }
    })).toBe('https://www.google.cz/search?q=hello+world&num=20&tbm=isch')
  })

  it('works for example with toggling off filter', () => {
    expect(qsm('https://www.google.cz/search?q=hello+world&num=20&tbm=isch', {
      toggle: {
        tbm: 'isch'
      }
    })).toBe('https://www.google.cz/search?q=hello+world&num=20')
  })

  it('works for complex example with symbols', () => {
    expect(qsm('http://example.com/', {
      [URL_REMOVE]: ['test'],
      [URL_TOGGLE]: {
        foo: 'bar'
      },
      [URL_SET]: {
        xxx: '123'
      }
    })).toBe('http://example.com/?xxx=123&foo=bar')
  })

  it('works when removing param with symbols', () => {
    expect(qsm('http://example.com/?foo=bar&xxx=123&test=toBeRemoved', {
      [URL_REMOVE]: ['test']
    })).toBe('http://example.com/?foo=bar&xxx=123')
  })

  it('works when toggle-adding param with symbols', () => {
    expect(qsm('http://example.com/?foo=bar&xxx=123', {
      [URL_TOGGLE]: {
        test: 'toBeAdded'
      }
    })).toBe('http://example.com/?foo=bar&xxx=123&test=toBeAdded')
  })

  it('works when toggle-changing-value param with symbols', () => {
    expect(qsm('http://example.com/?foo=bar&xxx=123&test=toBeChanged', {
      [URL_TOGGLE]: {
        test: 'toBeAdded'
      }
    })).toBe('http://example.com/?foo=bar&xxx=123&test=toBeAdded')
  })

  it('works when toggle-removing param with symbols', () => {
    expect(qsm('http://example.com/?foo=bar&xxx=123&test=toBeRemoved', {
      [URL_TOGGLE]: {
        test: 'toBeRemoved'
      }
    })).toBe('http://example.com/?foo=bar&xxx=123')
  })

  it('works when setting param with symbols', () => {
    expect(qsm('http://example.com/?foo=bar&xxx=123', {
      [URL_TOGGLE]: {
        test: 'toBeAdded'
      }
    })).toBe('http://example.com/?foo=bar&xxx=123&test=toBeAdded')
  })

  it('works with urldecoded address', () => {
    expect(qsm('https://example.org?f%5BnumPages%5D%5Bv%5D%5Bmin%5D=1', {
      [URL_SET]: {
        'f[numPages][v][min]': 2
      }
    })).toBe('https://example.org?f%5BnumPages%5D%5Bv%5D%5Bmin%5D=2')
  })

  it('works with example for array paramters', () => {
    expect(qsm('https://www.google.cz/search?q=hello+world&num=20', {
      [URL_SET]: {
        num: [20, 40, 60]
      }
    })).toBe('https://www.google.cz/search?q=hello+world&num=20&num=40&num=60')
  })

  it('works with ordered parameter arrays', () => {
    expect(qsm('https://www.google.cz/search?q=hello+world&num=40', {
      [URL_SET]: {
        num: [20, 40, 60]
      }
    })).toBe('https://www.google.cz/search?q=hello+world&num=20&num=40&num=60')
  })

  it('sets params from array when URL contains more values than input', () => {
    expect(qsm('https://www.google.cz/search?q=hello+world&num=x3&num=x4', {
      [URL_SET]: {
        num: [12]
      }
    })).toBe('https://www.google.cz/search?q=hello+world&num=12')
  })

  it('sets params from array when URL contains less values than input', () => {
    expect(qsm('https://www.google.cz/search?q=hello+world&num=x3&num=x4', {
      [URL_SET]: {
        num: [12, 13, 14, 15]
      }
    })).toBe('https://www.google.cz/search?q=hello+world&num=12&num=13&num=14&num=15')
  })

  it('removes all ocurrences of params URL', () => {
    expect(qsm('https://www.google.cz/search?num=12&q=hello+world&num=x3&num=x4', {
      [URL_REMOVE]: ['num']
    })).toBe('https://www.google.cz/search?q=hello+world')
  })
})

describe('lib', () => {
  it('provides set constant', () => {
    expect(URL_SET).toBe('set')
  })

  it('provides remove constant', () => {
    expect(URL_REMOVE).toBe('remove')
  })

  it('provides toggle constant', () => {
    expect(URL_TOGGLE).toBe('toggle')
  })
})

describe('getUrlParams', () => {
  it('returns empty array for absolute URI without query string', () => {
    expect(getUrlParams('https://example.com/test')).toEqual([])
  })

  it('returns empty array for absolute URL without path and query string', () => {
    expect(getUrlParams('https://example.com')).toEqual([])
  })

  it('returns empty array for absolute URL with root path and query string', () => {
    expect(getUrlParams('https://example.com/')).toEqual([])
  })

  it('returns empty array for relative URL without query string', () => {
    expect(getUrlParams('/local')).toEqual([])
  })

  it('returns empty array for URL with empty query string', () => {
    expect(getUrlParams('/local?')).toEqual([])
  })

  it('returns URL params as array', () => {
    expect(getUrlParams('/local?foo=bar&bar=123')).toEqual([
      { key: 'foo', value: 'bar' },
      { key: 'bar', value: '123' }
    ])
  })

  it('returns URL params as array with repeated params', () => {
    expect(getUrlParams('/local?foo=bar&foo=123&foo=xxx')).toEqual([
      { key: 'foo', value: 'bar' },
      { key: 'foo', value: '123' },
      { key: 'foo', value: 'xxx' }
    ])
  })

  it('returns params of urldecoded address', () => {
    expect(getUrlParams('https://example.org?f%5BnumPages%5D%5Bv%5D%5Bmin%5D=1')).toEqual([
      {
        key: 'f[numPages][v][min]',
        value: '1'
      }
    ])
  })
})

describe('resolveUrlParams', () => {
  it('returns prev params untouched when no action was passed', () => {
    const urlParams = [
      { key: 'foo', value: 'bar' },
      { key: 'bar', value: '123' }
    ]
    const paramActions = []
    expect(resolveUrlParams(urlParams, paramActions)).toEqual([
      { key: 'foo', value: 'bar' },
      { key: 'bar', value: '123' }
    ])
  })

  it('returns newly set params', () => {
    const urlParams = []
    const paramActions = {
      set: {
        foo: 'bar',
        bar: '123'
      }
    }
    expect(resolveUrlParams(urlParams, paramActions)).toEqual([
      { key: 'foo', value: 'bar' },
      { key: 'bar', value: '123' }
    ])
  })

  it('returns params where set replaces previous value', () => {
    const urlParams = [
      { key: 'foo', value: 'bar' },
      { key: 'bar', value: '123' }
    ]
    const paramActions = {
      set: {
        bar: '456'
      }
    }
    expect(resolveUrlParams(urlParams, paramActions)).toEqual([
      { key: 'foo', value: 'bar' },
      { key: 'bar', value: '456' }
    ])
  })

  it('returns params where set replaces previous array value', () => {
    const urlParams = [
      { key: 'foo', value: 'bar' },
      { key: 'foo', value: '123' }
    ]
    const paramActions = {
      set: {
        foo: ['xxx', '456']
      }
    }
    expect(resolveUrlParams(urlParams, paramActions)).toEqual([
      { key: 'foo', value: 'xxx' },
      { key: 'foo', value: '456' }
    ])
  })

  it('returns params where toggle sets param value', () => {
    const urlParams = [
      { key: 'foo', value: 'bar' }
    ]
    const paramActions = {
      toggle: {
        bar: '456'
      }
    }
    expect(resolveUrlParams(urlParams, paramActions)).toEqual([
      { key: 'foo', value: 'bar' },
      { key: 'bar', value: '456' }
    ])
  })

  it('returns params where toggle removes param value', () => {
    const urlParams = [
      { key: 'foo', value: 'bar' }
    ]
    const paramActions = {
      toggle: {
        foo: 'bar'
      }
    }
    expect(resolveUrlParams(urlParams, paramActions)).toEqual([])
  })

  it('returns params where toggle sets param value when its found, but different value', () => {
    const urlParams = [
      { key: 'foo', value: 'bar' }
    ]
    const paramActions = {
      toggle: {
        foo: 'barz'
      }
    }
    expect(resolveUrlParams(urlParams, paramActions)).toEqual([
      {
        key: 'foo',
        value: 'barz'
      }
    ])
  })
})

describe('constructUrlParams', () => {
  it('returns empty string for empty params', () => {
    expect(constructUrlParams([])).toBe('')
  })

  it('returns ampersand joined params with values', () => {
    expect(constructUrlParams([
      { key: 'foo', value: 'bar' },
      { key: 'bar', value: '123' }
    ])).toBe('foo=bar&bar=123')
  })
})
