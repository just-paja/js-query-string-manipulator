interface ParamValue {
  key: string;
  value: string;
}

interface ParamMap {
  [key: string]: any;
}

interface ParamActions {
  remove: string[];
  set: ParamMap;
  toggle: ParamMap;
}

declare module 'query-string-manipulator' {
  function constructUrlParams(params: ParamValue[]): string;
  function getUrlParams(url: string): ParamValue[];
  function qsm(url: string, paramActions?: ParamActions): string;
  function resolveUrlParams(prevParams: ParamValue[], paramActions: ParamActions): ParamValue[];
}
