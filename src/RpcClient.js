import EventEmitter from "@adt/event-emitter";
import MessageTracker from "@adt/message-tracker";
import emptyFunction from "./emptyFunction";
import RpcError from "./RpcError";

var version = "#version#";

/**
 * @constructor
 * @param {Object} c Configuration
 * @param {JsonRpcTransportProvider} c.transportProvider
 * @param {Number} [c.messageCheckInterval=1000] c.messageCheckInterval Interval (in ms) of checking overdue requests with no response
 * @param {Number} [c.messageTimeout=5000] Message timeout in milliseconds
 * @param {Boolean} [c.reconnect=false] Reconnect flag
 * @param {Number} [c.reconnectAfter=5000] Reconnect timeout in milliseconds
 * @param {Function} [c.onMatchedMessage=(function({message:Object,emitter:EventEmitter}) => {}] Callback which must be invoked when message arrives and is matched by filter function. Function execution is bind to RpcClient instance. By default its empty function
 * @param {Function} [c.onUnmatchedMessage=({message:Object,emitter:EventEmitter}) => {}] Callback which must be invoked when message arrives and is not matched by filter function. Function execution is bind to RpcClient instance. By default its empty function
 * @param {Function} c.messageFilter Message filter/matcher function For full description please @see MessageTracker#register function description in @adt/message-tracker package
 * @fires connected
 * @fires connecting
 * @fires disconnected
 * @fires connectionerror
 * @fires message
 * @fires error
 */
function RpcClient(c) {

  if (typeof c === "undefined" || c === null) {
    throw new Error("Missing configuration object");
  }

  if ( typeof c.transportProvider === "undefined") {
    throw new Error("Required param 'transportProvider' is not defined");
  }

  if ( typeof c.messageFilter === "undefined" ) {
    throw new Error("Required param 'messageFilter' is not defined");
  }

  const that = this;
  let connected = false;
  const emitter = EventEmitter();

  const onMatchedMessage = (() => {
    if ( "onMatchedMessage" in c  ) {
      if ( typeof c.onMatchedMessage !== "function" ) {
        throw Error("onMatchedMessage callback is not a function");
      } else {
        return c.onMatchedMessage.bind(that);
      }
    } else {
      return emptyFunction;
    }
  })();

  const onUnmatchedMessage = (() => {
    if ( "onUnmatchedMessage" in c  ) {
      if ( typeof c.onUnmatchedMessage !== "function" ) {
        throw Error("onUnmatchedMessage callback is not a function");
      } else {
        return c.onUnmatchedMessage.bind(that);
      }
    } else {
      return emptyFunction;
    }
  })();


  const config = {
    messageCheckInterval : "messageCheckInterval" in c ? c.messageCheckInterval : 1000,
    messageTimeout : "messageTimeout" in c ? c.messageTimeout : 5000
  };
  const transportProvider = c.transportProvider;
  transportProvider.onMessage(onMessage.bind(that));
  const o = onDisconnect.bind(that);

  transportProvider.onDisconnect(o);

  const messageTracker = MessageTracker({
    timeout : config.messageTimeout,
    checkInterval : config.messageCheckInterval
  });

  const ret = Object.create(RpcClient.prototype, /** @lends RpcClient.prototype */ {

    version : { get : function(){
      return version;
    }},

    connected: {get: () => connected },

    /**
     * @type {WebSocket}
     * @default null
     */
    socket: {value: null, writable: true},

    connect: {value: connect},

    sendRequest: {value: sendRequest},

    sendEvent: { value : sendEvent},

    disconnect : { value : disconnect },

    on : { value : (evtName, cbf, context) => emitter.on(evtName, cbf, context)}

  });

  /**
   * Connects to remote endpoint by underlying transport channel
   * @name RpcClient#connect
   * @function
   * @this RpcClient
   * @return {Promise}
   */
  function connect() {

    return new Promise( (resolve, reject ) => {

      emitter.emit("connecting");
      transportProvider.connect().then( () => {

        emitter.emit("connected");

        resolve();

      }).catch( (e) => {

        reject(e);
      });

    });

  }

  /**
   * Send request to the remote side
   * If websocket is not connected then message will not be send and function returns rejected promise with RpcClient.ERRORS.INVALID_STATE_ERR
   * If request will be timeouted during waiting from response then returned promise will be rejected with RpcError.ERRORS.TIMEOUT_EXCEEDED with request attached in data property
   * @function
   * @name RpcClient#sendRequest
   * @this RpcClient
   * @param {RpcClient.RpcRequest} req
   * @param {Boolean} [enableCallbacks=false] If true, then callbacks assigned to message event will be executed before resolving/rejecting promise on response.
   * @return Promise
   */
  function sendRequest(req, enableCallbacks) {

    var retPromise,
      rejectWith = RpcClient.ERRORS.TIMEOUT_EXCEEDED;
    rejectWith.data = req;

    if ( transportProvider.isConnected() === true ) {

      retPromise = messageTracker.register({
        message: req,
        filter : c.messageFilter,
        timeoutRejectWith : rejectWith,
        params : {
          enableCallbacks: enableCallbacks
        },
        context : this
      });

      transportProvider.send(req);

    } else {

      retPromise = Promise.reject(RpcClient.ERRORS.INVALID_STATE_ERR);

    }

    return retPromise;

  }

  /**
   * Sends RPC event to the remote side.
   * On success method returns RpcClient.ERRORS.NO_ERROR
   * If websocket is not connected then message will not be send and function returns error RpcClient.ERRORS.INVALID_STATE_ERR
   * @function
   * @name RpcClient#sendEvent
   * @param {RpcClient.JsonRpcEvent}
   * @this RpcClient
   * @return RpcError
   */
  function sendEvent(evt) {

    if ( transportProvider.isConnected() === true ) {

      transportProvider.send(evt);

    } else {

      return RpcClient.ERRORS.INVALID_STATE_ERR;
    }

    return RpcClient.ERRORS.NO_ERROR;

  }

  /**
   * @this RpcClient
   * @param {Object} p Parameters object
   * @param {Object} message
   */
  function onMessage(message) {

    if ( !messageTracker.matchMessage(message) ) {

      onMatchedMessage({message, emitter});

    } else {

      onUnmatchedMessage({message, emitter});

    }

  }

  function onDisconnect(evt) {
    emitter.emit("disconnected",evt);
  }

  /**
   * Disconnects underlying transport channel.
   * @function
   * @name RpcClient#disconnect
   * @this RpcClient
   */
  function disconnect() {

    transportProvider.disconnect();
  }

  return ret;

}

RpcClient.ERRORS = Object.create(null,{

  NO_ERROR: { value : Object.create(RpcError.prototype, {
    code: { value: -32000, enumerable : true },
    message: { value : "No error", enumerable : true },
    data  : { value : undefined, enumerable : true, writable : true }
  }),
  enumerable : true },

  TIMEOUT_EXCEEDED: { value : Object.create(RpcError.prototype, {
    code: { value: -32001, enumerable : true },
    message: { value : "Waiting for response timeout exceeded", enumerable : true },
    data  : { value : undefined, enumerable : true, writable : true }
  }),
  enumerable : true },

  INVALID_STATE_ERR: { value : Object.create(RpcError.prototype, {
    code: { value: -32002, enumerable : true },
    message: { value : "WebSocket is already in CLOSING or CLOSED state", enumerable : true },
    data  : { value : undefined, enumerable : true, writable : true}
  }),
  enumerable : true }
});

export default RpcClient;