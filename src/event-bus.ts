import mitt from "mitt";

declare global {
  interface Window {
    _FCEventBus: EventBus;
  }
}

/**
 * Basic event emitter interface
 */
export interface EventBus {
  emit: (event: any) => void;
  on: (event: any, cb: (data: any) => void) => void;
}

/**
 * Global event bus
 */
if (!window._FCEventBus) {
  window._FCEventBus = createEventBus();
}

/**
 * Getter for global event bus
 */
export function getGlobalEventBus(): EventBus {
  return window._FCEventBus;
}

/**
 * Create a new event bus
 * A small wrapper around an external event emitting library
 */
export function createEventBus(): EventBus {
  return mitt();
}

/**
 * Emit event on global bus
 */
export function emitOnGlobalBus(event: any) {
  const bus = getGlobalEventBus();
  return bus.emit(event);
}

/**
 * Handle event from global bus
 * event will be scoped in service event bus
 */
export function onEventOnGlobalBus(event: any, cb: (data: any) => void) {
  const bus = getGlobalEventBus();
  return bus.on(event, cb);
}
