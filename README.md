# Query String Manipulator

[![CircleCI](https://circleci.com/gh/BerryCloud/js-query-string-manipulator.svg?style=shield)](https://circleci.com/gh/BerryCloud/js-query-string-manipulator)

Effortlessly manipulate query string parameters into your desired URL. You pass url and a set of actions to be done to QSM and you get you URL string back.

## Install

QSM is written for ES modules

```javascript
npm install query-string-manipulator
```

## Usage

Lets assume that you already have it imported

```javascript
import qsm from 'query-string-manipulator';
```

### Set parameters

Lets say that you want to add page number to a search result.

```javascript
qsm('https://www.google.cz/search?q=hello+world', {
  set: {
    num: 20,
  }
});
// https://www.google.cz/search?q=hello+world&num=20
```

It also works if the page number is already set

```javascript
qsm('https://www.google.cz/search?q=hello+world&num=20', {
  set: {
    num: 40,
  }
});
// https://www.google.cz/search?q=hello+world&num=40
```

### Remove parameters

Say that you now want to go back to first page

```javascript
qsm('https://www.google.cz/search?q=hello+world&num=20', {
  remove: ['num']
});
// https://www.google.cz/search?q=hello+world
```

Or go to the empty search page
```javascript
qsm('https://www.google.cz/search?q=hello+world&num=20', {
  remove: ['q', 'num']
});
// https://www.google.cz/search
```

### Toggle parameters

Say that you have a button on your page that enables filter and disables it when you click it again.
```javascript
qsm('https://www.google.cz/search?q=hello+world&num=20', {
  toggle: {
    tbm: 'isch',
  }
});
// https://www.google.cz/search?q=hello+world&num=20&tbm=isch

qsm('https://www.google.cz/search?q=hello+world&num=20&tbm=isch', {
  toggle: {
    tbm: 'isch',
  }
});
// https://www.google.cz/search?q=hello+world&num=20
```


### Constants

If you like "symbols", you can go like this:

```javascript
import qsm, {
  URL_REMOVE, // Used for remove
  URL_SET, // Used for set
  URL_TOGGLE, // Used for toggle
} from 'query-string-manipulator';

qsm('http://example.com/', {
  [URL_REMOVE]: ['test'],
  [URL_TOGGLE]: [
    {
      key: 'foo',
      value: 'bar',
    },
  ],
  [URL_SET]: [
    {
      key: 'xxx',
      value: '123',
    },
  ]
})
```

### Support methods

But wait, there is more!

#### Getting URL params

Method `getUrlParams` returns list of all parameters in form of array of objects. It cannot be returned in form of key-pair values because there can be multiple same name query params.

```javascript
getUrlParams('https://example.com/foo?select=users&getId=10')

/* returns
[
  {
    key: 'select',
    value: 'users'
  },
  {
    key: 'getId',
    value: '10',
  }
]
*/
```

#### Resolve URL params

Method `resolveUrlParams` returns parameters after changed by user specified actions.

```javascript
const urlParams = [
  {
    key: 'select',
    value: 'users'
  },
  {
    key: 'getId',
    value: '10'
  }
];
const paramActions = {
  remove: ['getId'],
  set: {
    select: 'userGroups',
  },
};
resolveUrlParams(urlParams, paramActions)

/* returns
[
  {
    key: 'select',
    value: 'userGroups'
  }
]
*/
```

#### Putting params together

Method `constructUrlParams` returns query string part of the URL from parameters.

```javascript
constructUrlParams([
  {
    key: 'select',
    value: 'users'
  },
  {
    key: 'getId',
    value: '10'
  }
])

// returns "select=users&getId=10"
```
