import { expect } from 'chai';
import qsm, {
  URL_REMOVE,
  URL_SET,
  URL_TOGGLE,
  constructUrlParams,
  getUrlParams,
  resolveUrlParams,
} from '../lib/qsm';


describe('qsm', () => {
  it('returns unchanged URL when given no actions and no query string', () => {
    expect(qsm('https://example.com/foo'))
      .to.eql('https://example.com/foo');
  });

  it('returns unchanged URL when given no actions', () => {
    expect(qsm('https://example.com/foo?bar=xx&baz=FoO'))
      .to.eql('https://example.com/foo?bar=xx&baz=FoO');
  });

  it('returns unchanged URL when removed params are not found', () => {
    expect(qsm('https://example.com/foo?bar=xx', {
      remove: ['foo'],
    })).to.eql('https://example.com/foo?bar=xx');
  });

  it('returns URL without query when params resolved as empty', () => {
    expect(qsm('https://example.com/foo?bar=xx', {
      remove: ['bar'],
    })).to.eql('https://example.com/foo');
  });

  it('returns URL with newly set params', () => {
    expect(qsm('https://example.com/foo?bar=xx', {
      set: {
        bar: 'XXXXX',
        page: 10,
      },
    })).to.eql('https://example.com/foo?bar=XXXXX&page=10');
  });

  it('works for example with adding page number', () => {
    expect(qsm('https://www.google.cz/search?q=hello+world', {
      set: {
        num: 20,
      },
    })).to.eql('https://www.google.cz/search?q=hello+world&num=20');
  });

  it('works for example with changing page number', () => {
    expect(qsm('https://www.google.cz/search?q=hello+world&num=20', {
      set: {
        num: 40,
      },
    })).to.eql('https://www.google.cz/search?q=hello+world&num=40');
  });

  it('works for example with removing page number', () => {
    expect(qsm('https://www.google.cz/search?q=hello+world&num=20', {
      remove: ['num'],
    })).to.eql('https://www.google.cz/search?q=hello+world');
  });

  it('works for example with removing page number and search', () => {
    expect(qsm('https://www.google.cz/search?q=hello+world&num=20', {
      remove: ['q', 'num'],
    })).to.eql('https://www.google.cz/search');
  });

  it('works for example with toggling on filter', () => {
    expect(qsm('https://www.google.cz/search?q=hello+world&num=20', {
      toggle: {
        tbm: 'isch',
      },
    })).to.eql('https://www.google.cz/search?q=hello+world&num=20&tbm=isch');
  });

  it('works for example with toggling off filter', () => {
    expect(qsm('https://www.google.cz/search?q=hello+world&num=20&tbm=isch', {
      toggle: {
        tbm: 'isch',
      },
    })).to.eql('https://www.google.cz/search?q=hello+world&num=20');
  });
});

describe('lib', () => {
  it('provides set constant', () => {
    expect(URL_SET).to.be.a('string');
  });

  it('provides remove constant', () => {
    expect(URL_REMOVE).to.be.a('string');
  });

  it('provides toggle constant', () => {
    expect(URL_TOGGLE).to.be.a('string');
  });
});

describe('getUrlParams', () => {
  it('returns empty array for absolute URI without query string', () => {
    expect(getUrlParams('https://example.com/test')).to.eql([]);
  });

  it('returns empty array for absolute URL without path and query string', () => {
    expect(getUrlParams('https://example.com')).to.eql([]);
  });

  it('returns empty array for absolute URL with root path and query string', () => {
    expect(getUrlParams('https://example.com/')).to.eql([]);
  });

  it('returns empty array for relative URL without query string', () => {
    expect(getUrlParams('/local')).to.eql([]);
  });

  it('returns empty array for URL with empty query string', () => {
    expect(getUrlParams('/local?')).to.eql([]);
  });

  it('returns URL params as array', () => {
    expect(getUrlParams('/local?foo=bar&bar=123')).to.eql([
      { key: 'foo', value: 'bar' },
      { key: 'bar', value: '123' },
    ]);
  });
});

describe('resolveUrlParams', () => {
  it('returns prev params untouched when no action was passed', () => {
    const urlParams = [
      { key: 'foo', value: 'bar' },
      { key: 'bar', value: '123' },
    ];
    const paramActions = [];
    expect(resolveUrlParams(urlParams, paramActions)).to.eql([
      { key: 'foo', value: 'bar' },
      { key: 'bar', value: '123' },
    ]);
  });

  it('returns newly set params', () => {
    const urlParams = [];
    const paramActions = {
      set: {
        foo: 'bar',
        bar: '123',
      },
    };
    expect(resolveUrlParams(urlParams, paramActions)).to.eql([
      { key: 'foo', value: 'bar' },
      { key: 'bar', value: '123' },
    ]);
  });

  it('returns params where set replaces previous value', () => {
    const urlParams = [
      { key: 'foo', value: 'bar' },
      { key: 'bar', value: '123' },
    ];
    const paramActions = {
      set: {
        bar: '456',
      },
    };
    expect(resolveUrlParams(urlParams, paramActions)).to.eql([
      { key: 'foo', value: 'bar' },
      { key: 'bar', value: '456' },
    ]);
  });

  it('returns params where toggle sets param value', () => {
    const urlParams = [
      { key: 'foo', value: 'bar' },
    ];
    const paramActions = {
      toggle: {
        bar: '456',
      },
    };
    expect(resolveUrlParams(urlParams, paramActions)).to.eql([
      { key: 'foo', value: 'bar' },
      { key: 'bar', value: '456' },
    ]);
  });

  it('returns params where toggle removes param value', () => {
    const urlParams = [
      { key: 'foo', value: 'bar' },
    ];
    const paramActions = {
      toggle: {
        foo: 'bar',
      },
    };
    expect(resolveUrlParams(urlParams, paramActions)).to.eql([]);
  });

  it('returns params where toggle sets param value when its found, but different value', () => {
    const urlParams = [
      { key: 'foo', value: 'bar' },
    ];
    const paramActions = {
      toggle: {
        foo: 'barz',
      },
    };
    expect(resolveUrlParams(urlParams, paramActions)).to.eql([
      {
        key: 'foo',
        value: 'barz',
      },
    ]);
  });
});

describe('constructUrlParams', () => {
  it('returns empty string for empty params', () => {
    expect(constructUrlParams([])).to.eql('');
  });

  it('returns ampersand joined params with values', () => {
    expect(constructUrlParams([
      { key: 'foo', value: 'bar' },
      { key: 'bar', value: '123' },
    ])).to.eql('foo=bar&bar=123');
  });
});
