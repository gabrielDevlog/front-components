import * as unmounted from "./unmounted-instance";
import { getMountedInstance } from "./mounted-instance";
import { emitOnGlobalBus, onEventOnGlobalBus } from "./event-bus";

/**
 * Register an instance of a service, ready to be mounted on a DOM element
 */
export const registerInstance = unmounted.registerInstance;

/**
 * Instantiate an instance of service
 * registerInstance should have been called before
 */
export const instantiateAt = unmounted.instantiateAt;

/**
 * Emit an event in global or mounted instance event bus
 */
export function emit(event: any) {
  const mountedInstance = getMountedInstance();

  return mountedInstance
    ? mountedInstance.controls.events.emit(event)
    : emitOnGlobalBus(event);
}

/**
 * Handle an event coming from global or instance event bus
 */
export function on(event: any, cb: (data: any) => void) {
  const mountedInstance = getMountedInstance();

  return mountedInstance
    ? mountedInstance.controls.events.on(event, cb)
    : onEventOnGlobalBus(event, cb);
}

/**
 * For plugins usage only
 */
export const __getMountedInstance = getMountedInstance;
