import { EventDispatcher } from 'three';

// Minimal shim to satisfy OrbitControls when using a three.module.js version
// that does not export `Controls`. Provides a compatible surface used by
// OrbitControls: constructor(object, domElement), connect(), disconnect(), dispose().
class Controls extends EventDispatcher {
  constructor(object, domElement = null) {
    super();
    this.object = object;           // The camera or object being controlled
    this.domElement = domElement;   // The DOM element for events (can be null)
    this.enabled = true;            // Standard enabled flag used by controls
  }

  connect(element) {
    // Assign/replace the DOM element used to register events
    this.domElement = element;
  }

  disconnect() {
    // OrbitControls manages its own event listeners; base has nothing to do
  }

  dispose() {
    // By convention dispose disconnects
    this.disconnect();
  }
}

export { Controls };
