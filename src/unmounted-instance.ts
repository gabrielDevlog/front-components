import { setMountedInstance, resetMountedInstance } from "./mounted-instance";
import { createEventBus, getGlobalEventBus } from "./event-bus";
import {
  ServiceInstance,
  BaseInstance,
  ServiceControls,
} from "./service-instance";

declare global {
  interface Window {
    _FCStore: Array<ServiceInstance>;
  }
}

// Store instances of different services by id
// It's in window object, so everyone can acess it
if (!window._FCStore) {
  window._FCStore = [];
}

/**
 * Retrieve providers store,
 * for easier access and typing
 */
function getInstancesStore(): Array<ServiceInstance> {
  return window._FCStore;
}

/**
 * Find a provider using it's id
 */
function findInstance(serviceId: string) {
  const store = getInstancesStore();
  return store.find((i) => i.serviceId === serviceId);
}

/**
 * An instance is considered as available for mounting if it has not been mounted yet
 */
function findUnmountedInstanceByServiceId(serviceId: string) {
  const store = getInstancesStore();
  return store.find((i) => i.serviceId === serviceId && !i.domElement);
}

/**
 * Find a mounted instance on a given DOM node
 */
function findMountedInstanceOnNode(serviceId: string, domElement: HTMLElement) {
  const store = getInstancesStore();
  return store.find(
    (i) => i.serviceId === serviceId && i.domElement === domElement
  );
}

/**
 * Factory of control object
 * for initialization
 */
function controlFactory(): ServiceControls {
  return {
    history: {
      push: () => {}, // has to be overrided if controlled
    },
    events: getGlobalEventBus(), // has to be overrided if controlled
  };
}

/**
 * Add a free instance into the store
 *
 * We may have the same service instance several time in the store
 * corresponding to the same serviceId
 * To distinguish between them, we internally add an instanceId
 *
 * This is call from service A, and register an instance into global window
 */
export function registerInstance(instance: BaseInstance) {
  const alreadyExists = findInstance(instance.serviceId);
  const instanceId = alreadyExists ? alreadyExists.instanceId + 1 : 0;

  const store = getInstancesStore();

  // controls
  const controls = controlFactory();

  // Enrich base definition with setMountedDefinition
  store.push({
    ...instance,
    instanceId,

    // following function knows JS module of service A
    controls,
    setMountedInstance,
    resetMountedInstance,
  });
}

/**
 * Options to provide when mouting a service
 */
export interface instantiateOptions {
  isControlled: boolean;
}

/**
 * Start an instance at a given domElement
 *
 * this is call from service B, and grab an instance from global window
 */
export async function instantiateAt(
  serviceId: string,
  domElement: HTMLElement,
  options: instantiateOptions = {
    isControlled: false,
  }
) {
  const instance = findUnmountedInstanceByServiceId(serviceId);
  if (!instance) {
    throw new Error(`No available instance for service ${serviceId}`);
  }

  instance.domElement = domElement;
  instance.isControlled = options.isControlled;

  // Override event bus for controlled instance
  if (options.isControlled) {
    instance.controls.events = createEventBus();
  }

  // This is where service B tells service A it created an instance of it
  instance.setMountedInstance(instance);

  await instance.mount(domElement);

  return instance.controls;
}

export async function unmountFom(serviceId: string, domElement: HTMLElement) {
  const instance = findMountedInstanceOnNode(serviceId, domElement);
  if (!instance) {
    throw new Error(
      `No mounted instance for service ${serviceId} at ${domElement}`
    );
  }

  await instance.unmount(domElement);

  // Unregister instance from runtime scope
  instance.resetMountedInstance();

  // Reset instance to its unmounted state
  instance.controls = controlFactory(); // TODO: remove all events listener ?
  instance.domElement = undefined;
  instance.isControlled = undefined;
}
