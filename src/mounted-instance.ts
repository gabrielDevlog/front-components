import { ServiceInstance } from "./service-instance";

/**
 * The service instance once mounted on a dom element
 */
let mountedInstance: ServiceInstance | null = null;

/**
 * Register a module as the module providing current service
 */
export function setMountedInstance(instance: ServiceInstance) {
  if (mountedInstance) {
    throw new Error("Mounted instance already defined");
  }

  mountedInstance = instance;
}

/**
 * A getter of the mounted instance
 */
export function getMountedInstance() {
  return mountedInstance;
}

/**
 * Reset mounted instance
 */
export function resetMountedInstance() {
  mountedInstance = null;
}
