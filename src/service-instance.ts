import { EventBus } from "./event-bus";

/**
 * Instance of a service: base definition
 *
 * Mount & unmount points to a real JS module, so their scope are bound to a given module scope
 * This bounded module is what we call a "service instance" here
 *
 */
export interface BaseInstance {
  /**
   * Service unique identifier
   */
  serviceId: string;

  /**
   * Mounting function: run a service instance in a given DOM node
   */
  mount: (element: HTMLElement) => Promise<void>;

  /**
   * Unmounting function: detach this service instance from its node
   */
  unmount: (element: HTMLElement) => Promise<void>;
}

/**
 * Controls of a service,
 * so it can be controlled by other services
 */
export interface ServiceControls {
  /**
   * Routing
   */
  history: {
    push: (path: string) => void;
  };

  /**
   * Events
   */
  events: EventBus;
}

/**
 * Service provider
 *
 * When mounted, a provider provides an instance of a service
 *
 * Here we store providers corresponding to different services, identified by service Id
 *
 * For a given service, we may have same provider definition loaded different time
 * This way, we can run the same service in the same html page, each with a different router & event bus
 *
 * instanceId is an auto-generated index to distinguish between different provider of a same serviceId
 */
export interface ServiceInstance extends BaseInstance {
  /**
   * Auto-generated unique index of a provider for a same serviceId
   */
  instanceId: number;

  /**
   * Some hooks to this instance router & eventBus
   */
  controls: ServiceControls;

  /**
   * Where the instance is mounted
   */
  domElement?: HTMLElement;

  /**
   * Is this instance running in "controlled" or "uncontrolled" mode
   */
  isControlled?: boolean;

  /**
   * Followings function are registered in such manner instances of service A & B can communicate.
   */

  /**
   * Set runtime of an instance
   * So service A can create this module and register it in service B scope
   *
   * addProvider has been called by service A
   * so here we are in module scope of service A
   * later, service B will call a mount function,
   * which will create an instance of service A in the module scope of service B
   * by calling this function, we can pass this instance from module B scope to module A scope
   */
  setMountedInstance: (instance: ServiceInstance) => void;

  /**
   * Reset runtime instance to null
   */
  resetMountedInstance: () => void;
}
