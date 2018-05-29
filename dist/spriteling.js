(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.Spriteling = factory());
}(this, (function () { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */

    var __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };

    function __awaiter(thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [0, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    }

    var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by rollup-plugin-commonjs');
    }

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var es6Promise = createCommonjsModule(function (module, exports) {
    /*!
     * @overview es6-promise - a tiny implementation of Promises/A+.
     * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
     * @license   Licensed under MIT license
     *            See https://raw.githubusercontent.com/stefanpenner/es6-promise/master/LICENSE
     * @version   v4.2.4+314e4831
     */

    (function (global, factory) {
    	module.exports = factory();
    }(commonjsGlobal, (function () {
    function objectOrFunction(x) {
      var type = typeof x;
      return x !== null && (type === 'object' || type === 'function');
    }

    function isFunction(x) {
      return typeof x === 'function';
    }



    var _isArray = void 0;
    if (Array.isArray) {
      _isArray = Array.isArray;
    } else {
      _isArray = function (x) {
        return Object.prototype.toString.call(x) === '[object Array]';
      };
    }

    var isArray = _isArray;

    var len = 0;
    var vertxNext = void 0;
    var customSchedulerFn = void 0;

    var asap = function asap(callback, arg) {
      queue[len] = callback;
      queue[len + 1] = arg;
      len += 2;
      if (len === 2) {
        // If len is 2, that means that we need to schedule an async flush.
        // If additional callbacks are queued before the queue is flushed, they
        // will be processed by this flush that we are scheduling.
        if (customSchedulerFn) {
          customSchedulerFn(flush);
        } else {
          scheduleFlush();
        }
      }
    };

    function setScheduler(scheduleFn) {
      customSchedulerFn = scheduleFn;
    }

    function setAsap(asapFn) {
      asap = asapFn;
    }

    var browserWindow = typeof window !== 'undefined' ? window : undefined;
    var browserGlobal = browserWindow || {};
    var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
    var isNode = typeof self === 'undefined' && typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

    // test for web worker but not in IE10
    var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';

    // node
    function useNextTick() {
      // node version 0.10.x displays a deprecation warning when nextTick is used recursively
      // see https://github.com/cujojs/when/issues/410 for details
      return function () {
        return process.nextTick(flush);
      };
    }

    // vertx
    function useVertxTimer() {
      if (typeof vertxNext !== 'undefined') {
        return function () {
          vertxNext(flush);
        };
      }

      return useSetTimeout();
    }

    function useMutationObserver() {
      var iterations = 0;
      var observer = new BrowserMutationObserver(flush);
      var node = document.createTextNode('');
      observer.observe(node, { characterData: true });

      return function () {
        node.data = iterations = ++iterations % 2;
      };
    }

    // web worker
    function useMessageChannel() {
      var channel = new MessageChannel();
      channel.port1.onmessage = flush;
      return function () {
        return channel.port2.postMessage(0);
      };
    }

    function useSetTimeout() {
      // Store setTimeout reference so es6-promise will be unaffected by
      // other code modifying setTimeout (like sinon.useFakeTimers())
      var globalSetTimeout = setTimeout;
      return function () {
        return globalSetTimeout(flush, 1);
      };
    }

    var queue = new Array(1000);
    function flush() {
      for (var i = 0; i < len; i += 2) {
        var callback = queue[i];
        var arg = queue[i + 1];

        callback(arg);

        queue[i] = undefined;
        queue[i + 1] = undefined;
      }

      len = 0;
    }

    function attemptVertx() {
      try {
        var vertx = Function('return this')().require('vertx');
        vertxNext = vertx.runOnLoop || vertx.runOnContext;
        return useVertxTimer();
      } catch (e) {
        return useSetTimeout();
      }
    }

    var scheduleFlush = void 0;
    // Decide what async method to use to triggering processing of queued callbacks:
    if (isNode) {
      scheduleFlush = useNextTick();
    } else if (BrowserMutationObserver) {
      scheduleFlush = useMutationObserver();
    } else if (isWorker) {
      scheduleFlush = useMessageChannel();
    } else if (browserWindow === undefined && typeof commonjsRequire === 'function') {
      scheduleFlush = attemptVertx();
    } else {
      scheduleFlush = useSetTimeout();
    }

    function then(onFulfillment, onRejection) {
      var parent = this;

      var child = new this.constructor(noop);

      if (child[PROMISE_ID] === undefined) {
        makePromise(child);
      }

      var _state = parent._state;


      if (_state) {
        var callback = arguments[_state - 1];
        asap(function () {
          return invokeCallback(_state, child, callback, parent._result);
        });
      } else {
        subscribe(parent, child, onFulfillment, onRejection);
      }

      return child;
    }

    /**
      `Promise.resolve` returns a promise that will become resolved with the
      passed `value`. It is shorthand for the following:

      ```javascript
      let promise = new Promise(function(resolve, reject){
        resolve(1);
      });

      promise.then(function(value){
        // value === 1
      });
      ```

      Instead of writing the above, your code now simply becomes the following:

      ```javascript
      let promise = Promise.resolve(1);

      promise.then(function(value){
        // value === 1
      });
      ```

      @method resolve
      @static
      @param {Any} value value that the returned promise will be resolved with
      Useful for tooling.
      @return {Promise} a promise that will become fulfilled with the given
      `value`
    */
    function resolve$1(object) {
      /*jshint validthis:true */
      var Constructor = this;

      if (object && typeof object === 'object' && object.constructor === Constructor) {
        return object;
      }

      var promise = new Constructor(noop);
      resolve(promise, object);
      return promise;
    }

    var PROMISE_ID = Math.random().toString(36).substring(2);

    function noop() {}

    var PENDING = void 0;
    var FULFILLED = 1;
    var REJECTED = 2;

    var TRY_CATCH_ERROR = { error: null };

    function selfFulfillment() {
      return new TypeError("You cannot resolve a promise with itself");
    }

    function cannotReturnOwn() {
      return new TypeError('A promises callback cannot return that same promise.');
    }

    function getThen(promise) {
      try {
        return promise.then;
      } catch (error) {
        TRY_CATCH_ERROR.error = error;
        return TRY_CATCH_ERROR;
      }
    }

    function tryThen(then$$1, value, fulfillmentHandler, rejectionHandler) {
      try {
        then$$1.call(value, fulfillmentHandler, rejectionHandler);
      } catch (e) {
        return e;
      }
    }

    function handleForeignThenable(promise, thenable, then$$1) {
      asap(function (promise) {
        var sealed = false;
        var error = tryThen(then$$1, thenable, function (value) {
          if (sealed) {
            return;
          }
          sealed = true;
          if (thenable !== value) {
            resolve(promise, value);
          } else {
            fulfill(promise, value);
          }
        }, function (reason) {
          if (sealed) {
            return;
          }
          sealed = true;

          reject(promise, reason);
        }, 'Settle: ' + (promise._label || ' unknown promise'));

        if (!sealed && error) {
          sealed = true;
          reject(promise, error);
        }
      }, promise);
    }

    function handleOwnThenable(promise, thenable) {
      if (thenable._state === FULFILLED) {
        fulfill(promise, thenable._result);
      } else if (thenable._state === REJECTED) {
        reject(promise, thenable._result);
      } else {
        subscribe(thenable, undefined, function (value) {
          return resolve(promise, value);
        }, function (reason) {
          return reject(promise, reason);
        });
      }
    }

    function handleMaybeThenable(promise, maybeThenable, then$$1) {
      if (maybeThenable.constructor === promise.constructor && then$$1 === then && maybeThenable.constructor.resolve === resolve$1) {
        handleOwnThenable(promise, maybeThenable);
      } else {
        if (then$$1 === TRY_CATCH_ERROR) {
          reject(promise, TRY_CATCH_ERROR.error);
          TRY_CATCH_ERROR.error = null;
        } else if (then$$1 === undefined) {
          fulfill(promise, maybeThenable);
        } else if (isFunction(then$$1)) {
          handleForeignThenable(promise, maybeThenable, then$$1);
        } else {
          fulfill(promise, maybeThenable);
        }
      }
    }

    function resolve(promise, value) {
      if (promise === value) {
        reject(promise, selfFulfillment());
      } else if (objectOrFunction(value)) {
        handleMaybeThenable(promise, value, getThen(value));
      } else {
        fulfill(promise, value);
      }
    }

    function publishRejection(promise) {
      if (promise._onerror) {
        promise._onerror(promise._result);
      }

      publish(promise);
    }

    function fulfill(promise, value) {
      if (promise._state !== PENDING) {
        return;
      }

      promise._result = value;
      promise._state = FULFILLED;

      if (promise._subscribers.length !== 0) {
        asap(publish, promise);
      }
    }

    function reject(promise, reason) {
      if (promise._state !== PENDING) {
        return;
      }
      promise._state = REJECTED;
      promise._result = reason;

      asap(publishRejection, promise);
    }

    function subscribe(parent, child, onFulfillment, onRejection) {
      var _subscribers = parent._subscribers;
      var length = _subscribers.length;


      parent._onerror = null;

      _subscribers[length] = child;
      _subscribers[length + FULFILLED] = onFulfillment;
      _subscribers[length + REJECTED] = onRejection;

      if (length === 0 && parent._state) {
        asap(publish, parent);
      }
    }

    function publish(promise) {
      var subscribers = promise._subscribers;
      var settled = promise._state;

      if (subscribers.length === 0) {
        return;
      }

      var child = void 0,
          callback = void 0,
          detail = promise._result;

      for (var i = 0; i < subscribers.length; i += 3) {
        child = subscribers[i];
        callback = subscribers[i + settled];

        if (child) {
          invokeCallback(settled, child, callback, detail);
        } else {
          callback(detail);
        }
      }

      promise._subscribers.length = 0;
    }

    function tryCatch(callback, detail) {
      try {
        return callback(detail);
      } catch (e) {
        TRY_CATCH_ERROR.error = e;
        return TRY_CATCH_ERROR;
      }
    }

    function invokeCallback(settled, promise, callback, detail) {
      var hasCallback = isFunction(callback),
          value = void 0,
          error = void 0,
          succeeded = void 0,
          failed = void 0;

      if (hasCallback) {
        value = tryCatch(callback, detail);

        if (value === TRY_CATCH_ERROR) {
          failed = true;
          error = value.error;
          value.error = null;
        } else {
          succeeded = true;
        }

        if (promise === value) {
          reject(promise, cannotReturnOwn());
          return;
        }
      } else {
        value = detail;
        succeeded = true;
      }

      if (promise._state !== PENDING) ; else if (hasCallback && succeeded) {
        resolve(promise, value);
      } else if (failed) {
        reject(promise, error);
      } else if (settled === FULFILLED) {
        fulfill(promise, value);
      } else if (settled === REJECTED) {
        reject(promise, value);
      }
    }

    function initializePromise(promise, resolver) {
      try {
        resolver(function resolvePromise(value) {
          resolve(promise, value);
        }, function rejectPromise(reason) {
          reject(promise, reason);
        });
      } catch (e) {
        reject(promise, e);
      }
    }

    var id = 0;
    function nextId() {
      return id++;
    }

    function makePromise(promise) {
      promise[PROMISE_ID] = id++;
      promise._state = undefined;
      promise._result = undefined;
      promise._subscribers = [];
    }

    function validationError() {
      return new Error('Array Methods must be provided an Array');
    }

    var Enumerator = function () {
      function Enumerator(Constructor, input) {
        this._instanceConstructor = Constructor;
        this.promise = new Constructor(noop);

        if (!this.promise[PROMISE_ID]) {
          makePromise(this.promise);
        }

        if (isArray(input)) {
          this.length = input.length;
          this._remaining = input.length;

          this._result = new Array(this.length);

          if (this.length === 0) {
            fulfill(this.promise, this._result);
          } else {
            this.length = this.length || 0;
            this._enumerate(input);
            if (this._remaining === 0) {
              fulfill(this.promise, this._result);
            }
          }
        } else {
          reject(this.promise, validationError());
        }
      }

      Enumerator.prototype._enumerate = function _enumerate(input) {
        for (var i = 0; this._state === PENDING && i < input.length; i++) {
          this._eachEntry(input[i], i);
        }
      };

      Enumerator.prototype._eachEntry = function _eachEntry(entry, i) {
        var c = this._instanceConstructor;
        var resolve$$1 = c.resolve;


        if (resolve$$1 === resolve$1) {
          var _then = getThen(entry);

          if (_then === then && entry._state !== PENDING) {
            this._settledAt(entry._state, i, entry._result);
          } else if (typeof _then !== 'function') {
            this._remaining--;
            this._result[i] = entry;
          } else if (c === Promise$1) {
            var promise = new c(noop);
            handleMaybeThenable(promise, entry, _then);
            this._willSettleAt(promise, i);
          } else {
            this._willSettleAt(new c(function (resolve$$1) {
              return resolve$$1(entry);
            }), i);
          }
        } else {
          this._willSettleAt(resolve$$1(entry), i);
        }
      };

      Enumerator.prototype._settledAt = function _settledAt(state, i, value) {
        var promise = this.promise;


        if (promise._state === PENDING) {
          this._remaining--;

          if (state === REJECTED) {
            reject(promise, value);
          } else {
            this._result[i] = value;
          }
        }

        if (this._remaining === 0) {
          fulfill(promise, this._result);
        }
      };

      Enumerator.prototype._willSettleAt = function _willSettleAt(promise, i) {
        var enumerator = this;

        subscribe(promise, undefined, function (value) {
          return enumerator._settledAt(FULFILLED, i, value);
        }, function (reason) {
          return enumerator._settledAt(REJECTED, i, reason);
        });
      };

      return Enumerator;
    }();

    /**
      `Promise.all` accepts an array of promises, and returns a new promise which
      is fulfilled with an array of fulfillment values for the passed promises, or
      rejected with the reason of the first passed promise to be rejected. It casts all
      elements of the passed iterable to promises as it runs this algorithm.

      Example:

      ```javascript
      let promise1 = resolve(1);
      let promise2 = resolve(2);
      let promise3 = resolve(3);
      let promises = [ promise1, promise2, promise3 ];

      Promise.all(promises).then(function(array){
        // The array here would be [ 1, 2, 3 ];
      });
      ```

      If any of the `promises` given to `all` are rejected, the first promise
      that is rejected will be given as an argument to the returned promises's
      rejection handler. For example:

      Example:

      ```javascript
      let promise1 = resolve(1);
      let promise2 = reject(new Error("2"));
      let promise3 = reject(new Error("3"));
      let promises = [ promise1, promise2, promise3 ];

      Promise.all(promises).then(function(array){
        // Code here never runs because there are rejected promises!
      }, function(error) {
        // error.message === "2"
      });
      ```

      @method all
      @static
      @param {Array} entries array of promises
      @param {String} label optional string for labeling the promise.
      Useful for tooling.
      @return {Promise} promise that is fulfilled when all `promises` have been
      fulfilled, or rejected if any of them become rejected.
      @static
    */
    function all(entries) {
      return new Enumerator(this, entries).promise;
    }

    /**
      `Promise.race` returns a new promise which is settled in the same way as the
      first passed promise to settle.

      Example:

      ```javascript
      let promise1 = new Promise(function(resolve, reject){
        setTimeout(function(){
          resolve('promise 1');
        }, 200);
      });

      let promise2 = new Promise(function(resolve, reject){
        setTimeout(function(){
          resolve('promise 2');
        }, 100);
      });

      Promise.race([promise1, promise2]).then(function(result){
        // result === 'promise 2' because it was resolved before promise1
        // was resolved.
      });
      ```

      `Promise.race` is deterministic in that only the state of the first
      settled promise matters. For example, even if other promises given to the
      `promises` array argument are resolved, but the first settled promise has
      become rejected before the other promises became fulfilled, the returned
      promise will become rejected:

      ```javascript
      let promise1 = new Promise(function(resolve, reject){
        setTimeout(function(){
          resolve('promise 1');
        }, 200);
      });

      let promise2 = new Promise(function(resolve, reject){
        setTimeout(function(){
          reject(new Error('promise 2'));
        }, 100);
      });

      Promise.race([promise1, promise2]).then(function(result){
        // Code here never runs
      }, function(reason){
        // reason.message === 'promise 2' because promise 2 became rejected before
        // promise 1 became fulfilled
      });
      ```

      An example real-world use case is implementing timeouts:

      ```javascript
      Promise.race([ajax('foo.json'), timeout(5000)])
      ```

      @method race
      @static
      @param {Array} promises array of promises to observe
      Useful for tooling.
      @return {Promise} a promise which settles in the same way as the first passed
      promise to settle.
    */
    function race(entries) {
      /*jshint validthis:true */
      var Constructor = this;

      if (!isArray(entries)) {
        return new Constructor(function (_, reject) {
          return reject(new TypeError('You must pass an array to race.'));
        });
      } else {
        return new Constructor(function (resolve, reject) {
          var length = entries.length;
          for (var i = 0; i < length; i++) {
            Constructor.resolve(entries[i]).then(resolve, reject);
          }
        });
      }
    }

    /**
      `Promise.reject` returns a promise rejected with the passed `reason`.
      It is shorthand for the following:

      ```javascript
      let promise = new Promise(function(resolve, reject){
        reject(new Error('WHOOPS'));
      });

      promise.then(function(value){
        // Code here doesn't run because the promise is rejected!
      }, function(reason){
        // reason.message === 'WHOOPS'
      });
      ```

      Instead of writing the above, your code now simply becomes the following:

      ```javascript
      let promise = Promise.reject(new Error('WHOOPS'));

      promise.then(function(value){
        // Code here doesn't run because the promise is rejected!
      }, function(reason){
        // reason.message === 'WHOOPS'
      });
      ```

      @method reject
      @static
      @param {Any} reason value that the returned promise will be rejected with.
      Useful for tooling.
      @return {Promise} a promise rejected with the given `reason`.
    */
    function reject$1(reason) {
      /*jshint validthis:true */
      var Constructor = this;
      var promise = new Constructor(noop);
      reject(promise, reason);
      return promise;
    }

    function needsResolver() {
      throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
    }

    function needsNew() {
      throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
    }

    /**
      Promise objects represent the eventual result of an asynchronous operation. The
      primary way of interacting with a promise is through its `then` method, which
      registers callbacks to receive either a promise's eventual value or the reason
      why the promise cannot be fulfilled.

      Terminology
      -----------

      - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
      - `thenable` is an object or function that defines a `then` method.
      - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
      - `exception` is a value that is thrown using the throw statement.
      - `reason` is a value that indicates why a promise was rejected.
      - `settled` the final resting state of a promise, fulfilled or rejected.

      A promise can be in one of three states: pending, fulfilled, or rejected.

      Promises that are fulfilled have a fulfillment value and are in the fulfilled
      state.  Promises that are rejected have a rejection reason and are in the
      rejected state.  A fulfillment value is never a thenable.

      Promises can also be said to *resolve* a value.  If this value is also a
      promise, then the original promise's settled state will match the value's
      settled state.  So a promise that *resolves* a promise that rejects will
      itself reject, and a promise that *resolves* a promise that fulfills will
      itself fulfill.


      Basic Usage:
      ------------

      ```js
      let promise = new Promise(function(resolve, reject) {
        // on success
        resolve(value);

        // on failure
        reject(reason);
      });

      promise.then(function(value) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Advanced Usage:
      ---------------

      Promises shine when abstracting away asynchronous interactions such as
      `XMLHttpRequest`s.

      ```js
      function getJSON(url) {
        return new Promise(function(resolve, reject){
          let xhr = new XMLHttpRequest();

          xhr.open('GET', url);
          xhr.onreadystatechange = handler;
          xhr.responseType = 'json';
          xhr.setRequestHeader('Accept', 'application/json');
          xhr.send();

          function handler() {
            if (this.readyState === this.DONE) {
              if (this.status === 200) {
                resolve(this.response);
              } else {
                reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
              }
            }
          };
        });
      }

      getJSON('/posts.json').then(function(json) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Unlike callbacks, promises are great composable primitives.

      ```js
      Promise.all([
        getJSON('/posts'),
        getJSON('/comments')
      ]).then(function(values){
        values[0] // => postsJSON
        values[1] // => commentsJSON

        return values;
      });
      ```

      @class Promise
      @param {Function} resolver
      Useful for tooling.
      @constructor
    */

    var Promise$1 = function () {
      function Promise(resolver) {
        this[PROMISE_ID] = nextId();
        this._result = this._state = undefined;
        this._subscribers = [];

        if (noop !== resolver) {
          typeof resolver !== 'function' && needsResolver();
          this instanceof Promise ? initializePromise(this, resolver) : needsNew();
        }
      }

      /**
      The primary way of interacting with a promise is through its `then` method,
      which registers callbacks to receive either a promise's eventual value or the
      reason why the promise cannot be fulfilled.
       ```js
      findUser().then(function(user){
        // user is available
      }, function(reason){
        // user is unavailable, and you are given the reason why
      });
      ```
       Chaining
      --------
       The return value of `then` is itself a promise.  This second, 'downstream'
      promise is resolved with the return value of the first promise's fulfillment
      or rejection handler, or rejected if the handler throws an exception.
       ```js
      findUser().then(function (user) {
        return user.name;
      }, function (reason) {
        return 'default name';
      }).then(function (userName) {
        // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
        // will be `'default name'`
      });
       findUser().then(function (user) {
        throw new Error('Found user, but still unhappy');
      }, function (reason) {
        throw new Error('`findUser` rejected and we're unhappy');
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
        // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
      });
      ```
      If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.
       ```js
      findUser().then(function (user) {
        throw new PedagogicalException('Upstream error');
      }).then(function (value) {
        // never reached
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // The `PedgagocialException` is propagated all the way down to here
      });
      ```
       Assimilation
      ------------
       Sometimes the value you want to propagate to a downstream promise can only be
      retrieved asynchronously. This can be achieved by returning a promise in the
      fulfillment or rejection handler. The downstream promise will then be pending
      until the returned promise is settled. This is called *assimilation*.
       ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // The user's comments are now available
      });
      ```
       If the assimliated promise rejects, then the downstream promise will also reject.
       ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // If `findCommentsByAuthor` fulfills, we'll have the value here
      }, function (reason) {
        // If `findCommentsByAuthor` rejects, we'll have the reason here
      });
      ```
       Simple Example
      --------------
       Synchronous Example
       ```javascript
      let result;
       try {
        result = findResult();
        // success
      } catch(reason) {
        // failure
      }
      ```
       Errback Example
       ```js
      findResult(function(result, err){
        if (err) {
          // failure
        } else {
          // success
        }
      });
      ```
       Promise Example;
       ```javascript
      findResult().then(function(result){
        // success
      }, function(reason){
        // failure
      });
      ```
       Advanced Example
      --------------
       Synchronous Example
       ```javascript
      let author, books;
       try {
        author = findAuthor();
        books  = findBooksByAuthor(author);
        // success
      } catch(reason) {
        // failure
      }
      ```
       Errback Example
       ```js
       function foundBooks(books) {
       }
       function failure(reason) {
       }
       findAuthor(function(author, err){
        if (err) {
          failure(err);
          // failure
        } else {
          try {
            findBoooksByAuthor(author, function(books, err) {
              if (err) {
                failure(err);
              } else {
                try {
                  foundBooks(books);
                } catch(reason) {
                  failure(reason);
                }
              }
            });
          } catch(error) {
            failure(err);
          }
          // success
        }
      });
      ```
       Promise Example;
       ```javascript
      findAuthor().
        then(findBooksByAuthor).
        then(function(books){
          // found books
      }).catch(function(reason){
        // something went wrong
      });
      ```
       @method then
      @param {Function} onFulfilled
      @param {Function} onRejected
      Useful for tooling.
      @return {Promise}
      */

      /**
      `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
      as the catch block of a try/catch statement.
      ```js
      function findAuthor(){
      throw new Error('couldn't find that author');
      }
      // synchronous
      try {
      findAuthor();
      } catch(reason) {
      // something went wrong
      }
      // async with promises
      findAuthor().catch(function(reason){
      // something went wrong
      });
      ```
      @method catch
      @param {Function} onRejection
      Useful for tooling.
      @return {Promise}
      */


      Promise.prototype.catch = function _catch(onRejection) {
        return this.then(null, onRejection);
      };

      /**
        `finally` will be invoked regardless of the promise's fate just as native
        try/catch/finally behaves
      
        Synchronous example:
      
        ```js
        findAuthor() {
          if (Math.random() > 0.5) {
            throw new Error();
          }
          return new Author();
        }
      
        try {
          return findAuthor(); // succeed or fail
        } catch(error) {
          return findOtherAuther();
        } finally {
          // always runs
          // doesn't affect the return value
        }
        ```
      
        Asynchronous example:
      
        ```js
        findAuthor().catch(function(reason){
          return findOtherAuther();
        }).finally(function(){
          // author was either found, or not
        });
        ```
      
        @method finally
        @param {Function} callback
        @return {Promise}
      */


      Promise.prototype.finally = function _finally(callback) {
        var promise = this;
        var constructor = promise.constructor;

        return promise.then(function (value) {
          return constructor.resolve(callback()).then(function () {
            return value;
          });
        }, function (reason) {
          return constructor.resolve(callback()).then(function () {
            throw reason;
          });
        });
      };

      return Promise;
    }();

    Promise$1.prototype.then = then;
    Promise$1.all = all;
    Promise$1.race = race;
    Promise$1.resolve = resolve$1;
    Promise$1.reject = reject$1;
    Promise$1._setScheduler = setScheduler;
    Promise$1._setAsap = setAsap;
    Promise$1._asap = asap;

    /*global self*/
    function polyfill() {
      var local = void 0;

      if (typeof commonjsGlobal !== 'undefined') {
        local = commonjsGlobal;
      } else if (typeof self !== 'undefined') {
        local = self;
      } else {
        try {
          local = Function('return this')();
        } catch (e) {
          throw new Error('polyfill failed because global object is unavailable in this environment');
        }
      }

      var P = local.Promise;

      if (P) {
        var promiseToString = null;
        try {
          promiseToString = Object.prototype.toString.call(P.resolve());
        } catch (e) {
          // silently ignored
        }

        if (promiseToString === '[object Promise]' && !P.cast) {
          return;
        }
      }

      local.Promise = Promise$1;
    }

    // Strange compat..
    Promise$1.polyfill = polyfill;
    Promise$1.Promise = Promise$1;

    return Promise$1;

    })));




    });

    /*
     * Modified version of http://github.com/desandro/imagesloaded v2.1.1
     * MIT License. by Paul Irish et al.
     */

    var BLANK = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

    function loaded(image, callback) {
      var src
        , old
        ;

      if (!image.nodeName) return callback(new Error('First argument must be an image element'))
      if (image.nodeName.toLowerCase() !== 'img') return callback(new Error('Element supplied is not an image'))
      if (image.src  && image.complete && image.naturalWidth !== undefined) return callback(null, true)

      old = !image.addEventListener;

      function loaded() {
        if (old) {
          image.detachEvent('onload', loaded);
        } else {
          image.removeEventListener('load', loaded, false);
        }
        callback(null, false);
      }

      if (old) {
        image.attachEvent('onload', loaded);
      } else {
        image.addEventListener('load', loaded, false);
      }

      if (image.readyState || image.complete) {
        src = image.src;
        image.src = BLANK;
        image.src = src;
      }
    }

    var imageLoaded = loaded;

    var performanceNow = createCommonjsModule(function (module) {
    // Generated by CoffeeScript 1.12.2
    (function() {
      var getNanoSeconds, hrtime, loadTime, moduleLoadTime, nodeLoadTime, upTime;

      if ((typeof performance !== "undefined" && performance !== null) && performance.now) {
        module.exports = function() {
          return performance.now();
        };
      } else if ((typeof process !== "undefined" && process !== null) && process.hrtime) {
        module.exports = function() {
          return (getNanoSeconds() - nodeLoadTime) / 1e6;
        };
        hrtime = process.hrtime;
        getNanoSeconds = function() {
          var hr;
          hr = hrtime();
          return hr[0] * 1e9 + hr[1];
        };
        moduleLoadTime = getNanoSeconds();
        upTime = process.uptime() * 1e9;
        nodeLoadTime = moduleLoadTime - upTime;
      } else if (Date.now) {
        module.exports = function() {
          return Date.now() - loadTime;
        };
        loadTime = Date.now();
      } else {
        module.exports = function() {
          return new Date().getTime() - loadTime;
        };
        loadTime = new Date().getTime();
      }

    }).call(commonjsGlobal);


    });

    var root = typeof window === 'undefined' ? commonjsGlobal : window
      , vendors = ['moz', 'webkit']
      , suffix = 'AnimationFrame'
      , raf = root['request' + suffix]
      , caf = root['cancel' + suffix] || root['cancelRequest' + suffix];

    for(var i = 0; !raf && i < vendors.length; i++) {
      raf = root[vendors[i] + 'Request' + suffix];
      caf = root[vendors[i] + 'Cancel' + suffix]
          || root[vendors[i] + 'CancelRequest' + suffix];
    }

    // Some versions of FF have rAF but not cAF
    if(!raf || !caf) {
      var last = 0
        , id = 0
        , queue = []
        , frameDuration = 1000 / 60;

      raf = function(callback) {
        if(queue.length === 0) {
          var _now = performanceNow()
            , next = Math.max(0, frameDuration - (_now - last));
          last = next + _now;
          setTimeout(function() {
            var cp = queue.slice(0);
            // Clear queue here to prevent
            // callbacks from appending listeners
            // to the current frame's queue
            queue.length = 0;
            for(var i = 0; i < cp.length; i++) {
              if(!cp[i].cancelled) {
                try{
                  cp[i].callback(last);
                } catch(e) {
                  setTimeout(function() { throw e }, 0);
                }
              }
            }
          }, Math.round(next));
        }
        queue.push({
          handle: ++id,
          callback: callback,
          cancelled: false
        });
        return id
      };

      caf = function(handle) {
        for(var i = 0; i < queue.length; i++) {
          if(queue[i].handle === handle) {
            queue[i].cancelled = true;
          }
        }
      };
    }

    var raf_1 = function(fn) {
      // Wrap in a new function to prevent
      // `cancel` potentially being assigned
      // to the native rAF function
      return raf.call(root, fn)
    };
    var cancel = function() {
      caf.apply(root, arguments);
    };
    var polyfill = function(object) {
      if (!object) {
        object = root;
      }
      object.requestAnimationFrame = raf;
      object.cancelAnimationFrame = caf;
    };
    raf_1.cancel = cancel;
    raf_1.polyfill = polyfill;

    var playheadDefaults = {
        play: true,
        delay: 50,
        tempo: 1,
        run: -1,
        reversed: false,
        script: [],
        lastTime: 0,
        nextDelay: 0,
        currentFrame: 0,
        currentSprite: 1,
        onPlay: null,
        onStop: null,
        onFrame: null,
        onOutOfView: null
    };
    var Spriteling = /** @class */ (function () {
        /**
         * Creates a new Spriteling instance. The options object can contain the following values
         * - url: url to spriteSheet, if not set the css background-image will be used
         * - cols: number columns in the spritesheet (mandatory)
         * - rows: number rows in the spritesheet (mandatory)
         * - cutOffFrames: number of sprites not used in the spritesheet (default: 0)
         * - top/bottom/left/right: starting offset position of placeholder element
         * - startSprite: number of the first sprite to show when done loading
         * - onLoaded: callback that will be called when loading has finished
         *
         * Element can be a css selector or existing DOM element or null, in which case a new div element will be created
         *
         * Debug adds logging in console, useful when working on the animation
         *
         * @param {object} options
         * @param {HTMLElement | string} element
         * @param {boolean} debug
         */
        function Spriteling(options, element, debug) {
            if (debug === void 0) { debug = false; }
            var _this = this;
            this.spriteSheet = {
                loaded: false,
                url: null,
                cols: null,
                rows: null,
                cutOffFrames: 0,
                top: null,
                bottom: null,
                left: null,
                right: null,
                startSprite: 1,
                downsizeRatio: 1,
                totalSprites: 0,
                sheetWidth: 0,
                sheetHeight: 0,
                frameWidth: 0,
                frameHeight: 0,
                animations: {},
                onLoaded: null
            };
            /**
             * The animation loop
             */
            this.loop = function (time) {
                // Should be called as soon as possible
                var requestFrameId = raf_1(_this.loop);
                var playhead = _this.playhead;
                // Wait until fully loaded
                if (!_this.element || !_this.spriteSheet.loaded) {
                    return;
                }
                // Cancel animation loop if play = false
                if (!playhead.play) {
                    raf_1.cancel(requestFrameId);
                    return;
                }
                // Throttle on nextDelay
                if ((time - playhead.lastTime) >= playhead.nextDelay) {
                    _this.render(time);
                }
            };
            // Lookup element by selector
            if (element) {
                this.element = typeof element === 'string' ? document.querySelector(element) : element;
            }
            // No element found, let's create one instead
            if (!this.element) {
                if (typeof this.element !== 'undefined') {
                    this.log('warn', "element \"" + element + "\" not found, created new element instead");
                }
                this.element = document.createElement('div');
                document.body.appendChild(this.element);
            }
            // Combine options with defaults
            this.spriteSheet = __assign({}, this.spriteSheet, options);
            this.playhead = __assign({}, playheadDefaults);
            this.debug = debug;
            // Initialize spritesheet
            if (!options.cols) {
                this.log('error', 'options.cols not set');
            }
            if (!options.rows) {
                this.log('error', 'options.rows not set');
            }
            if (!options.url) {
                // If no sprite is specified try to use background-image
                var elementStyle = window.getComputedStyle(this.element);
                var cssBackgroundImage = elementStyle.getPropertyValue('background-image');
                if (cssBackgroundImage === 'none') {
                    this.log('error', 'no spritesheet image found, please specify it with options.url or set as css background');
                }
                else {
                    this.spriteSheet.url = cssBackgroundImage.replace(/"/g, '').replace(/url\(|\)$/ig, '');
                }
            }
            // Create loading promise
            this.loadingPromise = this.loadSpriteSheet().then(function () {
                _this.spriteSheet.loaded = true;
                // If starting sprite is set, show it
                if (_this.spriteSheet.startSprite > 1 && _this.spriteSheet.startSprite <= _this.spriteSheet.totalSprites) {
                    _this.drawFrame({ sprite: _this.spriteSheet.startSprite });
                }
                // onLoaded callback
                if (typeof _this.spriteSheet.onLoaded === 'function') {
                    _this.spriteSheet.onLoaded();
                }
            });
        }
        /**
         * Stop the current animation and show the specified sprite
         * @param {number} spriteNumber
         */
        Spriteling.prototype.showSprite = function (spriteNumber) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.loadingPromise];
                        case 1:
                            _a.sent();
                            this.playhead.play = false;
                            this.drawFrame({ sprite: spriteNumber });
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Get the current spriteNumber that is shown
         * @returns {number}
         */
        Spriteling.prototype.currentSprite = function () {
            return this.playhead.currentSprite;
        };
        /**
         * Add a named animation sequence
         *
         * Name can be any string value
         *
         * Script should be an array of frame objects, each can have the following properties
         * - sprite: which sprite to show (mandatory)
         * - delay: alternate delay then the default delay
         * - top/left/bottom/right: reposition the placeholder element
         *
         * @param {string} name
         * @param {Frame[]} script
         */
        Spriteling.prototype.addScript = function (name, script) {
            this.spriteSheet.animations[name] = script;
        };
        /**
         * Resume/play current or given animation.
         * Method can be called in four ways:
         *
         * .play() - resume current animation sequence (if not set - loops over all sprites once)
         * .play(scriptName) - play given animation script
         * .play(scriptName, { options }) - play given animation script with given options
         * .play({ options }) - play current animation with given options
         *
         * ScriptName loads a previously added animation with .addScript()
         *
         * Options object can contain
         * - play: start playing the animation right away (default: true)
         * - run: the number of times the animation should run, -1 is infinite (default: 1)
         * - delay: default delay for all frames that don't have a delay set (default: 50)
         * - tempo: timescale for all delays, double-speed = 2, half-speed = .5 (default:1)
         * - reversed: direction of the animation head, true == backwards (default: false)
         * - script: New unnamed animation sequence, array of frames, see .addScript (default: null)
         * - onPlay/onStop/onFrame/onOutOfView: callbacks called at the appropriate times (default: null)
         *
         * @param {string | Animation} scriptName
         * @param {Animation} options
         * @returns {boolean}
         */
        Spriteling.prototype.play = function (scriptName, options) {
            return __awaiter(this, void 0, void 0, function () {
                var animationScript, animationOptions;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.loadingPromise
                            // play()
                        ];
                        case 1:
                            _a.sent();
                            // play()
                            if (!scriptName && !options) {
                                // Play if not already playing
                                if (!this.playhead.play) {
                                    if (this.playhead.run === 0) {
                                        this.playhead.run = 1;
                                    }
                                    this.playhead.play = true;
                                }
                            }
                            else {
                                animationScript = void 0;
                                animationOptions = {};
                                // play('someAnimation')
                                if (typeof scriptName === 'string' && !options) {
                                    if (this.spriteSheet.animations[scriptName]) {
                                        this.log('info', "playing animation \"" + scriptName + "\"");
                                        animationScript = this.spriteSheet.animations[scriptName];
                                    }
                                    else {
                                        this.log('error', "animation \"" + scriptName + "\" not found");
                                    }
                                    // play('someAnimation', { options })
                                }
                                else if (typeof scriptName === 'string' && typeof options === 'object') {
                                    animationScript = this.spriteSheet.animations[scriptName];
                                    animationOptions = options;
                                    // play({ options })
                                }
                                else if (typeof scriptName === 'object' && !options) {
                                    animationScript = this.playhead.script;
                                    animationOptions = scriptName;
                                }
                                if (!animationScript) {
                                    this.log('info', "playing animation \"all\"");
                                    animationScript = this.spriteSheet.animations.all;
                                }
                                this.playhead = __assign({}, playheadDefaults, { script: animationScript }, animationOptions);
                            }
                            // Enter the animation loop
                            if (this.playhead.run !== 0) {
                                this.loop();
                            }
                            // onPlay callback
                            if (typeof this.playhead.onPlay === 'function') {
                                this.playhead.onPlay();
                            }
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Get the current play state
         * @returns {boolean}
         */
        Spriteling.prototype.isPlaying = function () {
            return this.playhead.play;
        };
        /**
         * Set playback tempo, double-speed = 2, half-speed = .5 (default:1)
         * @param {number} tempo
         */
        Spriteling.prototype.setTempo = function (tempo) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.loadingPromise];
                        case 1:
                            _a.sent();
                            this.playhead.tempo = tempo;
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Get playback tempo, double-speed = 2, half-speed = .5 (default:1)
         * @returns {number}
         */
        Spriteling.prototype.getTempo = function () {
            return this.playhead.tempo;
        };
        /**
         * Step the animation ahead one frame
         * @returns {boolean}
         */
        Spriteling.prototype.next = function () {
            return __awaiter(this, void 0, void 0, function () {
                var frame;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.loadingPromise];
                        case 1:
                            _a.sent();
                            frame = this.playhead.script[this.playhead.currentFrame];
                            this.drawFrame(frame);
                            // Update frame counter
                            this.playhead.currentFrame += 1;
                            if (this.playhead.currentFrame > this.playhead.script.length - 1) {
                                this.playhead.currentFrame = 0;
                            }
                            if (this.playhead.currentFrame === this.playhead.script.length - 1) {
                                this.playhead.run -= 1;
                            }
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Step the animation backwards one frame
         * @returns {boolean}
         */
        Spriteling.prototype.previous = function () {
            return __awaiter(this, void 0, void 0, function () {
                var frame;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.loadingPromise];
                        case 1:
                            _a.sent();
                            frame = this.playhead.script[this.playhead.currentFrame];
                            this.drawFrame(frame);
                            // Update frame counter
                            this.playhead.currentFrame -= 1;
                            if (this.playhead.currentFrame < 0) {
                                this.playhead.currentFrame = (this.playhead.script.length - 1);
                            }
                            if (this.playhead.currentFrame === 0) {
                                this.playhead.run -= 1;
                            }
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Jump to certain frame within current animation sequence
         * @param frameNumber [integer]
         * @returns {boolean}
         */
        Spriteling.prototype.goTo = function (frameNumber) {
            return __awaiter(this, void 0, void 0, function () {
                var baseNumber, frame;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.loadingPromise
                            // Make sure given frame is within the animation
                        ];
                        case 1:
                            _a.sent();
                            baseNumber = Math.floor(frameNumber / this.playhead.script.length);
                            frameNumber = Math.floor(frameNumber - (baseNumber * this.playhead.script.length));
                            // Draw frame
                            this.playhead.currentFrame = frameNumber;
                            frame = this.playhead.script[this.playhead.currentFrame];
                            if (frame) {
                                this.log('info', "frame: " + this.playhead.currentFrame + ", sprite: " + frame.sprite);
                                this.drawFrame(frame);
                            }
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Reverse direction of play
         */
        Spriteling.prototype.reverse = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.loadingPromise];
                        case 1:
                            _a.sent();
                            this.playhead.reversed = !this.playhead.reversed;
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Get the current direction of play
         * @returns {boolean}
         */
        Spriteling.prototype.isReversed = function () {
            return this.playhead.reversed;
        };
        /**
         * Stop the animation
         */
        Spriteling.prototype.stop = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.loadingPromise];
                        case 1:
                            _a.sent();
                            this.playhead.play = false;
                            // onStop callback
                            if (typeof this.playhead.onStop === 'function') {
                                this.playhead.onStop();
                            }
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Reset playhead to first frame
         */
        Spriteling.prototype.reset = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.loadingPromise];
                        case 1:
                            _a.sent();
                            this.goTo(0);
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Removes the element and kills the animation loop
         */
        Spriteling.prototype.destroy = function () {
            this.playhead.play = false;
            this.element.parentNode.removeChild(this.element);
        };
        /**
         * Load the spritesheet and position it correctly
         */
        Spriteling.prototype.loadSpriteSheet = function () {
            var _this = this;
            return new Promise(function (resolve) {
                var preload = new Image();
                preload.src = _this.spriteSheet.url;
                imageLoaded(preload, function () {
                    var sheet = _this.spriteSheet;
                    var element = _this.element;
                    _this.log('info', "loaded: " + sheet.url + ", sprites " + sheet.cols + " x " + sheet.rows);
                    sheet.sheetWidth = preload.width;
                    sheet.sheetHeight = preload.height;
                    sheet.frameWidth = sheet.sheetWidth / sheet.cols / sheet.downsizeRatio;
                    sheet.frameHeight = sheet.sheetHeight / sheet.rows / sheet.downsizeRatio;
                    sheet.totalSprites = (sheet.cols * sheet.rows) - sheet.cutOffFrames;
                    if (sheet.frameWidth % 1 !== 0) {
                        _this.log('error', "frameWidth " + sheet.frameWidth + " is not a whole number");
                    }
                    if (sheet.frameHeight % 1 !== 0) {
                        _this.log('error', "frameHeight " + sheet.frameHeight + " is not a whole number");
                    }
                    element.style.position = 'absolute';
                    element.style.width = sheet.frameWidth + "px";
                    element.style.height = sheet.frameHeight + "px";
                    element.style.backgroundImage = "url(" + sheet.url + ")";
                    element.style.backgroundPosition = '0 0';
                    if (sheet.downsizeRatio > 1) {
                        element.style.backgroundSize = sheet.sheetWidth / sheet.downsizeRatio + "px " + sheet.sheetHeight / sheet.downsizeRatio + "px";
                    }
                    if (sheet.top !== null) {
                        if (sheet.top === 'center') {
                            element.style.top = '50%';
                            element.style.marginTop = sheet.frameHeight / 2 * -1 + "px";
                        }
                        else {
                            element.style.top = sheet.top + "px";
                        }
                    }
                    if (sheet.right !== null) {
                        element.style.right = sheet.right + "px";
                    }
                    if (sheet.bottom !== null) {
                        element.style.bottom = sheet.bottom + "px";
                    }
                    if (sheet.left !== null) {
                        if (sheet.left === 'center') {
                            element.style.left = sheet.left + "px";
                            element.style.marginLeft = sheet.frameWidth / 2 * -1 + "px";
                        }
                        else {
                            element.style.left = sheet.left + "px";
                        }
                    }
                    // Auto script the first 'all' animation sequence and make it default
                    _this.autoScript();
                    var animationOptions = { script: sheet.animations.all };
                    _this.playhead = __assign({}, playheadDefaults, animationOptions);
                    resolve();
                });
            });
        };
        /**
         * Generate a linear script based on the spritesheet itself
         */
        Spriteling.prototype.autoScript = function () {
            var script = [];
            for (var i = 0; i < this.spriteSheet.totalSprites; i++) {
                script[i] = { sprite: (i + 1) };
            }
            this.addScript('all', script);
        };
        Spriteling.prototype.render = function (time) {
            var element = this.element;
            var playhead = this.playhead;
            // Render next frame only if element is visible and within viewport
            if (element.offsetParent !== null && this.inViewport()) {
                // Only play if run counter is still <> 0
                if (playhead.run === 0) {
                    this.stop();
                }
                else {
                    if (playhead.reversed) {
                        this.previous();
                    }
                    else {
                        this.next();
                    }
                    var frame = playhead.script[playhead.currentFrame];
                    playhead.nextDelay = frame.delay ? frame.delay : playhead.delay;
                    playhead.nextDelay /= playhead.tempo;
                    playhead.lastTime = time;
                    this.log('info', "frame: " + playhead.currentFrame + ", sprite: " + frame.sprite + ", delay: " + playhead.nextDelay + ", run: " + playhead.run);
                }
            }
            else {
                if (typeof playhead.onOutOfView === 'function') {
                    playhead.onOutOfView();
                }
            }
        };
        /**
         * Draw a single frame
         */
        Spriteling.prototype.drawFrame = function (frame) {
            var sheet = this.spriteSheet;
            var playhead = this.playhead;
            var element = this.element;
            if (frame.sprite === playhead.currentSprite) {
                return false;
            }
            var rect = element.getBoundingClientRect();
            var row = Math.ceil(frame.sprite / sheet.cols);
            var col = frame.sprite - ((row - 1) * sheet.cols);
            var bgX = ((col - 1) * sheet.frameWidth) * -1;
            var bgY = ((row - 1) * sheet.frameHeight) * -1;
            if (row > sheet.rows || col > sheet.cols) {
                this.log('error', "position " + frame.sprite + " out of bound'");
            }
            // Set sprite
            playhead.currentSprite = frame.sprite;
            // Animate background
            element.style.backgroundPosition = bgX + "px " + bgY + "px";
            // Move if indicated
            if (frame.top) {
                element.style.top = rect.top + frame.top + "px";
            }
            if (frame.right) {
                element.style.right = rect.right + frame.right + "px";
            }
            if (frame.bottom) {
                element.style.bottom = rect.bottom + frame.bottom + "px";
            }
            if (frame.left) {
                element.style.left = rect.left + frame.left + "px";
            }
            // onFrame callback
            if (typeof playhead.onFrame === 'function') {
                playhead.onFrame(playhead.currentFrame);
            }
            return true;
        };
        /**
         * Test to see if an element is within the viewport
         * @returns {boolean}
         */
        Spriteling.prototype.inViewport = function () {
            var sheet = this.spriteSheet;
            var rect = this.element.getBoundingClientRect();
            return (rect.top + sheet.frameHeight >= 0 &&
                rect.left + sheet.frameWidth >= 0 &&
                rect.bottom - sheet.frameHeight <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right - sheet.frameWidth <= (window.innerWidth || document.documentElement.clientWidth));
        };
        /**
         * Log utility method
         * @param level
         * @param message
         * @private
         */
        Spriteling.prototype.log = function (level, message) {
            if (typeof console === 'undefined' || (level === 'info' && !this.debug)) {
                return;
            }
            console[level]("Spriteling: " + message);
        };
        return Spriteling;
    }());

    return Spriteling;

})));
