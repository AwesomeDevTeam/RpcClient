/**
 * RPC Error object
 * @class
 * @param {Object} o Parameters object
 * @param {Number} o.code Error code
 * @param {String} [o.message=""] Error message
 * @param {?Object} [o.data=undefined] Additional data associated with error
 */
function RpcError(o) {

  if ( ( this instanceof RpcError ) === false ) {
    return new RpcError(o);
  }

  if ( typeof args === "undefined") {
    throw new Error("Required parameters object not present");
  }

  if ( typeof o.code !== "number" ) {
    throw "Error code must be integer";
  }

  this.code = o.code;
  this.message = "message" in o ? o.message : "";
  this.data = o.data;

  return Object.freeze(this);

}

RpcError.prototype = Object.create(null,/** @lends RpcError.prototype */ {
  code  : { value : 0, writable : true },
  message  : { value : "", writable : true },
  data  : { value : undefined, writable : true }
});


export default RpcError;