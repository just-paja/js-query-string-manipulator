# Query String Manipulator

[![CircleCI](https://circleci.com/gh/BerryCloud/js-query-string-manipulator.svg?style=shield)](https://circleci.com/gh/BerryCloud/js-query-string-manipulator)

Effortlessly manipulate query string parameters into your desired URL. You pass url and a set of actions to be done to QSM and you get you URL string back.

## Install

QSM is written for ES modules

```
npm install query-string-manipulator
```

## Usage

Lets assume that you already have it imported

```
import qsm from 'query-string-manipulator';
```

### Set parameters

Lets say that you want to add page number to a search result.

```
qsm('https://www.google.cz/search?q=hello+world', {
  set: {
    num: 20,
  }
});
// https://www.google.cz/search?q=hello+world&num=20
```

It also works if the page number is already set

```
qsm('https://www.google.cz/search?q=hello+world&num=20', {
  set: {
    num: 40,
  }
});
// https://www.google.cz/search?q=hello+world&num=40
```

### Remove parameters

Say that you now want to go back to first page

```
qsm('https://www.google.cz/search?q=hello+world&num=20', {
  remove: ['num']
});
// https://www.google.cz/search?q=hello+world
```

Or go to the empty search page
```
qsm('https://www.google.cz/search?q=hello+world&num=20', {
  remove: ['q', 'num']
});
// https://www.google.cz/search
```

### Toggle parameters

Say that you have a button on your page that enables filter and disables it when you click it again.
```
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

```
import {
  URL_REMOVE, // Used for remove
  URL_SET, // Used for set
  URL_TOGGLE, // Used for toggle
} from 'query-string-manipulator';
```
