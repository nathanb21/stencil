import { Component, ConfigApi, Methods, PlatformApi, Props, ProxyElement, RendererApi, Watchers } from '../util/interfaces';
import { queueUpdate } from './update';
import { BOOLEAN_TYPE_CODE, NUMBER_TYPE_CODE } from '../util/data-parse';


export function initProps(plt: PlatformApi, config: ConfigApi, renderer: RendererApi, elm: ProxyElement, tag: string, instance: Component, props: Props, methods: Methods, watchers: Watchers) {
  const propValues: {[propName: string]: any} = {};

  if (methods) {
    methods.forEach(methodName => {

      // dom's element instance
      Object.defineProperty(elm, methodName, {
        configurable: true,
        value: instance[methodName].bind(instance)
      });

    });
  }

  Object.keys(props).forEach(propName => {
    const watcher: Function = (watchers[propName]) ? instance[watchers[propName].fn].bind(instance) : null;

    propValues[propName] = getInitialValue(config, elm, instance, props[propName].type, propName);

    function getPropValue() {
      return propValues[propName];
    }

    function setPropValue(value: any) {
      if (propValues[propName] !== value) {
        propValues[propName] = value;

        watcher && watcher(value);

        queueUpdate(plt, config, renderer, elm, tag);
      }
    }

    // dom's element instance
    Object.defineProperty(elm, propName, {
      configurable: true,
      get: getPropValue,
      set: setPropValue
    });

    // user's component class instance
    Object.defineProperty(instance, propName, {
      configurable: true,
      get: getPropValue,
      set: setPropValue
    });

  });
}


function getInitialValue(config: ConfigApi, elm: ProxyElement, instance: Component, propTypeCode: number, propName: string): any {
  if (elm[propName] !== undefined) {
    return elm[propName];
  }

  if (instance[propName] !== undefined) {
    return instance[propName];
  }

  if (propTypeCode === BOOLEAN_TYPE_CODE) {
    return config.getBoolean(propName);
  }

  if (propTypeCode === NUMBER_TYPE_CODE) {
    return config.getNumber(propName);
  }

  return config.get(propName);
}
