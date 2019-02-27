import RpcError from "./RpcError";
/**
 * Standard RPC errors
 * Can be used by user implementations to signalize errors
 * @type {Object}
 */

export const PARSE_ERROR =
  Object.freeze(Object.create(RpcError.prototype, {
    code: { value: -32700, enumerable : true },
    message: { value : "Parse error", enumerable : true }
  }));

export const INVALID_REQUEST =
  Object.freeze(Object.create(RpcError.prototype, {
    code: { value : -32600, enumerable : true},
    message: { value : "Invalid Request", enumerable : true }
  }));

export const METHOD_NOT_FOUND =
  Object.freeze(Object.create(RpcError.prototype, {
    code: { value : -32601, enumerable : true},
    message: { value : "Method not found", enumerable : true }
  }));

export const INVALID_PARAMS =
  Object.freeze(Object.create(RpcError.prototype, {
    code: { value : -32602, enumerable : true},
    message: { value: "Invalid params", enumerable : true}
  }));

export const INTERNAL_ERROR =
  Object.freeze(Object.create(RpcError.prototype, {
    code: { value : -32603, enumerable : true},
    message: { value : "Internal error", enumerable : true }
  }));

