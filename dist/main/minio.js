"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  Client: true,
  CopyConditions: true,
  PostPolicy: true
};
exports.PostPolicy = exports.CopyConditions = exports.Client = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _http = _interopRequireDefault(require("http"));

var _https = _interopRequireDefault(require("https"));

var _stream = _interopRequireDefault(require("stream"));

var _blockStream = _interopRequireDefault(require("block-stream2"));

var _xml = _interopRequireDefault(require("xml"));

var _xml2js = _interopRequireDefault(require("xml2js"));

var _async = _interopRequireDefault(require("async"));

var _querystring = _interopRequireDefault(require("querystring"));

var _mkdirp = _interopRequireDefault(require("mkdirp"));

var _path = _interopRequireDefault(require("path"));

var _lodash = _interopRequireDefault(require("lodash"));

var _webEncoding = require("web-encoding");

var _helpers = require("./helpers.js");

var _signing = require("./signing.js");

var _objectUploader = _interopRequireDefault(require("./object-uploader"));

var transformers = _interopRequireWildcard(require("./transformers"));

var errors = _interopRequireWildcard(require("./errors.js"));

var _s3Endpoints = require("./s3-endpoints.js");

var _notification = require("./notification");

Object.keys(_notification).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _notification[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _notification[key];
    }
  });
});

var _extensions = _interopRequireDefault(require("./extensions"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

var Package = require('../../package.json');

var Client = /*#__PURE__*/function () {
  function Client(params) {
    _classCallCheck(this, Client);

    if (typeof params.secure !== 'undefined') throw new Error('"secure" option deprecated, "useSSL" should be used instead'); // Default values if not specified.

    if (typeof params.useSSL === 'undefined') params.useSSL = true;
    if (!params.port) params.port = 0; // Validate input params.

    if (!(0, _helpers.isValidEndpoint)(params.endPoint)) {
      throw new errors.InvalidEndpointError(`Invalid endPoint : ${params.endPoint}`);
    }

    if (!(0, _helpers.isValidPort)(params.port)) {
      throw new errors.InvalidArgumentError(`Invalid port : ${params.port}`);
    }

    if (!(0, _helpers.isBoolean)(params.useSSL)) {
      throw new errors.InvalidArgumentError(`Invalid useSSL flag type : ${params.useSSL}, expected to be of type "boolean"`);
    } // Validate region only if its set.


    if (params.region) {
      if (!(0, _helpers.isString)(params.region)) {
        throw new errors.InvalidArgumentError(`Invalid region : ${params.region}`);
      }
    }

    var host = params.endPoint.toLowerCase();
    var port = params.port;
    var protocol = '';
    var transport; // Validate if configuration is not using SSL
    // for constructing relevant endpoints.

    if (params.useSSL === false) {
      transport = _http.default;
      protocol = 'http:';

      if (port === 0) {
        port = 80;
      }
    } else {
      // Defaults to secure.
      transport = _https.default;
      protocol = 'https:';

      if (port === 0) {
        port = 443;
      }
    } // if custom transport is set, use it.


    if (params.transport) {
      if (!(0, _helpers.isObject)(params.transport)) {
        throw new errors.InvalidArgumentError('Invalid transport type : ${params.transport}, expected to be type "object"');
      }

      transport = params.transport;
    } // User Agent should always following the below style.
    // Please open an issue to discuss any new changes here.
    //
    //       MinIO (OS; ARCH) LIB/VER APP/VER
    //


    var libraryComments = `(${process.platform}; ${process.arch})`;
    var libraryAgent = `MinIO ${libraryComments} minio-js/${Package.version}`; // User agent block ends.

    var signingHost;

    if (params.signingHost) {
      signingHost = params.signingHost;
    }

    this.transport = transport;
    this.host = host;
    this.port = port;
    this.protocol = protocol;
    this.accessKey = params.accessKey;
    this.secretKey = params.secretKey;
    this.sessionToken = params.sessionToken;
    this.userAgent = `${libraryAgent}`;
    this.signingHost = signingHost; // Default path style is true

    if (params.pathStyle === undefined) {
      this.pathStyle = true;
    } else {
      this.pathStyle = params.pathStyle;
    }

    if (!this.accessKey) this.accessKey = '';
    if (!this.secretKey) this.secretKey = '';
    this.anonymous = !this.accessKey || !this.secretKey;
    this.regionMap = {};

    if (params.region) {
      this.region = params.region;
    }

    this.partSize = 64 * 1024 * 1024;

    if (params.partSize) {
      this.partSize = params.partSize;
      this.overRidePartSize = true;
    }

    if (this.partSize < 5 * 1024 * 1024) {
      throw new errors.InvalidArgumentError(`Part size should be greater than 5MB`);
    }

    if (this.partSize > 5 * 1024 * 1024 * 1024) {
      throw new errors.InvalidArgumentError(`Part size should be less than 5GB`);
    }

    this.maximumPartSize = 5 * 1024 * 1024 * 1024;
    this.maxObjectSize = 5 * 1024 * 1024 * 1024 * 1024; // SHA256 is enabled only for authenticated http requests. If the request is authenticated
    // and the connection is https we use x-amz-content-sha256=UNSIGNED-PAYLOAD
    // header for signature calculation.

    this.enableSHA256 = !this.anonymous && !params.useSSL;
    this.s3AccelerateEndpoint = params.s3AccelerateEndpoint || null;
    this.reqOptions = {};
  } // This is s3 Specific and does not hold validity in any other Object storage.


  _createClass(Client, [{
    key: "getAccelerateEndPointIfSet",
    value: function getAccelerateEndPointIfSet(bucketName, objectName) {
      if (!_lodash.default.isEmpty(this.s3AccelerateEndpoint) && !_lodash.default.isEmpty(bucketName) && !_lodash.default.isEmpty(objectName)) {
        // http://docs.aws.amazon.com/AmazonS3/latest/dev/transfer-acceleration.html
        // Disable transfer acceleration for non-compliant bucket names.
        if (bucketName.indexOf(".") !== -1) {
          throw new Error(`Transfer Acceleration is not supported for non compliant bucket:${bucketName}`);
        } // If transfer acceleration is requested set new host.
        // For more details about enabling transfer acceleration read here.
        // http://docs.aws.amazon.com/AmazonS3/latest/dev/transfer-acceleration.html


        return this.s3AccelerateEndpoint;
      }

      return false;
    }
    /**
     * @param endPoint _string_ valid S3 acceleration end point
     */

  }, {
    key: "setS3TransferAccelerate",
    value: function setS3TransferAccelerate(endPoint) {
      this.s3AccelerateEndpoint = endPoint;
    } // Sets the supported request options.

  }, {
    key: "setRequestOptions",
    value: function setRequestOptions(options) {
      if (!(0, _helpers.isObject)(options)) {
        throw new TypeError('request options should be of type "object"');
      }

      this.reqOptions = _lodash.default.pick(options, ['agent', 'ca', 'cert', 'ciphers', 'clientCertEngine', 'crl', 'dhparam', 'ecdhCurve', 'family', 'honorCipherOrder', 'key', 'passphrase', 'pfx', 'rejectUnauthorized', 'secureOptions', 'secureProtocol', 'servername', 'sessionIdContext']);
    } // returns *options* object that can be used with http.request()
    // Takes care of constructing virtual-host-style or path-style hostname

  }, {
    key: "getRequestOptions",
    value: function getRequestOptions(opts) {
      var method = opts.method;
      var region = opts.region;
      var bucketName = opts.bucketName;
      var objectName = opts.objectName;
      var headers = opts.headers;
      var query = opts.query;
      var reqOptions = {
        method
      };
      reqOptions.headers = {}; // Verify if virtual host supported.

      var virtualHostStyle;

      if (bucketName) {
        virtualHostStyle = (0, _helpers.isVirtualHostStyle)(this.host, this.protocol, bucketName, this.pathStyle);
      }

      if (this.signingHost) {
        virtualHostStyle = true;
      }

      if (this.port) reqOptions.port = this.port;
      reqOptions.protocol = this.protocol;

      if (objectName) {
        objectName = `${(0, _helpers.uriResourceEscape)(objectName)}`;
      }

      reqOptions.path = '/'; // Save host.

      reqOptions.host = this.host; // For Amazon S3 endpoint, get endpoint based on region.

      if ((0, _helpers.isAmazonEndpoint)(reqOptions.host)) {
        var accelerateEndPoint = this.getAccelerateEndPointIfSet(bucketName, objectName);

        if (accelerateEndPoint) {
          reqOptions.host = `${accelerateEndPoint}`;
        } else {
          reqOptions.host = (0, _s3Endpoints.getS3Endpoint)(region);
        }
      }

      if (virtualHostStyle && !opts.pathStyle) {
        // For all hosts which support virtual host style, `bucketName`
        // is part of the hostname in the following format:
        //
        //  var host = 'bucketName.example.com'
        //
        if (bucketName) reqOptions.host = `${bucketName}.${reqOptions.host}`;
        if (objectName) reqOptions.path = `/${objectName}`;
      } else {
        // For all S3 compatible storage services we will fallback to
        // path style requests, where `bucketName` is part of the URI
        // path.
        if (bucketName) reqOptions.path = `/${bucketName}`;
        if (objectName) reqOptions.path = `/${bucketName}/${objectName}`;
      }

      if (query) reqOptions.path += `?${query}`;
      reqOptions.headers.host = reqOptions.host;

      if (reqOptions.protocol === 'http:' && reqOptions.port !== 80 || reqOptions.protocol === 'https:' && reqOptions.port !== 443) {
        reqOptions.headers.host = `${reqOptions.host}:${reqOptions.port}`;
      }

      reqOptions.headers['user-agent'] = this.userAgent;

      if (headers) {
        // have all header keys in lower case - to make signing easy
        _lodash.default.map(headers, function (v, k) {
          return reqOptions.headers[k.toLowerCase()] = v;
        });
      } // Use any request option specified in minioClient.setRequestOptions()


      reqOptions = Object.assign({}, this.reqOptions, reqOptions);
      return reqOptions;
    } // Set application specific information.
    //
    // Generates User-Agent in the following style.
    //
    //       MinIO (OS; ARCH) LIB/VER APP/VER
    //
    // __Arguments__
    // * `appName` _string_ - Application name.
    // * `appVersion` _string_ - Application version.

  }, {
    key: "setAppInfo",
    value: function setAppInfo(appName, appVersion) {
      if (!(0, _helpers.isString)(appName)) {
        throw new TypeError(`Invalid appName: ${appName}`);
      }

      if (appName.trim() === '') {
        throw new errors.InvalidArgumentError('Input appName cannot be empty.');
      }

      if (!(0, _helpers.isString)(appVersion)) {
        throw new TypeError(`Invalid appVersion: ${appVersion}`);
      }

      if (appVersion.trim() === '') {
        throw new errors.InvalidArgumentError('Input appVersion cannot be empty.');
      }

      this.userAgent = `${this.userAgent} ${appName}/${appVersion}`;
    } // Calculate part size given the object size. Part size will be atleast this.partSize

  }, {
    key: "calculatePartSize",
    value: function calculatePartSize(size) {
      if (!(0, _helpers.isNumber)(size)) {
        throw new TypeError('size should be of type "number"');
      }

      if (size > this.maxObjectSize) {
        throw new TypeError(`size should not be more than ${this.maxObjectSize}`);
      }

      if (this.overRidePartSize) {
        return this.partSize;
      }

      var partSize = this.partSize;

      for (;;) {
        // while(true) {...} throws linting error.
        // If partSize is big enough to accomodate the object size, then use it.
        if (partSize * 10000 > size) {
          return partSize;
        } // Try part sizes as 64MB, 80MB, 96MB etc.


        partSize += 16 * 1024 * 1024;
      }
    } // log the request, response, error

  }, {
    key: "logHTTP",
    value: function logHTTP(reqOptions, response, err) {
      var _this = this;

      // if no logstreamer available return.
      if (!this.logStream) return;

      if (!(0, _helpers.isObject)(reqOptions)) {
        throw new TypeError('reqOptions should be of type "object"');
      }

      if (response && !(0, _helpers.isReadableStream)(response)) {
        throw new TypeError('response should be of type "Stream"');
      }

      if (err && !(err instanceof Error)) {
        throw new TypeError('err should be of type "Error"');
      }

      var logHeaders = function logHeaders(headers) {
        _lodash.default.forEach(headers, function (v, k) {
          if (k == 'authorization') {
            var redacter = new RegExp('Signature=([0-9a-f]+)');
            v = v.replace(redacter, 'Signature=**REDACTED**');
          }

          _this.logStream.write(`${k}: ${v}\n`);
        });

        _this.logStream.write('\n');
      };

      this.logStream.write(`REQUEST: ${reqOptions.method} ${reqOptions.path}\n`);
      logHeaders(reqOptions.headers);

      if (response) {
        this.logStream.write(`RESPONSE: ${response.statusCode}\n`);
        logHeaders(response.headers);
      }

      if (err) {
        this.logStream.write('ERROR BODY:\n');
        var errJSON = JSON.stringify(err, null, '\t');
        this.logStream.write(`${errJSON}\n`);
      }
    } // Enable tracing

  }, {
    key: "traceOn",
    value: function traceOn(stream) {
      if (!stream) stream = process.stdout;
      this.logStream = stream;
    } // Disable tracing

  }, {
    key: "traceOff",
    value: function traceOff() {
      this.logStream = null;
    } // makeRequest is the primitive used by the apis for making S3 requests.
    // payload can be empty string in case of no payload.
    // statusCode is the expected statusCode. If response.statusCode does not match
    // we parse the XML error and call the callback with the error message.
    // A valid region is passed by the calls - listBuckets, makeBucket and
    // getBucketRegion.

  }, {
    key: "makeRequest",
    value: function makeRequest(options, payload, statusCodes, region, returnResponse, cb) {
      if (!(0, _helpers.isObject)(options)) {
        throw new TypeError('options should be of type "object"');
      }

      if (!(0, _helpers.isString)(payload) && !(0, _helpers.isObject)(payload)) {
        // Buffer is of type 'object'
        throw new TypeError('payload should be of type "string" or "Buffer"');
      }

      statusCodes.forEach(function (statusCode) {
        if (!(0, _helpers.isNumber)(statusCode)) {
          throw new TypeError('statusCode should be of type "number"');
        }
      });

      if (!(0, _helpers.isString)(region)) {
        throw new TypeError('region should be of type "string"');
      }

      if (!(0, _helpers.isBoolean)(returnResponse)) {
        throw new TypeError('returnResponse should be of type "boolean"');
      }

      if (!(0, _helpers.isFunction)(cb)) {
        throw new TypeError('callback should be of type "function"');
      }

      if (!options.headers) options.headers = {};

      if (options.method === 'POST' || options.method === 'PUT' || options.method === 'DELETE') {
        options.headers['content-length'] = payload.length;
      }

      var sha256sum = '';
      if (this.enableSHA256) sha256sum = (0, _helpers.toSha256)(payload);
      var stream = (0, _helpers.readableStream)(payload);
      this.makeRequestStream(options, stream, sha256sum, statusCodes, region, returnResponse, cb);
    } // makeRequestStream will be used directly instead of makeRequest in case the payload
    // is available as a stream. for ex. putObject

  }, {
    key: "makeRequestStream",
    value: function makeRequestStream(options, stream, sha256sum, statusCodes, region, returnResponse, cb) {
      var _this2 = this;

      if (!(0, _helpers.isObject)(options)) {
        throw new TypeError('options should be of type "object"');
      }

      if (!(0, _helpers.isReadableStream)(stream)) {
        throw new errors.InvalidArgumentError('stream should be a readable Stream');
      }

      if (!(0, _helpers.isString)(sha256sum)) {
        throw new TypeError('sha256sum should be of type "string"');
      }

      statusCodes.forEach(function (statusCode) {
        if (!(0, _helpers.isNumber)(statusCode)) {
          throw new TypeError('statusCode should be of type "number"');
        }
      });

      if (!(0, _helpers.isString)(region)) {
        throw new TypeError('region should be of type "string"');
      }

      if (!(0, _helpers.isBoolean)(returnResponse)) {
        throw new TypeError('returnResponse should be of type "boolean"');
      }

      if (!(0, _helpers.isFunction)(cb)) {
        throw new TypeError('callback should be of type "function"');
      } // sha256sum will be empty for anonymous or https requests


      if (!this.enableSHA256 && sha256sum.length !== 0) {
        throw new errors.InvalidArgumentError(`sha256sum expected to be empty for anonymous or https requests`);
      } // sha256sum should be valid for non-anonymous http requests.


      if (this.enableSHA256 && sha256sum.length !== 64) {
        throw new errors.InvalidArgumentError(`Invalid sha256sum : ${sha256sum}`);
      }

      var _makeRequest = function _makeRequest(e, region) {
        if (e) return cb(e);
        options.region = region;

        var reqOptions = _this2.getRequestOptions(options);

        if (!_this2.anonymous) {
          // For non-anonymous https requests sha256sum is 'UNSIGNED-PAYLOAD' for signature calculation.
          if (!_this2.enableSHA256) sha256sum = 'UNSIGNED-PAYLOAD';
          var date = new Date();
          reqOptions.headers['x-amz-date'] = (0, _helpers.makeDateLong)(date);
          reqOptions.headers['x-amz-content-sha256'] = sha256sum;

          if (_this2.sessionToken) {
            reqOptions.headers['x-amz-security-token'] = _this2.sessionToken;
          }

          var authorization = (0, _signing.signV4)(reqOptions, _this2.accessKey, _this2.secretKey, region, date, _this2.signingHost);
          reqOptions.headers.authorization = authorization;
        }

        var req = _this2.transport.request(reqOptions, function (response) {
          if (!statusCodes.includes(response.statusCode)) {
            // For an incorrect region, S3 server always sends back 400.
            // But we will do cache invalidation for all errors so that,
            // in future, if AWS S3 decides to send a different status code or
            // XML error code we will still work fine.
            delete _this2.regionMap[options.bucketName];
            var errorTransformer = transformers.getErrorTransformer(response);
            (0, _helpers.pipesetup)(response, errorTransformer).on('error', function (e) {
              _this2.logHTTP(reqOptions, response, e);

              cb(e);
            });
            return;
          }

          _this2.logHTTP(reqOptions, response);

          if (returnResponse) return cb(null, response); // We drain the socket so that the connection gets closed. Note that this
          // is not expensive as the socket will not have any data.

          response.on('data', function () {});
          cb(null);
        });

        var pipe = (0, _helpers.pipesetup)(stream, req);
        pipe.on('error', function (e) {
          _this2.logHTTP(reqOptions, null, e);

          cb(e);
        });
      };

      if (region) return _makeRequest(null, region);
      this.getBucketRegion(options.bucketName, _makeRequest);
    } // gets the region of the bucket

  }, {
    key: "getBucketRegion",
    value: function getBucketRegion(bucketName, cb) {
      var _this3 = this;

      if (!(0, _helpers.isValidBucketName)(bucketName)) {
        throw new errors.InvalidBucketNameError(`Invalid bucket name : ${bucketName}`);
      }

      if (!(0, _helpers.isFunction)(cb)) {
        throw new TypeError('cb should be of type "function"');
      } // Region is set with constructor, return the region right here.


      if (this.region) return cb(null, this.region);
      if (this.regionMap[bucketName]) return cb(null, this.regionMap[bucketName]);

      var extractRegion = function extractRegion(response) {
        var transformer = transformers.getBucketRegionTransformer();
        var region = 'us-east-1';
        (0, _helpers.pipesetup)(response, transformer).on('error', cb).on('data', function (data) {
          if (data) region = data;
        }).on('end', function () {
          _this3.regionMap[bucketName] = region;
          cb(null, region);
        });
      };

      var method = 'GET';
      var query = 'location'; // `getBucketLocation` behaves differently in following ways for
      // different environments.
      //
      // - For nodejs env we default to path style requests.
      // - For browser env path style requests on buckets yields CORS
      //   error. To circumvent this problem we make a virtual host
      //   style request signed with 'us-east-1'. This request fails
      //   with an error 'AuthorizationHeaderMalformed', additionally
      //   the error XML also provides Region of the bucket. To validate
      //   this region is proper we retry the same request with the newly
      //   obtained region.

      var pathStyle = this.pathStyle && typeof window === 'undefined';
      this.makeRequest({
        method,
        bucketName,
        query,
        pathStyle
      }, '', [200], 'us-east-1', true, function (e, response) {
        if (e) {
          if (e.name === 'AuthorizationHeaderMalformed') {
            var region = e.Region;
            if (!region) return cb(e);

            _this3.makeRequest({
              method,
              bucketName,
              query
            }, '', [200], region, true, function (e, response) {
              if (e) return cb(e);
              extractRegion(response);
            });

            return;
          }

          return cb(e);
        }

        extractRegion(response);
      });
    } // Creates the bucket `bucketName`.
    //
    // __Arguments__
    // * `bucketName` _string_ - Name of the bucket
    // * `region` _string_ - region valid values are _us-west-1_, _us-west-2_,  _eu-west-1_, _eu-central-1_, _ap-southeast-1_, _ap-northeast-1_, _ap-southeast-2_, _sa-east-1_.
    // * `makeOpts` _object_ - Options to create a bucket. e.g {ObjectLocking:true} (Optional)
    // * `callback(err)` _function_ - callback function with `err` as the error argument. `err` is null if the bucket is successfully created.

  }, {
    key: "makeBucket",
    value: function makeBucket(bucketName, region) {
      var makeOpts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var cb = arguments.length > 3 ? arguments[3] : undefined;

      if (!(0, _helpers.isValidBucketName)(bucketName)) {
        throw new errors.InvalidBucketNameError('Invalid bucket name: ' + bucketName);
      } // Backward Compatibility


      if ((0, _helpers.isObject)(region)) {
        cb = makeOpts;
        makeOpts = region;
        region = '';
      }

      if ((0, _helpers.isFunction)(region)) {
        cb = region;
        region = '';
        makeOpts = {};
      }

      if ((0, _helpers.isFunction)(makeOpts)) {
        cb = makeOpts;
        makeOpts = {};
      }

      if (!(0, _helpers.isString)(region)) {
        throw new TypeError('region should be of type "string"');
      }

      if (!(0, _helpers.isObject)(makeOpts)) {
        throw new TypeError('makeOpts should be of type "object"');
      }

      if (!(0, _helpers.isFunction)(cb)) {
        throw new TypeError('callback should be of type "function"');
      }

      var payload = ''; // Region already set in constructor, validate if
      // caller requested bucket location is same.

      if (region && this.region) {
        if (region !== this.region) {
          throw new errors.InvalidArgumentError(`Configured region ${this.region}, requested ${region}`);
        }
      } // sending makeBucket request with XML containing 'us-east-1' fails. For
      // default region server expects the request without body


      if (region && region !== 'us-east-1') {
        var createBucketConfiguration = [];
        createBucketConfiguration.push({
          _attr: {
            xmlns: 'http://s3.amazonaws.com/doc/2006-03-01/'
          }
        });
        createBucketConfiguration.push({
          LocationConstraint: region
        });
        var payloadObject = {
          CreateBucketConfiguration: createBucketConfiguration
        };
        payload = (0, _xml.default)(payloadObject);
      }

      var method = 'PUT';
      var headers = {};

      if (makeOpts.ObjectLocking) {
        headers["x-amz-bucket-object-lock-enabled"] = true;
      }

      if (!region) region = 'us-east-1';
      this.makeRequest({
        method,
        bucketName,
        headers
      }, payload, [200], region, false, cb);
    } // List of buckets created.
    //
    // __Arguments__
    // * `callback(err, buckets)` _function_ - callback function with error as the first argument. `buckets` is an array of bucket information
    //
    // `buckets` array element:
    // * `bucket.name` _string_ : bucket name
    // * `bucket.creationDate` _Date_: date when bucket was created

  }, {
    key: "listBuckets",
    value: function listBuckets(cb) {
      if (!(0, _helpers.isFunction)(cb)) {
        throw new TypeError('callback should be of type "function"');
      }

      var method = 'GET';
      this.makeRequest({
        method
      }, '', [200], 'us-east-1', true, function (e, response) {
        if (e) return cb(e);
        var transformer = transformers.getListBucketTransformer();
        var buckets;
        (0, _helpers.pipesetup)(response, transformer).on('data', function (result) {
          return buckets = result;
        }).on('error', function (e) {
          return cb(e);
        }).on('end', function () {
          return cb(null, buckets);
        });
      });
    } // Returns a stream that emits objects that are partially uploaded.
    //
    // __Arguments__
    // * `bucketname` _string_: name of the bucket
    // * `prefix` _string_: prefix of the object names that are partially uploaded (optional, default `''`)
    // * `recursive` _bool_: directory style listing when false, recursive listing when true (optional, default `false`)
    //
    // __Return Value__
    // * `stream` _Stream_ : emits objects of the format:
    //   * `object.key` _string_: name of the object
    //   * `object.uploadId` _string_: upload ID of the object
    //   * `object.size` _Integer_: size of the partially uploaded object

  }, {
    key: "listIncompleteUploads",
    value: function listIncompleteUploads(bucket, prefix, recursive) {
      var _this4 = this;

      if (prefix === undefined) prefix = '';
      if (recursive === undefined) recursive = false;

      if (!(0, _helpers.isValidBucketName)(bucket)) {
        throw new errors.InvalidBucketNameError('Invalid bucket name: ' + bucket);
      }

      if (!(0, _helpers.isValidPrefix)(prefix)) {
        throw new errors.InvalidPrefixError(`Invalid prefix : ${prefix}`);
      }

      if (!(0, _helpers.isBoolean)(recursive)) {
        throw new TypeError('recursive should be of type "boolean"');
      }

      var delimiter = recursive ? '' : '/';
      var keyMarker = '';
      var uploadIdMarker = '';
      var uploads = [];
      var ended = false;

      var readStream = _stream.default.Readable({
        objectMode: true
      });

      readStream._read = function () {
        // push one upload info per _read()
        if (uploads.length) {
          return readStream.push(uploads.shift());
        }

        if (ended) return readStream.push(null);

        _this4.listIncompleteUploadsQuery(bucket, prefix, keyMarker, uploadIdMarker, delimiter).on('error', function (e) {
          return readStream.emit('error', e);
        }).on('data', function (result) {
          result.prefixes.forEach(function (prefix) {
            return uploads.push(prefix);
          });

          _async.default.eachSeries(result.uploads, function (upload, cb) {
            // for each incomplete upload add the sizes of its uploaded parts
            _this4.listParts(bucket, upload.key, upload.uploadId, function (err, parts) {
              if (err) return cb(err);
              upload.size = parts.reduce(function (acc, item) {
                return acc + item.size;
              }, 0);
              uploads.push(upload);
              cb();
            });
          }, function (err) {
            if (err) {
              readStream.emit('error', err);
              return;
            }

            if (result.isTruncated) {
              keyMarker = result.nextKeyMarker;
              uploadIdMarker = result.nextUploadIdMarker;
            } else {
              ended = true;
            }

            readStream._read();
          });
        });
      };

      return readStream;
    } // To check if a bucket already exists.
    //
    // __Arguments__
    // * `bucketName` _string_ : name of the bucket
    // * `callback(err)` _function_ : `err` is `null` if the bucket exists

  }, {
    key: "bucketExists",
    value: function bucketExists(bucketName, cb) {
      if (!(0, _helpers.isValidBucketName)(bucketName)) {
        throw new errors.InvalidBucketNameError('Invalid bucket name: ' + bucketName);
      }

      if (!(0, _helpers.isFunction)(cb)) {
        throw new TypeError('callback should be of type "function"');
      }

      var method = 'HEAD';
      this.makeRequest({
        method,
        bucketName
      }, '', [200], '', false, function (err) {
        if (err) {
          if (err.code == 'NoSuchBucket' || err.code == 'NotFound') return cb(null, false);
          return cb(err);
        }

        cb(null, true);
      });
    } // Remove a bucket.
    //
    // __Arguments__
    // * `bucketName` _string_ : name of the bucket
    // * `callback(err)` _function_ : `err` is `null` if the bucket is removed successfully.

  }, {
    key: "removeBucket",
    value: function removeBucket(bucketName, cb) {
      var _this5 = this;

      if (!(0, _helpers.isValidBucketName)(bucketName)) {
        throw new errors.InvalidBucketNameError('Invalid bucket name: ' + bucketName);
      }

      if (!(0, _helpers.isFunction)(cb)) {
        throw new TypeError('callback should be of type "function"');
      }

      var method = 'DELETE';
      this.makeRequest({
        method,
        bucketName
      }, '', [204], '', false, function (e) {
        // If the bucket was successfully removed, remove the region map entry.
        if (!e) delete _this5.regionMap[bucketName];
        cb(e);
      });
    } // Remove the partially uploaded object.
    //
    // __Arguments__
    // * `bucketName` _string_: name of the bucket
    // * `objectName` _string_: name of the object
    // * `callback(err)` _function_: callback function is called with non `null` value in case of error

  }, {
    key: "removeIncompleteUpload",
    value: function removeIncompleteUpload(bucketName, objectName, cb) {
      var _this6 = this;

      if (!(0, _helpers.isValidBucketName)(bucketName)) {
        throw new errors.isValidBucketNameError('Invalid bucket name: ' + bucketName);
      }

      if (!(0, _helpers.isValidObjectName)(objectName)) {
        throw new errors.InvalidObjectNameError(`Invalid object name: ${objectName}`);
      }

      if (!(0, _helpers.isFunction)(cb)) {
        throw new TypeError('callback should be of type "function"');
      }

      var removeUploadId;

      _async.default.during(function (cb) {
        _this6.findUploadId(bucketName, objectName, function (e, uploadId) {
          if (e) return cb(e);
          removeUploadId = uploadId;
          cb(null, uploadId);
        });
      }, function (cb) {
        var method = 'DELETE';
        var query = `uploadId=${removeUploadId}`;

        _this6.makeRequest({
          method,
          bucketName,
          objectName,
          query
        }, '', [204], '', false, function (e) {
          return cb(e);
        });
      }, cb);
    } // Callback is called with `error` in case of error or `null` in case of success
    //
    // __Arguments__
    // * `bucketName` _string_: name of the bucket
    // * `objectName` _string_: name of the object
    // * `filePath` _string_: path to which the object data will be written to
    // * `getOpts` _object_: Version of the object in the form `{versionId:'my-uuid'}`. Default is `{}`. (optional)
    // * `callback(err)` _function_: callback is called with `err` in case of error.

  }, {
    key: "fGetObject",
    value: function fGetObject(bucketName, objectName, filePath) {
      var _this7 = this;

      var getOpts = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
      var cb = arguments.length > 4 ? arguments[4] : undefined;

      // Input validation.
      if (!(0, _helpers.isValidBucketName)(bucketName)) {
        throw new errors.InvalidBucketNameError('Invalid bucket name: ' + bucketName);
      }

      if (!(0, _helpers.isValidObjectName)(objectName)) {
        throw new errors.InvalidObjectNameError(`Invalid object name: ${objectName}`);
      }

      if (!(0, _helpers.isString)(filePath)) {
        throw new TypeError('filePath should be of type "string"');
      } // Backward Compatibility


      if ((0, _helpers.isFunction)(getOpts)) {
        cb = getOpts;
        getOpts = {};
      }

      if (!(0, _helpers.isFunction)(cb)) {
        throw new TypeError('callback should be of type "function"');
      } // Internal data.


      var partFile;
      var partFileStream;
      var objStat; // Rename wrapper.

      var rename = function rename(err) {
        if (err) return cb(err);

        _fs.default.rename(partFile, filePath, cb);
      };

      _async.default.waterfall([function (cb) {
        return _this7.statObject(bucketName, objectName, getOpts, cb);
      }, function (result, cb) {
        objStat = result; // Create any missing top level directories.

        (0, _mkdirp.default)(_path.default.dirname(filePath), cb);
      }, function (ignore, cb) {
        partFile = `${filePath}.${objStat.etag}.part.minio`;

        _fs.default.stat(partFile, function (e, stats) {
          var offset = 0;

          if (e) {
            partFileStream = _fs.default.createWriteStream(partFile, {
              flags: 'w'
            });
          } else {
            if (objStat.size === stats.size) return rename();
            offset = stats.size;
            partFileStream = _fs.default.createWriteStream(partFile, {
              flags: 'a'
            });
          }

          _this7.getPartialObject(bucketName, objectName, offset, 0, getOpts, cb);
        });
      }, function (downloadStream, cb) {
        (0, _helpers.pipesetup)(downloadStream, partFileStream).on('error', function (e) {
          return cb(e);
        }).on('finish', cb);
      }, function (cb) {
        return _fs.default.stat(partFile, cb);
      }, function (stats, cb) {
        if (stats.size === objStat.size) return cb();
        cb(new Error('Size mismatch between downloaded file and the object'));
      }], rename);
    } // Callback is called with readable stream of the object content.
    //
    // __Arguments__
    // * `bucketName` _string_: name of the bucket
    // * `objectName` _string_: name of the object
    // * `getOpts` _object_: Version of the object in the form `{versionId:'my-uuid'}`. Default is `{}`. (optional)
    // * `callback(err, stream)` _function_: callback is called with `err` in case of error. `stream` is the object content stream

  }, {
    key: "getObject",
    value: function getObject(bucketName, objectName) {
      var getOpts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var cb = arguments.length > 3 ? arguments[3] : undefined;

      if (!(0, _helpers.isValidBucketName)(bucketName)) {
        throw new errors.InvalidBucketNameError('Invalid bucket name: ' + bucketName);
      }

      if (!(0, _helpers.isValidObjectName)(objectName)) {
        throw new errors.InvalidObjectNameError(`Invalid object name: ${objectName}`);
      } // Backward Compatibility


      if ((0, _helpers.isFunction)(getOpts)) {
        cb = getOpts;
        getOpts = {};
      }

      if (!(0, _helpers.isFunction)(cb)) {
        throw new TypeError('callback should be of type "function"');
      }

      this.getPartialObject(bucketName, objectName, 0, 0, getOpts, cb);
    } // Callback is called with readable stream of the partial object content.
    //
    // __Arguments__
    // * `bucketName` _string_: name of the bucket
    // * `objectName` _string_: name of the object
    // * `offset` _number_: offset of the object from where the stream will start
    // * `length` _number_: length of the object that will be read in the stream (optional, if not specified we read the rest of the file from the offset)
    // * `getOpts` _object_: Version of the object in the form `{versionId:'my-uuid'}`. Default is `{}`. (optional)
    // * `callback(err, stream)` _function_: callback is called with `err` in case of error. `stream` is the object content stream

  }, {
    key: "getPartialObject",
    value: function getPartialObject(bucketName, objectName, offset, length) {
      var getOpts = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
      var cb = arguments.length > 5 ? arguments[5] : undefined;

      if ((0, _helpers.isFunction)(length)) {
        cb = length;
        length = 0;
      }

      if (!(0, _helpers.isValidBucketName)(bucketName)) {
        throw new errors.InvalidBucketNameError('Invalid bucket name: ' + bucketName);
      }

      if (!(0, _helpers.isValidObjectName)(objectName)) {
        throw new errors.InvalidObjectNameError(`Invalid object name: ${objectName}`);
      }

      if (!(0, _helpers.isNumber)(offset)) {
        throw new TypeError('offset should be of type "number"');
      }

      if (!(0, _helpers.isNumber)(length)) {
        throw new TypeError('length should be of type "number"');
      } // Backward Compatibility


      if ((0, _helpers.isFunction)(getOpts)) {
        cb = getOpts;
        getOpts = {};
      }

      if (!(0, _helpers.isFunction)(cb)) {
        throw new TypeError('callback should be of type "function"');
      }

      var range = '';

      if (offset || length) {
        if (offset) {
          range = `bytes=${+offset}-`;
        } else {
          range = 'bytes=0-';
          offset = 0;
        }

        if (length) {
          range += `${+length + offset - 1}`;
        }
      }

      var headers = {};

      if (range !== '') {
        headers.range = range;
      }

      var expectedStatusCodes = [200];

      if (range) {
        expectedStatusCodes.push(206);
      }

      var method = 'GET';

      var query = _querystring.default.stringify(getOpts);

      this.makeRequest({
        method,
        bucketName,
        objectName,
        headers,
        query
      }, '', expectedStatusCodes, '', true, cb);
    } // Uploads the object using contents from a file
    //
    // __Arguments__
    // * `bucketName` _string_: name of the bucket
    // * `objectName` _string_: name of the object
    // * `filePath` _string_: file path of the file to be uploaded
    // * `metaData` _Javascript Object_: metaData assosciated with the object
    // * `callback(err, objInfo)` _function_: non null `err` indicates error, `objInfo` _object_ which contains versionId and etag.

  }, {
    key: "fPutObject",
    value: function fPutObject(bucketName, objectName, filePath, metaData, callback) {
      var _this8 = this;

      if (!(0, _helpers.isValidBucketName)(bucketName)) {
        throw new errors.InvalidBucketNameError('Invalid bucket name: ' + bucketName);
      }

      if (!(0, _helpers.isValidObjectName)(objectName)) {
        throw new errors.InvalidObjectNameError(`Invalid object name: ${objectName}`);
      }

      if (!(0, _helpers.isString)(filePath)) {
        throw new TypeError('filePath should be of type "string"');
      }

      if ((0, _helpers.isFunction)(metaData)) {
        callback = metaData;
        metaData = {}; // Set metaData empty if no metaData provided.
      }

      if (!(0, _helpers.isObject)(metaData)) {
        throw new TypeError('metaData should be of type "object"');
      } // Inserts correct `content-type` attribute based on metaData and filePath


      metaData = (0, _helpers.insertContentType)(metaData, filePath); // Updates metaData to have the correct prefix if needed

      metaData = (0, _helpers.prependXAMZMeta)(metaData);
      var size;
      var partSize;

      _async.default.waterfall([function (cb) {
        return _fs.default.stat(filePath, cb);
      }, function (stats, cb) {
        size = stats.size;

        if (size > _this8.maxObjectSize) {
          return cb(new Error(`${filePath} size : ${stats.size}, max allowed size : 5TB`));
        }

        if (size <= _this8.partSize) {
          // simple PUT request, no multipart
          var multipart = false;

          var uploader = _this8.getUploader(bucketName, objectName, metaData, multipart);

          var hash = transformers.getHashSummer(_this8.enableSHA256);
          var start = 0;
          var end = size - 1;
          var autoClose = true;
          if (size === 0) end = 0;
          var options = {
            start,
            end,
            autoClose
          };
          (0, _helpers.pipesetup)(_fs.default.createReadStream(filePath, options), hash).on('data', function (data) {
            var md5sum = data.md5sum;
            var sha256sum = data.sha256sum;

            var stream = _fs.default.createReadStream(filePath, options);

            uploader(stream, size, sha256sum, md5sum, function (err, objInfo) {
              callback(err, objInfo);
              cb(true);
            });
          }).on('error', function (e) {
            return cb(e);
          });
          return;
        }

        _this8.findUploadId(bucketName, objectName, cb);
      }, function (uploadId, cb) {
        // if there was a previous incomplete upload, fetch all its uploaded parts info
        if (uploadId) return _this8.listParts(bucketName, objectName, uploadId, function (e, etags) {
          return cb(e, uploadId, etags);
        }); // there was no previous upload, initiate a new one

        _this8.initiateNewMultipartUpload(bucketName, objectName, metaData, function (e, uploadId) {
          return cb(e, uploadId, []);
        });
      }, function (uploadId, etags, cb) {
        partSize = _this8.calculatePartSize(size);
        var multipart = true;

        var uploader = _this8.getUploader(bucketName, objectName, metaData, multipart); // convert array to object to make things easy


        var parts = etags.reduce(function (acc, item) {
          if (!acc[item.part]) {
            acc[item.part] = item;
          }

          return acc;
        }, {});
        var partsDone = [];
        var partNumber = 1;
        var uploadedSize = 0;

        _async.default.whilst(function (cb) {
          cb(null, uploadedSize < size);
        }, function (cb) {
          var part = parts[partNumber];
          var hash = transformers.getHashSummer(_this8.enableSHA256);
          var length = partSize;

          if (length > size - uploadedSize) {
            length = size - uploadedSize;
          }

          var start = uploadedSize;
          var end = uploadedSize + length - 1;
          var autoClose = true;
          var options = {
            autoClose,
            start,
            end
          }; // verify md5sum of each part

          (0, _helpers.pipesetup)(_fs.default.createReadStream(filePath, options), hash).on('data', function (data) {
            var md5sumHex = Buffer.from(data.md5sum, 'base64').toString('hex');

            if (part && md5sumHex === part.etag) {
              // md5 matches, chunk already uploaded
              partsDone.push({
                part: partNumber,
                etag: part.etag
              });
              partNumber++;
              uploadedSize += length;
              return cb();
            } // part is not uploaded yet, or md5 mismatch


            var stream = _fs.default.createReadStream(filePath, options);

            uploader(uploadId, partNumber, stream, length, data.sha256sum, data.md5sum, function (e, objInfo) {
              if (e) return cb(e);
              partsDone.push({
                part: partNumber,
                etag: objInfo.etag
              });
              partNumber++;
              uploadedSize += length;
              return cb();
            });
          }).on('error', function (e) {
            return cb(e);
          });
        }, function (e) {
          if (e) return cb(e);
          cb(null, partsDone, uploadId);
        });
      }, // all parts uploaded, complete the multipart upload
      function (etags, uploadId, cb) {
        return _this8.completeMultipartUpload(bucketName, objectName, uploadId, etags, cb);
      }], function (err) {
        if (err === true) return;

        for (var _len = arguments.length, rest = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          rest[_key - 1] = arguments[_key];
        }

        callback.apply(void 0, [err].concat(rest));
      });
    } // Uploads the object.
    //
    // Uploading a stream
    // __Arguments__
    // * `bucketName` _string_: name of the bucket
    // * `objectName` _string_: name of the object
    // * `stream` _Stream_: Readable stream
    // * `size` _number_: size of the object (optional)
    // * `callback(err, etag)` _function_: non null `err` indicates error, `etag` _string_ is the etag of the object uploaded.
    //
    // Uploading "Buffer" or "string"
    // __Arguments__
    // * `bucketName` _string_: name of the bucket
    // * `objectName` _string_: name of the object
    // * `string or Buffer` _string_ or _Buffer_: string or buffer
    // * `callback(err, objInfo)` _function_: `err` is `null` in case of success and `info` will have the following object details:
    //   * `etag` _string_: etag of the object
    //   * `versionId` _string_: versionId of the object

  }, {
    key: "putObject",
    value: function putObject(bucketName, objectName, stream, size, metaData, callback) {
      if (!(0, _helpers.isValidBucketName)(bucketName)) {
        throw new errors.InvalidBucketNameError('Invalid bucket name: ' + bucketName);
      }

      if (!(0, _helpers.isValidObjectName)(objectName)) {
        throw new errors.InvalidObjectNameError(`Invalid object name: ${objectName}`);
      } // We'll need to shift arguments to the left because of size and metaData.


      if ((0, _helpers.isFunction)(size)) {
        callback = size;
        metaData = {};
      } else if ((0, _helpers.isFunction)(metaData)) {
        callback = metaData;
        metaData = {};
      } // We'll need to shift arguments to the left because of metaData
      // and size being optional.


      if ((0, _helpers.isObject)(size)) {
        metaData = size;
      } // Ensures Metadata has appropriate prefix for A3 API


      metaData = (0, _helpers.prependXAMZMeta)(metaData);

      if (typeof stream === 'string' || stream instanceof Buffer) {
        // Adapts the non-stream interface into a stream.
        size = stream.length;
        stream = (0, _helpers.readableStream)(stream);
      } else if (!(0, _helpers.isReadableStream)(stream)) {
        throw new TypeError('third argument should be of type "stream.Readable" or "Buffer" or "string"');
      }

      if (!(0, _helpers.isFunction)(callback)) {
        throw new TypeError('callback should be of type "function"');
      }

      if ((0, _helpers.isNumber)(size) && size < 0) {
        throw new errors.InvalidArgumentError(`size cannot be negative, given size: ${size}`);
      } // Get the part size and forward that to the BlockStream. Default to the
      // largest block size possible if necessary.


      if (!(0, _helpers.isNumber)(size)) size = this.maxObjectSize;
      size = this.calculatePartSize(size); // s3 requires that all non-end chunks be at least `this.partSize`,
      // so we chunk the stream until we hit either that size or the end before
      // we flush it to s3.

      var chunker = new _blockStream.default({
        size,
        zeroPadding: false
      }); // This is a Writable stream that can be written to in order to upload
      // to the specified bucket and object automatically.

      var uploader = new _objectUploader.default(this, bucketName, objectName, size, metaData, callback); // stream => chunker => uploader

      stream.pipe(chunker).pipe(uploader);
    } // Copy the object.
    //
    // __Arguments__
    // * `bucketName` _string_: name of the bucket
    // * `objectName` _string_: name of the object
    // * `srcObject` _string_: path of the source object to be copied
    // * `conditions` _CopyConditions_: copy conditions that needs to be satisfied (optional, default `null`)
    // * `callback(err, {etag, lastModified})` _function_: non null `err` indicates error, `etag` _string_ and `listModifed` _Date_ are respectively the etag and the last modified date of the newly copied object

  }, {
    key: "copyObjectV1",
    value: function copyObjectV1(arg1, arg2, arg3, arg4, arg5) {
      var bucketName = arg1;
      var objectName = arg2;
      var srcObject = arg3;
      var conditions, cb;

      if (typeof arg4 == 'function' && arg5 === undefined) {
        conditions = null;
        cb = arg4;
      } else {
        conditions = arg4;
        cb = arg5;
      }

      if (!(0, _helpers.isValidBucketName)(bucketName)) {
        throw new errors.InvalidBucketNameError('Invalid bucket name: ' + bucketName);
      }

      if (!(0, _helpers.isValidObjectName)(objectName)) {
        throw new errors.InvalidObjectNameError(`Invalid object name: ${objectName}`);
      }

      if (!(0, _helpers.isString)(srcObject)) {
        throw new TypeError('srcObject should be of type "string"');
      }

      if (srcObject === "") {
        throw new errors.InvalidPrefixError(`Empty source prefix`);
      }

      if (conditions !== null && !(conditions instanceof CopyConditions)) {
        throw new TypeError('conditions should be of type "CopyConditions"');
      }

      var headers = {};
      headers['x-amz-copy-source'] = (0, _helpers.uriResourceEscape)(srcObject);

      if (conditions !== null) {
        if (conditions.modified !== "") {
          headers['x-amz-copy-source-if-modified-since'] = conditions.modified;
        }

        if (conditions.unmodified !== "") {
          headers['x-amz-copy-source-if-unmodified-since'] = conditions.unmodified;
        }

        if (conditions.matchETag !== "") {
          headers['x-amz-copy-source-if-match'] = conditions.matchETag;
        }

        if (conditions.matchEtagExcept !== "") {
          headers['x-amz-copy-source-if-none-match'] = conditions.matchETagExcept;
        }
      }

      var method = 'PUT';
      this.makeRequest({
        method,
        bucketName,
        objectName,
        headers
      }, '', [200], '', true, function (e, response) {
        if (e) return cb(e);
        var transformer = transformers.getCopyObjectTransformer();
        (0, _helpers.pipesetup)(response, transformer).on('error', function (e) {
          return cb(e);
        }).on('data', function (data) {
          return cb(null, data);
        });
      });
    }
    /**
       * Internal Method to perform copy of an object.
       * @param sourceConfig __object__   instance of CopySourceOptions @link ./helpers/CopySourceOptions
       * @param destConfig  __object__   instance of CopyDestinationOptions @link ./helpers/CopyDestinationOptions
       * @param cb __function__ called with null if there is an error
       * @returns Promise if no callack is passed.
       */

  }, {
    key: "copyObjectV2",
    value: function copyObjectV2(sourceConfig, destConfig, cb) {
      if (!(sourceConfig instanceof _helpers.CopySourceOptions)) {
        throw new errors.InvalidArgumentError('sourceConfig should of type CopySourceOptions ');
      }

      if (!(destConfig instanceof _helpers.CopyDestinationOptions)) {
        throw new errors.InvalidArgumentError('destConfig should of type CopyDestinationOptions ');
      }

      if (!destConfig.validate()) {
        return false;
      }

      if (!destConfig.validate()) {
        return false;
      }

      if (!(0, _helpers.isFunction)(cb)) {
        throw new TypeError('callback should be of type "function"');
      }

      var headers = Object.assign({}, sourceConfig.getHeaders(), destConfig.getHeaders());
      var bucketName = destConfig.Bucket;
      var objectName = destConfig.Object;
      var method = 'PUT';
      this.makeRequest({
        method,
        bucketName,
        objectName,
        headers
      }, '', [200], '', true, function (e, response) {
        if (e) return cb(e);
        var transformer = transformers.getCopyObjectTransformer();
        (0, _helpers.pipesetup)(response, transformer).on('error', function (e) {
          return cb(e);
        }).on('data', function (data) {
          var resHeaders = response.headers;
          var copyObjResponse = {
            Bucket: destConfig.Bucket,
            Key: destConfig.Object,
            LastModified: data.LastModified,
            MetaData: (0, _helpers.extractMetadata)(resHeaders),
            VersionId: (0, _helpers.getVersionId)(resHeaders),
            SourceVersionId: (0, _helpers.getSourceVersionId)(resHeaders),
            Etag: (0, _helpers.sanitizeETag)(resHeaders.etag),
            Size: +resHeaders['content-length']
          };
          return cb(null, copyObjResponse);
        });
      });
    } // Backward compatibility for Copy Object API.

  }, {
    key: "copyObject",
    value: function copyObject() {
      for (var _len2 = arguments.length, allArgs = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        allArgs[_key2] = arguments[_key2];
      }

      if (allArgs[0] instanceof _helpers.CopySourceOptions && allArgs[1] instanceof _helpers.CopyDestinationOptions) {
        return this.copyObjectV2.apply(this, arguments);
      }

      return this.copyObjectV1.apply(this, arguments);
    } // list a batch of objects

  }, {
    key: "listObjectsQuery",
    value: function listObjectsQuery(bucketName, prefix, marker) {
      var listQueryOpts = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

      if (!(0, _helpers.isValidBucketName)(bucketName)) {
        throw new errors.InvalidBucketNameError('Invalid bucket name: ' + bucketName);
      }

      if (!(0, _helpers.isString)(prefix)) {
        throw new TypeError('prefix should be of type "string"');
      }

      if (!(0, _helpers.isString)(marker)) {
        throw new TypeError('marker should be of type "string"');
      }

      var Delimiter = listQueryOpts.Delimiter,
          MaxKeys = listQueryOpts.MaxKeys,
          IncludeVersion = listQueryOpts.IncludeVersion;

      if (!(0, _helpers.isObject)(listQueryOpts)) {
        throw new TypeError('listQueryOpts should be of type "object"');
      }

      if (!(0, _helpers.isString)(Delimiter)) {
        throw new TypeError('Delimiter should be of type "string"');
      }

      if (!(0, _helpers.isNumber)(MaxKeys)) {
        throw new TypeError('MaxKeys should be of type "number"');
      }

      var queries = []; // escape every value in query string, except maxKeys

      queries.push(`prefix=${(0, _helpers.uriEscape)(prefix)}`);
      queries.push(`delimiter=${(0, _helpers.uriEscape)(Delimiter)}`);
      queries.push(`encoding-type=url`);

      if (IncludeVersion) {
        queries.push(`versions`);
      }

      if (marker) {
        marker = (0, _helpers.uriEscape)(marker);

        if (IncludeVersion) {
          queries.push(`key-marker=${marker}`);
        } else {
          queries.push(`marker=${marker}`);
        }
      } // no need to escape maxKeys


      if (MaxKeys) {
        if (MaxKeys >= 1000) {
          MaxKeys = 1000;
        }

        queries.push(`max-keys=${MaxKeys}`);
      }

      queries.sort();
      var query = '';

      if (queries.length > 0) {
        query = `${queries.join('&')}`;
      }

      var method = 'GET';
      var transformer = transformers.getListObjectsTransformer();
      this.makeRequest({
        method,
        bucketName,
        query
      }, '', [200], '', true, function (e, response) {
        if (e) return transformer.emit('error', e);
        (0, _helpers.pipesetup)(response, transformer);
      });
      return transformer;
    } // List the objects in the bucket.
    //
    // __Arguments__
    // * `bucketName` _string_: name of the bucket
    // * `prefix` _string_: the prefix of the objects that should be listed (optional, default `''`)
    // * `recursive` _bool_: `true` indicates recursive style listing and `false` indicates directory style listing delimited by '/'. (optional, default `false`)
    // * `listOpts _object_: query params to list object with below keys
    // *    listOpts.MaxKeys _int_ maximum number of keys to return
    // *    listOpts.IncludeVersion  _bool_ true|false to include versions.
    // __Return Value__
    // * `stream` _Stream_: stream emitting the objects in the bucket, the object is of the format:
    // * `obj.name` _string_: name of the object
    // * `obj.prefix` _string_: name of the object prefix
    // * `obj.size` _number_: size of the object
    // * `obj.etag` _string_: etag of the object
    // * `obj.lastModified` _Date_: modified time stamp
    // * `obj.isDeleteMarker` _boolean_: true if it is a delete marker
    // * `obj.versionId` _string_: versionId of the object

  }, {
    key: "listObjects",
    value: function listObjects(bucketName, prefix, recursive) {
      var _this9 = this;

      var listOpts = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
      if (prefix === undefined) prefix = '';
      if (recursive === undefined) recursive = false;

      if (!(0, _helpers.isValidBucketName)(bucketName)) {
        throw new errors.InvalidBucketNameError('Invalid bucket name: ' + bucketName);
      }

      if (!(0, _helpers.isValidPrefix)(prefix)) {
        throw new errors.InvalidPrefixError(`Invalid prefix : ${prefix}`);
      }

      if (!(0, _helpers.isString)(prefix)) {
        throw new TypeError('prefix should be of type "string"');
      }

      if (!(0, _helpers.isBoolean)(recursive)) {
        throw new TypeError('recursive should be of type "boolean"');
      }

      if (!(0, _helpers.isObject)(listOpts)) {
        throw new TypeError('listOpts should be of type "object"');
      }

      var marker = '';
      var listQueryOpts = {
        Delimiter: recursive ? '' : '/',
        // if recursive is false set delimiter to '/'
        MaxKeys: 1000,
        IncludeVersion: listOpts.IncludeVersion
      };
      var objects = [];
      var ended = false;

      var readStream = _stream.default.Readable({
        objectMode: true
      });

      readStream._read = function () {
        // push one object per _read()
        if (objects.length) {
          readStream.push(objects.shift());
          return;
        }

        if (ended) return readStream.push(null); // if there are no objects to push do query for the next batch of objects

        _this9.listObjectsQuery(bucketName, prefix, marker, listQueryOpts).on('error', function (e) {
          return readStream.emit('error', e);
        }).on('data', function (result) {
          if (result.isTruncated) {
            marker = result.nextMarker || result.versionIdMarker;
          } else {
            ended = true;
          }

          objects = result.objects;

          readStream._read();
        });
      };

      return readStream;
    } // listObjectsV2Query - (List Objects V2) - List some or all (up to 1000) of the objects in a bucket.
    //
    // You can use the request parameters as selection criteria to return a subset of the objects in a bucket.
    // request parameters :-
    // * `bucketName` _string_: name of the bucket
    // * `prefix` _string_: Limits the response to keys that begin with the specified prefix.
    // * `continuation-token` _string_: Used to continue iterating over a set of objects.
    // * `delimiter` _string_: A delimiter is a character you use to group keys.
    // * `max-keys` _number_: Sets the maximum number of keys returned in the response body.
    // * `start-after` _string_: Specifies the key to start after when listing objects in a bucket.

  }, {
    key: "listObjectsV2Query",
    value: function listObjectsV2Query(bucketName, prefix, continuationToken, delimiter, maxKeys, startAfter) {
      if (!(0, _helpers.isValidBucketName)(bucketName)) {
        throw new errors.InvalidBucketNameError('Invalid bucket name: ' + bucketName);
      }

      if (!(0, _helpers.isString)(prefix)) {
        throw new TypeError('prefix should be of type "string"');
      }

      if (!(0, _helpers.isString)(continuationToken)) {
        throw new TypeError('continuationToken should be of type "string"');
      }

      if (!(0, _helpers.isString)(delimiter)) {
        throw new TypeError('delimiter should be of type "string"');
      }

      if (!(0, _helpers.isNumber)(maxKeys)) {
        throw new TypeError('maxKeys should be of type "number"');
      }

      if (!(0, _helpers.isString)(startAfter)) {
        throw new TypeError('startAfter should be of type "string"');
      }

      var queries = []; // Call for listing objects v2 API

      queries.push(`list-type=2`);
      queries.push(`encoding-type=url`); // escape every value in query string, except maxKeys

      queries.push(`prefix=${(0, _helpers.uriEscape)(prefix)}`);
      queries.push(`delimiter=${(0, _helpers.uriEscape)(delimiter)}`);

      if (continuationToken) {
        continuationToken = (0, _helpers.uriEscape)(continuationToken);
        queries.push(`continuation-token=${continuationToken}`);
      } // Set start-after


      if (startAfter) {
        startAfter = (0, _helpers.uriEscape)(startAfter);
        queries.push(`start-after=${startAfter}`);
      } // no need to escape maxKeys


      if (maxKeys) {
        if (maxKeys >= 1000) {
          maxKeys = 1000;
        }

        queries.push(`max-keys=${maxKeys}`);
      }

      queries.sort();
      var query = '';

      if (queries.length > 0) {
        query = `${queries.join('&')}`;
      }

      var method = 'GET';
      var transformer = transformers.getListObjectsV2Transformer();
      this.makeRequest({
        method,
        bucketName,
        query
      }, '', [200], '', true, function (e, response) {
        if (e) return transformer.emit('error', e);
        (0, _helpers.pipesetup)(response, transformer);
      });
      return transformer;
    } // List the objects in the bucket using S3 ListObjects V2
    //
    // __Arguments__
    // * `bucketName` _string_: name of the bucket
    // * `prefix` _string_: the prefix of the objects that should be listed (optional, default `''`)
    // * `recursive` _bool_: `true` indicates recursive style listing and `false` indicates directory style listing delimited by '/'. (optional, default `false`)
    // * `startAfter` _string_: Specifies the key to start after when listing objects in a bucket. (optional, default `''`)
    //
    // __Return Value__
    // * `stream` _Stream_: stream emitting the objects in the bucket, the object is of the format:
    //   * `obj.name` _string_: name of the object
    //   * `obj.prefix` _string_: name of the object prefix
    //   * `obj.size` _number_: size of the object
    //   * `obj.etag` _string_: etag of the object
    //   * `obj.lastModified` _Date_: modified time stamp

  }, {
    key: "listObjectsV2",
    value: function listObjectsV2(bucketName, prefix, recursive, startAfter) {
      var _this10 = this;

      if (prefix === undefined) prefix = '';
      if (recursive === undefined) recursive = false;
      if (startAfter === undefined) startAfter = '';

      if (!(0, _helpers.isValidBucketName)(bucketName)) {
        throw new errors.InvalidBucketNameError('Invalid bucket name: ' + bucketName);
      }

      if (!(0, _helpers.isValidPrefix)(prefix)) {
        throw new errors.InvalidPrefixError(`Invalid prefix : ${prefix}`);
      }

      if (!(0, _helpers.isString)(prefix)) {
        throw new TypeError('prefix should be of type "string"');
      }

      if (!(0, _helpers.isBoolean)(recursive)) {
        throw new TypeError('recursive should be of type "boolean"');
      }

      if (!(0, _helpers.isString)(startAfter)) {
        throw new TypeError('startAfter should be of type "string"');
      } // if recursive is false set delimiter to '/'


      var delimiter = recursive ? '' : '/';
      var continuationToken = '';
      var objects = [];
      var ended = false;

      var readStream = _stream.default.Readable({
        objectMode: true
      });

      readStream._read = function () {
        // push one object per _read()
        if (objects.length) {
          readStream.push(objects.shift());
          return;
        }

        if (ended) return readStream.push(null); // if there are no objects to push do query for the next batch of objects

        _this10.listObjectsV2Query(bucketName, prefix, continuationToken, delimiter, 1000, startAfter).on('error', function (e) {
          return readStream.emit('error', e);
        }).on('data', function (result) {
          if (result.isTruncated) {
            continuationToken = result.nextContinuationToken;
          } else {
            ended = true;
          }

          objects = result.objects;

          readStream._read();
        });
      };

      return readStream;
    } // Stat information of the object.
    //
    // __Arguments__
    // * `bucketName` _string_: name of the bucket
    // * `objectName` _string_: name of the object
    // * `statOpts`  _object_ : Version of the object in the form `{versionId:'my-uuid'}`. Default is `{}`. (optional).
    // * `callback(err, stat)` _function_: `err` is not `null` in case of error, `stat` contains the object information:
    //   * `stat.size` _number_: size of the object
    //   * `stat.etag` _string_: etag of the object
    //   * `stat.metaData` _string_: MetaData of the object
    //   * `stat.lastModified` _Date_: modified time stamp
    //   * `stat.versionId` _string_: version id of the object if available

  }, {
    key: "statObject",
    value: function statObject(bucketName, objectName) {
      var statOpts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var cb = arguments.length > 3 ? arguments[3] : undefined;

      if (!(0, _helpers.isValidBucketName)(bucketName)) {
        throw new errors.InvalidBucketNameError('Invalid bucket name: ' + bucketName);
      }

      if (!(0, _helpers.isValidObjectName)(objectName)) {
        throw new errors.InvalidObjectNameError(`Invalid object name: ${objectName}`);
      } // backward compatibility


      if ((0, _helpers.isFunction)(statOpts)) {
        cb = statOpts;
        statOpts = {};
      }

      if (!(0, _helpers.isObject)(statOpts)) {
        throw new errors.InvalidArgumentError('statOpts should be of type "object"');
      }

      if (!(0, _helpers.isFunction)(cb)) {
        throw new TypeError('callback should be of type "function"');
      }

      var query = _querystring.default.stringify(statOpts);

      var method = 'HEAD';
      this.makeRequest({
        method,
        bucketName,
        objectName,
        query
      }, '', [200], '', true, function (e, response) {
        if (e) return cb(e); // We drain the socket so that the connection gets closed. Note that this
        // is not expensive as the socket will not have any data.

        response.on('data', function () {});
        var result = {
          size: +response.headers['content-length'],
          metaData: (0, _helpers.extractMetadata)(response.headers),
          lastModified: new Date(response.headers['last-modified']),
          versionId: (0, _helpers.getVersionId)(response.headers),
          etag: (0, _helpers.sanitizeETag)(response.headers.etag)
        };
        cb(null, result);
      });
    } // Remove the specified object.
    //
    // __Arguments__
    // * `bucketName` _string_: name of the bucket
    // * `objectName` _string_: name of the object
    // * `removeOpts` _object_: Version of the object in the form `{versionId:'my-uuid', governanceBypass:true|false}`. Default is `{}`. (optional)
    // * `callback(err)` _function_: callback function is called with non `null` value in case of error

  }, {
    key: "removeObject",
    value: function removeObject(bucketName, objectName) {
      var removeOpts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var cb = arguments.length > 3 ? arguments[3] : undefined;

      if (!(0, _helpers.isValidBucketName)(bucketName)) {
        throw new errors.InvalidBucketNameError('Invalid bucket name: ' + bucketName);
      }

      if (!(0, _helpers.isValidObjectName)(objectName)) {
        throw new errors.InvalidObjectNameError(`Invalid object name: ${objectName}`);
      } // backward compatibility


      if ((0, _helpers.isFunction)(removeOpts)) {
        cb = removeOpts;
        removeOpts = {};
      }

      if (!(0, _helpers.isObject)(removeOpts)) {
        throw new errors.InvalidArgumentError('removeOpts should be of type "object"');
      }

      if (!(0, _helpers.isFunction)(cb)) {
        throw new TypeError('callback should be of type "function"');
      }

      var method = 'DELETE';
      var queryParams = {};

      if (removeOpts.versionId) {
        queryParams.versionId = `${removeOpts.versionId}`;
      }

      var headers = {};

      if (removeOpts.governanceBypass) {
        headers["X-Amz-Bypass-Governance-Retention"] = true;
      }

      var query = _querystring.default.stringify(queryParams);

      var requestOptions = {
        method,
        bucketName,
        objectName,
        headers
      };

      if (query) {
        requestOptions['query'] = query;
      }

      this.makeRequest(requestOptions, '', [200, 204], '', false, cb);
    } // Remove all the objects residing in the objectsList.
    //
    // __Arguments__
    // * `bucketName` _string_: name of the bucket
    // * `objectsList` _array_: array of objects of one of the following:
    // *         List of Object names as array of strings which are object keys:  ['objectname1','objectname2']
    // *         List of Object name and versionId as an object:  [{name:"objectname",versionId:"my-version-id"}]

  }, {
    key: "removeObjects",
    value: function removeObjects(bucketName, objectsList, cb) {
      var _this11 = this;

      if (!(0, _helpers.isValidBucketName)(bucketName)) {
        throw new errors.InvalidBucketNameError('Invalid bucket name: ' + bucketName);
      }

      if (!(0, _helpers.isArray)(objectsList)) {
        throw new errors.InvalidArgumentError('objectsList should be a list');
      }

      if (!(0, _helpers.isFunction)(cb)) {
        throw new TypeError('callback should be of type "function"');
      }

      var maxEntries = 1000;
      var query = 'delete';
      var method = 'POST';
      var result = objectsList.reduce(function (result, entry) {
        result.list.push(entry);

        if (result.list.length === maxEntries) {
          result.listOfList.push(result.list);
          result.list = [];
        }

        return result;
      }, {
        listOfList: [],
        list: []
      });

      if (result.list.length > 0) {
        result.listOfList.push(result.list);
      }

      var encoder = new _webEncoding.TextEncoder();

      _async.default.eachSeries(result.listOfList, function (list, callback) {
        var objects = [];
        list.forEach(function (value) {
          if ((0, _helpers.isObject)(value)) {
            objects.push({
              "Key": value.name,
              "VersionId": value.versionId
            });
          } else {
            objects.push({
              "Key": value
            });
          }
        });
        var deleteObjects = {
          "Delete": {
            "Quiet": true,
            "Object": objects
          }
        };
        var builder = new _xml2js.default.Builder({
          headless: true
        });
        var payload = builder.buildObject(deleteObjects);
        payload = encoder.encode(payload);
        var headers = {};
        headers['Content-MD5'] = (0, _helpers.toMd5)(payload);

        _this11.makeRequest({
          method,
          bucketName,
          query,
          headers
        }, payload, [200], '', false, function (e) {
          if (e) return callback(e);
          callback(null);
        });
      }, cb);
    } // Get the policy on a bucket or an object prefix.
    //
    // __Arguments__
    // * `bucketName` _string_: name of the bucket
    // * `callback(err, policy)` _function_: callback function

  }, {
    key: "getBucketPolicy",
    value: function getBucketPolicy(bucketName, cb) {
      // Validate arguments.
      if (!(0, _helpers.isValidBucketName)(bucketName)) {
        throw new errors.InvalidBucketNameError(`Invalid bucket name: ${bucketName}`);
      }

      if (!(0, _helpers.isFunction)(cb)) {
        throw new TypeError('callback should be of type "function"');
      }

      var method = 'GET';
      var query = 'policy';
      this.makeRequest({
        method,
        bucketName,
        query
      }, '', [200], '', true, function (e, response) {
        if (e) return cb(e);
        var policy = Buffer.from('');
        (0, _helpers.pipesetup)(response, transformers.getConcater()).on('data', function (data) {
          return policy = data;
        }).on('error', cb).on('end', function () {
          cb(null, policy.toString());
        });
      });
    } // Set the policy on a bucket or an object prefix.
    //
    // __Arguments__
    // * `bucketName` _string_: name of the bucket
    // * `bucketPolicy` _string_: bucket policy (JSON stringify'ed)
    // * `callback(err)` _function_: callback function

  }, {
    key: "setBucketPolicy",
    value: function setBucketPolicy(bucketName, policy, cb) {
      // Validate arguments.
      if (!(0, _helpers.isValidBucketName)(bucketName)) {
        throw new errors.InvalidBucketNameError(`Invalid bucket name: ${bucketName}`);
      }

      if (!(0, _helpers.isString)(policy)) {
        throw new errors.InvalidBucketPolicyError(`Invalid bucket policy: ${policy} - must be "string"`);
      }

      if (!(0, _helpers.isFunction)(cb)) {
        throw new TypeError('callback should be of type "function"');
      }

      var method = 'DELETE';
      var query = 'policy';

      if (policy) {
        method = 'PUT';
      }

      this.makeRequest({
        method,
        bucketName,
        query
      }, policy, [204], '', false, cb);
    } // Generate a generic presigned URL which can be
    // used for HTTP methods GET, PUT, HEAD and DELETE
    //
    // __Arguments__
    // * `method` _string_: name of the HTTP method
    // * `bucketName` _string_: name of the bucket
    // * `objectName` _string_: name of the object
    // * `expiry` _number_: expiry in seconds (optional, default 7 days)
    // * `reqParams` _object_: request parameters (optional) e.g {versionId:"10fa9946-3f64-4137-a58f-888065c0732e"}
    // * `requestDate` _Date_: A date object, the url will be issued at (optional)

  }, {
    key: "presignedUrl",
    value: function presignedUrl(method, bucketName, objectName, expires, reqParams, requestDate, cb) {
      var _this12 = this;

      if (this.anonymous) {
        throw new errors.AnonymousRequestError('Presigned ' + method + ' url cannot be generated for anonymous requests');
      }

      if ((0, _helpers.isFunction)(requestDate)) {
        cb = requestDate;
        requestDate = new Date();
      }

      if ((0, _helpers.isFunction)(reqParams)) {
        cb = reqParams;
        reqParams = {};
        requestDate = new Date();
      }

      if ((0, _helpers.isFunction)(expires)) {
        cb = expires;
        reqParams = {};
        expires = 24 * 60 * 60 * 7; // 7 days in seconds

        requestDate = new Date();
      }

      if (!(0, _helpers.isNumber)(expires)) {
        throw new TypeError('expires should be of type "number"');
      }

      if (!(0, _helpers.isObject)(reqParams)) {
        throw new TypeError('reqParams should be of type "object"');
      }

      if (!(0, _helpers.isValidDate)(requestDate)) {
        throw new TypeError('requestDate should be of type "Date" and valid');
      }

      if (!(0, _helpers.isFunction)(cb)) {
        throw new TypeError('callback should be of type "function"');
      }

      var query = _querystring.default.stringify(reqParams);

      this.getBucketRegion(bucketName, function (e, region) {
        if (e) return cb(e); // This statement is added to ensure that we send error through
        // callback on presign failure.

        var url;

        var reqOptions = _this12.getRequestOptions({
          method,
          region,
          bucketName,
          objectName,
          query
        });

        try {
          url = (0, _signing.presignSignatureV4)(reqOptions, _this12.accessKey, _this12.secretKey, _this12.sessionToken, region, requestDate, expires, _this12.signingHost);
        } catch (pe) {
          return cb(pe);
        }

        cb(null, url);
      });
    } // Generate a presigned URL for GET
    //
    // __Arguments__
    // * `bucketName` _string_: name of the bucket
    // * `objectName` _string_: name of the object
    // * `expiry` _number_: expiry in seconds (optional, default 7 days)
    // * `respHeaders` _object_: response headers to override or request params for query (optional) e.g {versionId:"10fa9946-3f64-4137-a58f-888065c0732e"}
    // * `requestDate` _Date_: A date object, the url will be issued at (optional)

  }, {
    key: "presignedGetObject",
    value: function presignedGetObject(bucketName, objectName, expires, respHeaders, requestDate, cb) {
      if (!(0, _helpers.isValidBucketName)(bucketName)) {
        throw new errors.InvalidBucketNameError('Invalid bucket name: ' + bucketName);
      }

      if (!(0, _helpers.isValidObjectName)(objectName)) {
        throw new errors.InvalidObjectNameError(`Invalid object name: ${objectName}`);
      }

      if ((0, _helpers.isFunction)(respHeaders)) {
        cb = respHeaders;
        respHeaders = {};
        requestDate = new Date();
      }

      var validRespHeaders = ['response-content-type', 'response-content-language', 'response-expires', 'response-cache-control', 'response-content-disposition', 'response-content-encoding'];
      validRespHeaders.forEach(function (header) {
        if (respHeaders !== undefined && respHeaders[header] !== undefined && !(0, _helpers.isString)(respHeaders[header])) {
          throw new TypeError(`response header ${header} should be of type "string"`);
        }
      });
      return this.presignedUrl('GET', bucketName, objectName, expires, respHeaders, requestDate, cb);
    } // Generate a presigned URL for PUT. Using this URL, the browser can upload to S3 only with the specified object name.
    //
    // __Arguments__
    // * `bucketName` _string_: name of the bucket
    // * `objectName` _string_: name of the object
    // * `expiry` _number_: expiry in seconds (optional, default 7 days)

  }, {
    key: "presignedPutObject",
    value: function presignedPutObject(bucketName, objectName, expires, cb) {
      if (!(0, _helpers.isValidBucketName)(bucketName)) {
        throw new errors.InvalidBucketNameError('Invalid bucket name: ${bucketName}');
      }

      if (!(0, _helpers.isValidObjectName)(objectName)) {
        throw new errors.InvalidObjectNameError('Invalid object name: ${objectName}');
      }

      return this.presignedUrl('PUT', bucketName, objectName, expires, cb);
    } // return PostPolicy object

  }, {
    key: "newPostPolicy",
    value: function newPostPolicy() {
      return new PostPolicy();
    } // presignedPostPolicy can be used in situations where we want more control on the upload than what
    // presignedPutObject() provides. i.e Using presignedPostPolicy we will be able to put policy restrictions
    // on the object's `name` `bucket` `expiry` `Content-Type`

  }, {
    key: "presignedPostPolicy",
    value: function presignedPostPolicy(postPolicy, cb) {
      var _this13 = this;

      if (this.anonymous) {
        throw new errors.AnonymousRequestError('Presigned POST policy cannot be generated for anonymous requests');
      }

      if (!(0, _helpers.isObject)(postPolicy)) {
        throw new TypeError('postPolicy should be of type "object"');
      }

      if (!(0, _helpers.isFunction)(cb)) {
        throw new TypeError('cb should be of type "function"');
      }

      this.getBucketRegion(postPolicy.formData.bucket, function (e, region) {
        if (e) return cb(e);
        var date = new Date();
        var dateStr = (0, _helpers.makeDateLong)(date);

        if (!postPolicy.policy.expiration) {
          // 'expiration' is mandatory field for S3.
          // Set default expiration date of 7 days.
          var expires = new Date();
          expires.setSeconds(24 * 60 * 60 * 7);
          postPolicy.setExpires(expires);
        }

        postPolicy.policy.conditions.push(['eq', '$x-amz-date', dateStr]);
        postPolicy.formData['x-amz-date'] = dateStr;
        postPolicy.policy.conditions.push(['eq', '$x-amz-algorithm', 'AWS4-HMAC-SHA256']);
        postPolicy.formData['x-amz-algorithm'] = 'AWS4-HMAC-SHA256';
        postPolicy.policy.conditions.push(["eq", "$x-amz-credential", _this13.accessKey + "/" + (0, _helpers.getScope)(region, date)]);
        postPolicy.formData['x-amz-credential'] = _this13.accessKey + "/" + (0, _helpers.getScope)(region, date);

        if (_this13.sessionToken) {
          postPolicy.policy.conditions.push(['eq', '$x-amz-security-token', _this13.sessionToken]);
          postPolicy.formData['x-amz-security-token'] = _this13.sessionToken;
        }

        var policyBase64 = Buffer.from(JSON.stringify(postPolicy.policy)).toString('base64');
        postPolicy.formData.policy = policyBase64;
        var signature = (0, _signing.postPresignSignatureV4)(region, date, _this13.secretKey, policyBase64);
        postPolicy.formData['x-amz-signature'] = signature;
        var opts = {};
        opts.region = region;
        opts.bucketName = postPolicy.formData.bucket;

        var reqOptions = _this13.getRequestOptions(opts);

        var portStr = _this13.port == 80 || _this13.port === 443 ? '' : `:${_this13.port.toString()}`;
        var urlStr = `${reqOptions.protocol}//${reqOptions.host}${portStr}${reqOptions.path}`;
        cb(null, {
          postURL: urlStr,
          formData: postPolicy.formData
        });
      });
    } // Calls implemented below are related to multipart.
    // Initiate a new multipart upload.

  }, {
    key: "initiateNewMultipartUpload",
    value: function initiateNewMultipartUpload(bucketName, objectName, metaData, cb) {
      if (!(0, _helpers.isValidBucketName)(bucketName)) {
        throw new errors.InvalidBucketNameError('Invalid bucket name: ' + bucketName);
      }

      if (!(0, _helpers.isValidObjectName)(objectName)) {
        throw new errors.InvalidObjectNameError(`Invalid object name: ${objectName}`);
      }

      if (!(0, _helpers.isObject)(metaData)) {
        throw new errors.InvalidObjectNameError('contentType should be of type "object"');
      }

      var method = 'POST';
      var headers = Object.assign({}, metaData);
      var query = 'uploads';
      this.makeRequest({
        method,
        bucketName,
        objectName,
        query,
        headers
      }, '', [200], '', true, function (e, response) {
        if (e) return cb(e);
        var transformer = transformers.getInitiateMultipartTransformer();
        (0, _helpers.pipesetup)(response, transformer).on('error', function (e) {
          return cb(e);
        }).on('data', function (uploadId) {
          return cb(null, uploadId);
        });
      });
    } // Complete the multipart upload. After all the parts are uploaded issuing
    // this call will aggregate the parts on the server into a single object.

  }, {
    key: "completeMultipartUpload",
    value: function completeMultipartUpload(bucketName, objectName, uploadId, etags, cb) {
      if (!(0, _helpers.isValidBucketName)(bucketName)) {
        throw new errors.InvalidBucketNameError('Invalid bucket name: ' + bucketName);
      }

      if (!(0, _helpers.isValidObjectName)(objectName)) {
        throw new errors.InvalidObjectNameError(`Invalid object name: ${objectName}`);
      }

      if (!(0, _helpers.isString)(uploadId)) {
        throw new TypeError('uploadId should be of type "string"');
      }

      if (!(0, _helpers.isObject)(etags)) {
        throw new TypeError('etags should be of type "Array"');
      }

      if (!(0, _helpers.isFunction)(cb)) {
        throw new TypeError('cb should be of type "function"');
      }

      if (!uploadId) {
        throw new errors.InvalidArgumentError('uploadId cannot be empty');
      }

      var method = 'POST';
      var query = `uploadId=${(0, _helpers.uriEscape)(uploadId)}`;
      var parts = [];
      etags.forEach(function (element) {
        parts.push({
          Part: [{
            PartNumber: element.part
          }, {
            ETag: element.etag
          }]
        });
      });
      var payloadObject = {
        CompleteMultipartUpload: parts
      };
      var payload = (0, _xml.default)(payloadObject);
      this.makeRequest({
        method,
        bucketName,
        objectName,
        query
      }, payload, [200], '', true, function (e, response) {
        if (e) return cb(e);
        var transformer = transformers.getCompleteMultipartTransformer();
        (0, _helpers.pipesetup)(response, transformer).on('error', function (e) {
          return cb(e);
        }).on('data', function (result) {
          if (result.errCode) {
            // Multipart Complete API returns an error XML after a 200 http status
            cb(new errors.S3Error(result.errMessage));
          } else {
            var completeMultipartResult = {
              etag: result.etag,
              versionId: (0, _helpers.getVersionId)(response.headers)
            };
            cb(null, completeMultipartResult);
          }
        });
      });
    } // Get part-info of all parts of an incomplete upload specified by uploadId.

  }, {
    key: "listParts",
    value: function listParts(bucketName, objectName, uploadId, cb) {
      var _this14 = this;

      if (!(0, _helpers.isValidBucketName)(bucketName)) {
        throw new errors.InvalidBucketNameError('Invalid bucket name: ' + bucketName);
      }

      if (!(0, _helpers.isValidObjectName)(objectName)) {
        throw new errors.InvalidObjectNameError(`Invalid object name: ${objectName}`);
      }

      if (!(0, _helpers.isString)(uploadId)) {
        throw new TypeError('uploadId should be of type "string"');
      }

      if (!uploadId) {
        throw new errors.InvalidArgumentError('uploadId cannot be empty');
      }

      var parts = [];

      var listNext = function listNext(marker) {
        _this14.listPartsQuery(bucketName, objectName, uploadId, marker, function (e, result) {
          if (e) {
            cb(e);
            return;
          }

          parts = parts.concat(result.parts);

          if (result.isTruncated) {
            listNext(result.marker);
            return;
          }

          cb(null, parts);
        });
      };

      listNext(0);
    } // Called by listParts to fetch a batch of part-info

  }, {
    key: "listPartsQuery",
    value: function listPartsQuery(bucketName, objectName, uploadId, marker, cb) {
      if (!(0, _helpers.isValidBucketName)(bucketName)) {
        throw new errors.InvalidBucketNameError('Invalid bucket name: ' + bucketName);
      }

      if (!(0, _helpers.isValidObjectName)(objectName)) {
        throw new errors.InvalidObjectNameError(`Invalid object name: ${objectName}`);
      }

      if (!(0, _helpers.isString)(uploadId)) {
        throw new TypeError('uploadId should be of type "string"');
      }

      if (!(0, _helpers.isNumber)(marker)) {
        throw new TypeError('marker should be of type "number"');
      }

      if (!(0, _helpers.isFunction)(cb)) {
        throw new TypeError('callback should be of type "function"');
      }

      if (!uploadId) {
        throw new errors.InvalidArgumentError('uploadId cannot be empty');
      }

      var query = '';

      if (marker && marker !== 0) {
        query += `part-number-marker=${marker}&`;
      }

      query += `uploadId=${(0, _helpers.uriEscape)(uploadId)}`;
      var method = 'GET';
      this.makeRequest({
        method,
        bucketName,
        objectName,
        query
      }, '', [200], '', true, function (e, response) {
        if (e) return cb(e);
        var transformer = transformers.getListPartsTransformer();
        (0, _helpers.pipesetup)(response, transformer).on('error', function (e) {
          return cb(e);
        }).on('data', function (data) {
          return cb(null, data);
        });
      });
    } // Called by listIncompleteUploads to fetch a batch of incomplete uploads.

  }, {
    key: "listIncompleteUploadsQuery",
    value: function listIncompleteUploadsQuery(bucketName, prefix, keyMarker, uploadIdMarker, delimiter) {
      if (!(0, _helpers.isValidBucketName)(bucketName)) {
        throw new errors.InvalidBucketNameError('Invalid bucket name: ' + bucketName);
      }

      if (!(0, _helpers.isString)(prefix)) {
        throw new TypeError('prefix should be of type "string"');
      }

      if (!(0, _helpers.isString)(keyMarker)) {
        throw new TypeError('keyMarker should be of type "string"');
      }

      if (!(0, _helpers.isString)(uploadIdMarker)) {
        throw new TypeError('uploadIdMarker should be of type "string"');
      }

      if (!(0, _helpers.isString)(delimiter)) {
        throw new TypeError('delimiter should be of type "string"');
      }

      var queries = [];
      queries.push(`prefix=${(0, _helpers.uriEscape)(prefix)}`);
      queries.push(`delimiter=${(0, _helpers.uriEscape)(delimiter)}`);

      if (keyMarker) {
        keyMarker = (0, _helpers.uriEscape)(keyMarker);
        queries.push(`key-marker=${keyMarker}`);
      }

      if (uploadIdMarker) {
        queries.push(`upload-id-marker=${uploadIdMarker}`);
      }

      var maxUploads = 1000;
      queries.push(`max-uploads=${maxUploads}`);
      queries.sort();
      queries.unshift('uploads');
      var query = '';

      if (queries.length > 0) {
        query = `${queries.join('&')}`;
      }

      var method = 'GET';
      var transformer = transformers.getListMultipartTransformer();
      this.makeRequest({
        method,
        bucketName,
        query
      }, '', [200], '', true, function (e, response) {
        if (e) return transformer.emit('error', e);
        (0, _helpers.pipesetup)(response, transformer);
      });
      return transformer;
    } // Find uploadId of an incomplete upload.

  }, {
    key: "findUploadId",
    value: function findUploadId(bucketName, objectName, cb) {
      var _this15 = this;

      if (!(0, _helpers.isValidBucketName)(bucketName)) {
        throw new errors.InvalidBucketNameError('Invalid bucket name: ' + bucketName);
      }

      if (!(0, _helpers.isValidObjectName)(objectName)) {
        throw new errors.InvalidObjectNameError(`Invalid object name: ${objectName}`);
      }

      if (!(0, _helpers.isFunction)(cb)) {
        throw new TypeError('cb should be of type "function"');
      }

      var latestUpload;

      var listNext = function listNext(keyMarker, uploadIdMarker) {
        _this15.listIncompleteUploadsQuery(bucketName, objectName, keyMarker, uploadIdMarker, '').on('error', function (e) {
          return cb(e);
        }).on('data', function (result) {
          result.uploads.forEach(function (upload) {
            if (upload.key === objectName) {
              if (!latestUpload || upload.initiated.getTime() > latestUpload.initiated.getTime()) {
                latestUpload = upload;
                return;
              }
            }
          });

          if (result.isTruncated) {
            listNext(result.nextKeyMarker, result.nextUploadIdMarker);
            return;
          }

          if (latestUpload) return cb(null, latestUpload.uploadId);
          cb(null, undefined);
        });
      };

      listNext('', '');
    } // Returns a function that can be used for uploading objects.
    // If multipart === true, it returns function that is used to upload
    // a part of the multipart.

  }, {
    key: "getUploader",
    value: function getUploader(bucketName, objectName, metaData, multipart) {
      var _this16 = this;

      if (!(0, _helpers.isValidBucketName)(bucketName)) {
        throw new errors.InvalidBucketNameError('Invalid bucket name: ' + bucketName);
      }

      if (!(0, _helpers.isValidObjectName)(objectName)) {
        throw new errors.InvalidObjectNameError(`Invalid object name: ${objectName}`);
      }

      if (!(0, _helpers.isBoolean)(multipart)) {
        throw new TypeError('multipart should be of type "boolean"');
      }

      if (!(0, _helpers.isObject)(metaData)) {
        throw new TypeError('metadata should be of type "object"');
      }

      var validate = function validate(stream, length, sha256sum, md5sum, cb) {
        if (!(0, _helpers.isReadableStream)(stream)) {
          throw new TypeError('stream should be of type "Stream"');
        }

        if (!(0, _helpers.isNumber)(length)) {
          throw new TypeError('length should be of type "number"');
        }

        if (!(0, _helpers.isString)(sha256sum)) {
          throw new TypeError('sha256sum should be of type "string"');
        }

        if (!(0, _helpers.isString)(md5sum)) {
          throw new TypeError('md5sum should be of type "string"');
        }

        if (!(0, _helpers.isFunction)(cb)) {
          throw new TypeError('callback should be of type "function"');
        }
      };

      var simpleUploader = function simpleUploader() {
        for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          args[_key3] = arguments[_key3];
        }

        validate.apply(void 0, args);
        var query = '';
        upload.apply(void 0, [query].concat(args));
      };

      var multipartUploader = function multipartUploader(uploadId, partNumber) {
        if (!(0, _helpers.isString)(uploadId)) {
          throw new TypeError('uploadId should be of type "string"');
        }

        if (!(0, _helpers.isNumber)(partNumber)) {
          throw new TypeError('partNumber should be of type "number"');
        }

        if (!uploadId) {
          throw new errors.InvalidArgumentError('Empty uploadId');
        }

        if (!partNumber) {
          throw new errors.InvalidArgumentError('partNumber cannot be 0');
        }

        for (var _len4 = arguments.length, rest = new Array(_len4 > 2 ? _len4 - 2 : 0), _key4 = 2; _key4 < _len4; _key4++) {
          rest[_key4 - 2] = arguments[_key4];
        }

        validate.apply(void 0, rest);
        var query = `partNumber=${partNumber}&uploadId=${(0, _helpers.uriEscape)(uploadId)}`;
        upload.apply(void 0, [query].concat(rest));
      };

      var upload = function upload(query, stream, length, sha256sum, md5sum, cb) {
        var method = 'PUT';
        var headers = {
          'Content-Length': length
        };

        if (!multipart) {
          headers = Object.assign({}, metaData, headers);
        }

        if (!_this16.enableSHA256) headers['Content-MD5'] = md5sum;

        _this16.makeRequestStream({
          method,
          bucketName,
          objectName,
          query,
          headers
        }, stream, sha256sum, [200], '', true, function (e, response) {
          if (e) return cb(e);
          var result = {
            etag: (0, _helpers.sanitizeETag)(response.headers.etag),
            versionId: (0, _helpers.getVersionId)(response.headers)
          }; // Ignore the 'data' event so that the stream closes. (nodejs stream requirement)

          response.on('data', function () {});
          cb(null, result);
        });
      };

      if (multipart) {
        return multipartUploader;
      }

      return simpleUploader;
    } // Remove all the notification configurations in the S3 provider

  }, {
    key: "setBucketNotification",
    value: function setBucketNotification(bucketName, config, cb) {
      if (!(0, _helpers.isValidBucketName)(bucketName)) {
        throw new errors.InvalidBucketNameError('Invalid bucket name: ' + bucketName);
      }

      if (!(0, _helpers.isObject)(config)) {
        throw new TypeError('notification config should be of type "Object"');
      }

      if (!(0, _helpers.isFunction)(cb)) {
        throw new TypeError('callback should be of type "function"');
      }

      var method = 'PUT';
      var query = 'notification';
      var builder = new _xml2js.default.Builder({
        rootName: 'NotificationConfiguration',
        renderOpts: {
          'pretty': false
        },
        headless: true
      });
      var payload = builder.buildObject(config);
      this.makeRequest({
        method,
        bucketName,
        query
      }, payload, [200], '', false, cb);
    }
  }, {
    key: "removeAllBucketNotification",
    value: function removeAllBucketNotification(bucketName, cb) {
      this.setBucketNotification(bucketName, new _notification.NotificationConfig(), cb);
    } // Return the list of notification configurations stored
    // in the S3 provider

  }, {
    key: "getBucketNotification",
    value: function getBucketNotification(bucketName, cb) {
      if (!(0, _helpers.isValidBucketName)(bucketName)) {
        throw new errors.InvalidBucketNameError('Invalid bucket name: ' + bucketName);
      }

      if (!(0, _helpers.isFunction)(cb)) {
        throw new TypeError('callback should be of type "function"');
      }

      var method = 'GET';
      var query = 'notification';
      this.makeRequest({
        method,
        bucketName,
        query
      }, '', [200], '', true, function (e, response) {
        if (e) return cb(e);
        var transformer = transformers.getBucketNotificationTransformer();
        var bucketNotification;
        (0, _helpers.pipesetup)(response, transformer).on('data', function (result) {
          return bucketNotification = result;
        }).on('error', function (e) {
          return cb(e);
        }).on('end', function () {
          return cb(null, bucketNotification);
        });
      });
    } // Listens for bucket notifications. Returns an EventEmitter.

  }, {
    key: "listenBucketNotification",
    value: function listenBucketNotification(bucketName, prefix, suffix, events) {
      if (!(0, _helpers.isValidBucketName)(bucketName)) {
        throw new errors.InvalidBucketNameError(`Invalid bucket name: ${bucketName}`);
      }

      if (!(0, _helpers.isString)(prefix)) {
        throw new TypeError('prefix must be of type string');
      }

      if (!(0, _helpers.isString)(suffix)) {
        throw new TypeError('suffix must be of type string');
      }

      if (!(0, _helpers.isArray)(events)) {
        throw new TypeError('events must be of type Array');
      }

      var listener = new _notification.NotificationPoller(this, bucketName, prefix, suffix, events);
      listener.start();
      return listener;
    }
  }, {
    key: "getBucketVersioning",
    value: function getBucketVersioning(bucketName, cb) {
      if (!(0, _helpers.isValidBucketName)(bucketName)) {
        throw new errors.InvalidBucketNameError('Invalid bucket name: ' + bucketName);
      }

      if (!(0, _helpers.isFunction)(cb)) {
        throw new errors.InvalidArgumentError('callback should be of type "function"');
      }

      var method = 'GET';
      var query = "versioning";
      this.makeRequest({
        method,
        bucketName,
        query
      }, '', [200], '', true, function (e, response) {
        if (e) return cb(e);
        var versionConfig = Buffer.from('');
        (0, _helpers.pipesetup)(response, transformers.bucketVersioningTransformer()).on('data', function (data) {
          versionConfig = data;
        }).on('error', cb).on('end', function () {
          cb(null, versionConfig);
        });
      });
    }
  }, {
    key: "setBucketVersioning",
    value: function setBucketVersioning(bucketName, versionConfig, cb) {
      if (!(0, _helpers.isValidBucketName)(bucketName)) {
        throw new errors.InvalidBucketNameError('Invalid bucket name: ' + bucketName);
      }

      if (!Object.keys(versionConfig).length) {
        throw new errors.InvalidArgumentError('versionConfig should be of type "object"');
      }

      if (!(0, _helpers.isFunction)(cb)) {
        throw new TypeError('callback should be of type "function"');
      }

      var method = 'PUT';
      var query = "versioning";
      var builder = new _xml2js.default.Builder({
        rootName: 'VersioningConfiguration',
        renderOpts: {
          'pretty': false
        },
        headless: true
      });
      var payload = builder.buildObject(versionConfig);
      this.makeRequest({
        method,
        bucketName,
        query
      }, payload, [200], '', false, cb);
    }
    /** To set Tags on a bucket or object based on the params
       *  __Arguments__
       * taggingParams _object_ Which contains the following properties
       *  bucketName _string_,
       *  objectName _string_ (Optional),
       *  tags _object_ of the form {'<tag-key-1>':'<tag-value-1>','<tag-key-2>':'<tag-value-2>'}
       *  putOpts _object_ (Optional) e.g {versionId:"my-object-version-id"},
       *  cb(error)` _function_ - callback function with `err` as the error argument. `err` is null if the operation is successful.
       */

  }, {
    key: "setTagging",
    value: function setTagging(taggingParams) {
      var bucketName = taggingParams.bucketName,
          objectName = taggingParams.objectName,
          tags = taggingParams.tags,
          _taggingParams$putOpt = taggingParams.putOpts,
          putOpts = _taggingParams$putOpt === void 0 ? {} : _taggingParams$putOpt,
          cb = taggingParams.cb;
      var method = 'PUT';
      var query = "tagging";

      if (putOpts && putOpts.versionId) {
        query = `${query}&versionId=${putOpts.versionId}`;
      }

      var tagsList = [];

      for (var _i = 0, _Object$entries = Object.entries(tags); _i < _Object$entries.length; _i++) {
        var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
            key = _Object$entries$_i[0],
            value = _Object$entries$_i[1];

        tagsList.push({
          Key: key,
          Value: value
        });
      }

      var taggingConfig = {
        Tagging: {
          TagSet: {
            Tag: tagsList
          }
        }
      };
      var encoder = new _webEncoding.TextEncoder();
      var headers = {};
      var builder = new _xml2js.default.Builder({
        headless: true,
        renderOpts: {
          'pretty': false
        }
      });
      var payload = builder.buildObject(taggingConfig);
      payload = encoder.encode(payload);
      headers['Content-MD5'] = (0, _helpers.toMd5)(payload);
      var requestOptions = {
        method,
        bucketName,
        query,
        headers
      };

      if (objectName) {
        requestOptions['objectName'] = objectName;
      }

      headers['Content-MD5'] = (0, _helpers.toMd5)(payload);
      this.makeRequest(requestOptions, payload, [200], '', false, cb);
    }
    /** Set Tags on a Bucket
     * __Arguments__
     * bucketName _string_
     * tags _object_ of the form {'<tag-key-1>':'<tag-value-1>','<tag-key-2>':'<tag-value-2>'}
     * `cb(error)` _function_ - callback function with `err` as the error argument. `err` is null if the operation is successful.
     */

  }, {
    key: "setBucketTagging",
    value: function setBucketTagging(bucketName, tags, cb) {
      if (!(0, _helpers.isValidBucketName)(bucketName)) {
        throw new errors.InvalidBucketNameError('Invalid bucket name: ' + bucketName);
      }

      if (!(0, _helpers.isObject)(tags)) {
        throw new errors.InvalidArgumentError('tags should be of type "object"');
      }

      if (Object.keys(tags).length > 10) {
        throw new errors.InvalidArgumentError('maximum tags allowed is 10"');
      }

      if (!(0, _helpers.isFunction)(cb)) {
        throw new errors.InvalidArgumentError('callback should be of type "function"');
      }

      return this.setTagging({
        bucketName,
        tags,
        cb
      });
    }
    /** Set Tags on an Object
     * __Arguments__
     * bucketName _string_
     * objectName _string_
     *  * tags _object_ of the form {'<tag-key-1>':'<tag-value-1>','<tag-key-2>':'<tag-value-2>'}
     *  putOpts _object_ (Optional) e.g {versionId:"my-object-version-id"},
     * `cb(error)` _function_ - callback function with `err` as the error argument. `err` is null if the operation is successful.
     */

  }, {
    key: "setObjectTagging",
    value: function setObjectTagging(bucketName, objectName, tags) {
      var putOpts = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
      var cb = arguments.length > 4 ? arguments[4] : undefined;

      if (!(0, _helpers.isValidBucketName)(bucketName)) {
        throw new errors.InvalidBucketNameError('Invalid bucket name: ' + bucketName);
      }

      if (!(0, _helpers.isValidObjectName)(objectName)) {
        throw new errors.InvalidBucketNameError('Invalid object name: ' + objectName);
      }

      if ((0, _helpers.isFunction)(putOpts)) {
        cb = putOpts;
        putOpts = {};
      }

      if (!(0, _helpers.isObject)(tags)) {
        throw new errors.InvalidArgumentError('tags should be of type "object"');
      }

      if (Object.keys(tags).length > 10) {
        throw new errors.InvalidArgumentError('Maximum tags allowed is 10"');
      }

      if (!(0, _helpers.isFunction)(cb)) {
        throw new TypeError('callback should be of type "function"');
      }

      return this.setTagging({
        bucketName,
        objectName,
        tags,
        putOpts,
        cb
      });
    }
    /** Remove Tags on an Bucket/Object based on params
     * __Arguments__
     * bucketName _string_
     * objectName _string_ (optional)
     * removeOpts _object_ (Optional) e.g {versionId:"my-object-version-id"},
     * `cb(error)` _function_ - callback function with `err` as the error argument. `err` is null if the operation is successful.
     */

  }, {
    key: "removeTagging",
    value: function removeTagging(_ref) {
      var bucketName = _ref.bucketName,
          objectName = _ref.objectName,
          removeOpts = _ref.removeOpts,
          cb = _ref.cb;
      var method = 'DELETE';
      var query = "tagging";

      if (removeOpts && Object.keys(removeOpts).length && removeOpts.versionId) {
        query = `${query}&versionId=${removeOpts.versionId}`;
      }

      var requestOptions = {
        method,
        bucketName,
        objectName,
        query
      };

      if (objectName) {
        requestOptions['objectName'] = objectName;
      }

      this.makeRequest(requestOptions, '', [200, 204], '', true, cb);
    }
    /** Remove Tags associated with a bucket
     *  __Arguments__
     * bucketName _string_
     * `cb(error)` _function_ - callback function with `err` as the error argument. `err` is null if the operation is successful.
     */

  }, {
    key: "removeBucketTagging",
    value: function removeBucketTagging(bucketName, cb) {
      if (!(0, _helpers.isValidBucketName)(bucketName)) {
        throw new errors.InvalidBucketNameError('Invalid bucket name: ' + bucketName);
      }

      if (!(0, _helpers.isFunction)(cb)) {
        throw new TypeError('callback should be of type "function"');
      }

      return this.removeTagging({
        bucketName,
        cb
      });
    }
    /** Remove tags associated with an object
     * __Arguments__
     * bucketName _string_
     * objectName _string_
     * removeOpts _object_ (Optional) e.g. {VersionID:"my-object-version-id"}
     * `cb(error)` _function_ - callback function with `err` as the error argument. `err` is null if the operation is successful.
     */

  }, {
    key: "removeObjectTagging",
    value: function removeObjectTagging(bucketName, objectName, removeOpts, cb) {
      if (!(0, _helpers.isValidBucketName)(bucketName)) {
        throw new errors.InvalidBucketNameError('Invalid bucket name: ' + bucketName);
      }

      if (!(0, _helpers.isValidObjectName)(objectName)) {
        throw new errors.InvalidBucketNameError('Invalid object name: ' + objectName);
      }

      if ((0, _helpers.isFunction)(removeOpts)) {
        cb = removeOpts;
        removeOpts = {};
      }

      if (removeOpts && Object.keys(removeOpts).length && !(0, _helpers.isObject)(removeOpts)) {
        throw new errors.InvalidArgumentError('removeOpts should be of type "object"');
      }

      if (!(0, _helpers.isFunction)(cb)) {
        throw new TypeError('callback should be of type "function"');
      }

      return this.removeTagging({
        bucketName,
        objectName,
        removeOpts,
        cb
      });
    }
    /** Get Tags associated with a Bucket
     *  __Arguments__
     * bucketName _string_
     * `cb(error, tags)` _function_ - callback function with `err` as the error argument. `err` is null if the operation is successful.
     */

  }, {
    key: "getBucketTagging",
    value: function getBucketTagging(bucketName, cb) {
      var method = 'GET';
      var query = "tagging";
      var requestOptions = {
        method,
        bucketName,
        query
      };
      this.makeRequest(requestOptions, '', [200], '', true, function (e, response) {
        var transformer = transformers.getTagsTransformer();
        if (e) return cb(e);
        var tagsList;
        (0, _helpers.pipesetup)(response, transformer).on('data', function (result) {
          return tagsList = result;
        }).on('error', function (e) {
          return cb(e);
        }).on('end', function () {
          return cb(null, tagsList);
        });
      });
    }
    /** Get the tags associated with a bucket OR an object
     * bucketName _string_
     * objectName _string_ (Optional)
     * getOpts _object_ (Optional) e.g {versionId:"my-object-version-id"}
     * `cb(error, tags)` _function_ - callback function with `err` as the error argument. `err` is null if the operation is successful.
     */

  }, {
    key: "getObjectTagging",
    value: function getObjectTagging(bucketName, objectName) {
      var getOpts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var cb = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : function () {
        return false;
      };
      var method = 'GET';
      var query = "tagging";

      if (!(0, _helpers.isValidBucketName)(bucketName)) {
        throw new errors.InvalidBucketNameError('Invalid bucket name: ' + bucketName);
      }

      if (!(0, _helpers.isValidObjectName)(objectName)) {
        throw new errors.InvalidBucketNameError('Invalid object name: ' + objectName);
      }

      if ((0, _helpers.isFunction)(getOpts)) {
        cb = getOpts;
        getOpts = {};
      }

      if (!(0, _helpers.isObject)(getOpts)) {
        throw new errors.InvalidArgumentError('getOpts should be of type "object"');
      }

      if (!(0, _helpers.isFunction)(cb)) {
        throw new TypeError('callback should be of type "function"');
      }

      if (getOpts && getOpts.versionId) {
        query = `${query}&versionId=${getOpts.versionId}`;
      }

      var requestOptions = {
        method,
        bucketName,
        query
      };

      if (objectName) {
        requestOptions['objectName'] = objectName;
      }

      this.makeRequest(requestOptions, '', [200], '', true, function (e, response) {
        var transformer = transformers.getTagsTransformer();
        if (e) return cb(e);
        var tagsList;
        (0, _helpers.pipesetup)(response, transformer).on('data', function (result) {
          return tagsList = result;
        }).on('error', function (e) {
          return cb(e);
        }).on('end', function () {
          return cb(null, tagsList);
        });
      });
    }
    /** Put lifecycle configuration on a bucket.
    /** Apply lifecycle configuration on a bucket.
     * bucketName _string_
     * policyConfig _object_ a valid policy configuration object.
     * `cb(error)` _function_ - callback function with `err` as the error argument. `err` is null if the operation is successful.
     */

  }, {
    key: "applyBucketLifecycle",
    value: function applyBucketLifecycle(bucketName, policyConfig, cb) {
      var method = 'PUT';
      var query = "lifecycle";
      var encoder = new _webEncoding.TextEncoder();
      var headers = {};
      var builder = new _xml2js.default.Builder({
        rootName: 'LifecycleConfiguration',
        headless: true,
        renderOpts: {
          'pretty': false
        }
      });
      var payload = builder.buildObject(policyConfig);
      payload = encoder.encode(payload);
      var requestOptions = {
        method,
        bucketName,
        query,
        headers
      };
      headers['Content-MD5'] = (0, _helpers.toMd5)(payload);
      this.makeRequest(requestOptions, payload, [200], '', false, cb);
    }
    /** Remove lifecycle configuration of a bucket.
     * bucketName _string_
     * `cb(error)` _function_ - callback function with `err` as the error argument. `err` is null if the operation is successful.
     */

  }, {
    key: "removeBucketLifecycle",
    value: function removeBucketLifecycle(bucketName, cb) {
      if (!(0, _helpers.isValidBucketName)(bucketName)) {
        throw new errors.InvalidBucketNameError('Invalid bucket name: ' + bucketName);
      }

      var method = 'DELETE';
      var query = "lifecycle";
      this.makeRequest({
        method,
        bucketName,
        query
      }, '', [204], '', false, cb);
    }
    /** Set/Override lifecycle configuration on a bucket. if the configuration is empty, it removes the configuration.
     * bucketName _string_
     * lifeCycleConfig _object_ one of the following values: (null or '') to remove the lifecycle configuration. or a valid lifecycle configuration
     * `cb(error)` _function_ - callback function with `err` as the error argument. `err` is null if the operation is successful.
     */

  }, {
    key: "setBucketLifecycle",
    value: function setBucketLifecycle(bucketName) {
      var lifeCycleConfig = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var cb = arguments.length > 2 ? arguments[2] : undefined;

      if (!(0, _helpers.isValidBucketName)(bucketName)) {
        throw new errors.InvalidBucketNameError('Invalid bucket name: ' + bucketName);
      }

      if (_lodash.default.isEmpty(lifeCycleConfig)) {
        this.removeBucketLifecycle(bucketName, cb);
      } else {
        this.applyBucketLifecycle(bucketName, lifeCycleConfig, cb);
      }
    }
    /** Get lifecycle configuration on a bucket.
     * bucketName _string_
     * `cb(config)` _function_ - callback function with lifecycle configuration as the error argument.
     */

  }, {
    key: "getBucketLifecycle",
    value: function getBucketLifecycle(bucketName, cb) {
      if (!(0, _helpers.isValidBucketName)(bucketName)) {
        throw new errors.InvalidBucketNameError('Invalid bucket name: ' + bucketName);
      }

      var method = 'GET';
      var query = "lifecycle";
      var requestOptions = {
        method,
        bucketName,
        query
      };
      this.makeRequest(requestOptions, '', [200], '', true, function (e, response) {
        var transformer = transformers.lifecycleTransformer();
        if (e) return cb(e);
        var lifecycleConfig;
        (0, _helpers.pipesetup)(response, transformer).on('data', function (result) {
          return lifecycleConfig = result;
        }).on('error', function (e) {
          return cb(e);
        }).on('end', function () {
          return cb(null, lifecycleConfig);
        });
      });
    }
  }, {
    key: "setObjectLockConfig",
    value: function setObjectLockConfig(bucketName) {
      var lockConfigOpts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var cb = arguments.length > 2 ? arguments[2] : undefined;
      var retentionModes = [_helpers.RETENTION_MODES.COMPLIANCE, _helpers.RETENTION_MODES.GOVERNANCE];
      var validUnits = [_helpers.RETENTION_VALIDITY_UNITS.DAYS, _helpers.RETENTION_VALIDITY_UNITS.YEARS];

      if (!(0, _helpers.isValidBucketName)(bucketName)) {
        throw new errors.InvalidBucketNameError('Invalid bucket name: ' + bucketName);
      }

      if (lockConfigOpts.mode && !retentionModes.includes(lockConfigOpts.mode)) {
        throw new TypeError(`lockConfigOpts.mode should be one of ${retentionModes}`);
      }

      if (lockConfigOpts.unit && !validUnits.includes(lockConfigOpts.unit)) {
        throw new TypeError(`lockConfigOpts.unit should be one of ${validUnits}`);
      }

      if (lockConfigOpts.validity && !(0, _helpers.isNumber)(lockConfigOpts.validity)) {
        throw new TypeError(`lockConfigOpts.validity should be a number`);
      }

      var method = 'PUT';
      var query = "object-lock";
      var config = {
        ObjectLockEnabled: "Enabled"
      };
      var configKeys = Object.keys(lockConfigOpts); // Check if keys are present and all keys are present.

      if (configKeys.length > 0) {
        if (_lodash.default.difference(configKeys, ['unit', 'mode', 'validity']).length !== 0) {
          throw new TypeError(`lockConfigOpts.mode,lockConfigOpts.unit,lockConfigOpts.validity all the properties should be specified.`);
        } else {
          config.Rule = {
            DefaultRetention: {}
          };

          if (lockConfigOpts.mode) {
            config.Rule.DefaultRetention.Mode = lockConfigOpts.mode;
          }

          if (lockConfigOpts.unit === _helpers.RETENTION_VALIDITY_UNITS.DAYS) {
            config.Rule.DefaultRetention.Days = lockConfigOpts.validity;
          } else if (lockConfigOpts.unit === _helpers.RETENTION_VALIDITY_UNITS.YEARS) {
            config.Rule.DefaultRetention.Years = lockConfigOpts.validity;
          }
        }
      }

      var builder = new _xml2js.default.Builder({
        rootName: 'ObjectLockConfiguration',
        renderOpts: {
          'pretty': false
        },
        headless: true
      });
      var payload = builder.buildObject(config);
      var headers = {};
      headers['Content-MD5'] = (0, _helpers.toMd5)(payload);
      this.makeRequest({
        method,
        bucketName,
        query,
        headers
      }, payload, [200], '', false, cb);
    }
  }, {
    key: "getObjectLockConfig",
    value: function getObjectLockConfig(bucketName, cb) {
      if (!(0, _helpers.isValidBucketName)(bucketName)) {
        throw new errors.InvalidBucketNameError('Invalid bucket name: ' + bucketName);
      }

      if (!(0, _helpers.isFunction)(cb)) {
        throw new errors.InvalidArgumentError('callback should be of type "function"');
      }

      var method = 'GET';
      var query = "object-lock";
      this.makeRequest({
        method,
        bucketName,
        query
      }, '', [200], '', true, function (e, response) {
        if (e) return cb(e);
        var objectLockConfig = Buffer.from('');
        (0, _helpers.pipesetup)(response, transformers.objectLockTransformer()).on('data', function (data) {
          objectLockConfig = data;
        }).on('error', cb).on('end', function () {
          cb(null, objectLockConfig);
        });
      });
    }
  }, {
    key: "putObjectRetention",
    value: function putObjectRetention(bucketName, objectName) {
      var retentionOpts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var cb = arguments.length > 3 ? arguments[3] : undefined;

      if (!(0, _helpers.isValidBucketName)(bucketName)) {
        throw new errors.InvalidBucketNameError('Invalid bucket name: ' + bucketName);
      }

      if (!(0, _helpers.isValidObjectName)(objectName)) {
        throw new errors.InvalidObjectNameError(`Invalid object name: ${objectName}`);
      }

      if (!(0, _helpers.isObject)(retentionOpts)) {
        throw new errors.InvalidArgumentError('retentionOpts should be of type "object"');
      } else {
        if (retentionOpts.governanceBypass && !(0, _helpers.isBoolean)(retentionOpts.governanceBypass)) {
          throw new errors.InvalidArgumentError('Invalid value for governanceBypass', retentionOpts.governanceBypass);
        }

        if (retentionOpts.mode && ![_helpers.RETENTION_MODES.COMPLIANCE, _helpers.RETENTION_MODES.GOVERNANCE].includes(retentionOpts.mode)) {
          throw new errors.InvalidArgumentError('Invalid object retention mode ', retentionOpts.mode);
        }

        if (retentionOpts.retainUntilDate && !(0, _helpers.isString)(retentionOpts.retainUntilDate)) {
          throw new errors.InvalidArgumentError('Invalid value for retainUntilDate', retentionOpts.retainUntilDate);
        }

        if (retentionOpts.versionId && !(0, _helpers.isString)(retentionOpts.versionId)) {
          throw new errors.InvalidArgumentError('Invalid value for versionId', retentionOpts.versionId);
        }
      }

      if (!(0, _helpers.isFunction)(cb)) {
        throw new TypeError('callback should be of type "function"');
      }

      var method = 'PUT';
      var query = "retention";
      var headers = {};

      if (retentionOpts.governanceBypass) {
        headers["X-Amz-Bypass-Governance-Retention"] = true;
      }

      var builder = new _xml2js.default.Builder({
        rootName: 'Retention',
        renderOpts: {
          'pretty': false
        },
        headless: true
      });
      var params = {};

      if (retentionOpts.mode) {
        params.Mode = retentionOpts.mode;
      }

      if (retentionOpts.retainUntilDate) {
        params.RetainUntilDate = retentionOpts.retainUntilDate;
      }

      if (retentionOpts.versionId) {
        query += `&versionId=${retentionOpts.versionId}`;
      }

      var payload = builder.buildObject(params);
      headers['Content-MD5'] = (0, _helpers.toMd5)(payload);
      this.makeRequest({
        method,
        bucketName,
        objectName,
        query,
        headers
      }, payload, [200, 204], '', false, cb);
    }
  }, {
    key: "getObjectRetention",
    value: function getObjectRetention(bucketName, objectName, getOpts, cb) {
      if (!(0, _helpers.isValidBucketName)(bucketName)) {
        throw new errors.InvalidBucketNameError('Invalid bucket name: ' + bucketName);
      }

      if (!(0, _helpers.isValidObjectName)(objectName)) {
        throw new errors.InvalidObjectNameError(`Invalid object name: ${objectName}`);
      }

      if (!(0, _helpers.isObject)(getOpts)) {
        throw new errors.InvalidArgumentError('callback should be of type "object"');
      } else if (getOpts.versionId && !(0, _helpers.isString)(getOpts.versionId)) {
        throw new errors.InvalidArgumentError('VersionID should be of type "string"');
      }

      if (cb && !(0, _helpers.isFunction)(cb)) {
        throw new errors.InvalidArgumentError('callback should be of type "function"');
      }

      var method = 'GET';
      var query = "retention";

      if (getOpts.versionId) {
        query += `&versionId=${getOpts.versionId}`;
      }

      this.makeRequest({
        method,
        bucketName,
        objectName,
        query
      }, '', [200], '', true, function (e, response) {
        if (e) return cb(e);
        var retentionConfig = Buffer.from('');
        (0, _helpers.pipesetup)(response, transformers.objectRetentionTransformer()).on('data', function (data) {
          retentionConfig = data;
        }).on('error', cb).on('end', function () {
          cb(null, retentionConfig);
        });
      });
    }
  }, {
    key: "setBucketEncryption",
    value: function setBucketEncryption(bucketName, encryptionConfig, cb) {
      if (!(0, _helpers.isValidBucketName)(bucketName)) {
        throw new errors.InvalidBucketNameError('Invalid bucket name: ' + bucketName);
      }

      if ((0, _helpers.isFunction)(encryptionConfig)) {
        cb = encryptionConfig;
        encryptionConfig = null;
      }

      if (!_lodash.default.isEmpty(encryptionConfig) && encryptionConfig.Rule.length > 1) {
        throw new errors.InvalidArgumentError('Invalid Rule length. Only one rule is allowed.: ' + encryptionConfig.Rule);
      }

      if (cb && !(0, _helpers.isFunction)(cb)) {
        throw new TypeError('callback should be of type "function"');
      }

      var encryptionObj = encryptionConfig;

      if (_lodash.default.isEmpty(encryptionConfig)) {
        encryptionObj = {
          // Default MinIO Server Supported Rule
          Rule: [{
            ApplyServerSideEncryptionByDefault: {
              SSEAlgorithm: "AES256"
            }
          }]
        };
      }

      var method = 'PUT';
      var query = "encryption";
      var builder = new _xml2js.default.Builder({
        rootName: 'ServerSideEncryptionConfiguration',
        renderOpts: {
          'pretty': false
        },
        headless: true
      });
      var payload = builder.buildObject(encryptionObj);
      var headers = {};
      headers['Content-MD5'] = (0, _helpers.toMd5)(payload);
      this.makeRequest({
        method,
        bucketName,
        query,
        headers
      }, payload, [200], '', false, cb);
    }
  }, {
    key: "getBucketEncryption",
    value: function getBucketEncryption(bucketName, cb) {
      if (!(0, _helpers.isValidBucketName)(bucketName)) {
        throw new errors.InvalidBucketNameError('Invalid bucket name: ' + bucketName);
      }

      if (!(0, _helpers.isFunction)(cb)) {
        throw new errors.InvalidArgumentError('callback should be of type "function"');
      }

      var method = 'GET';
      var query = "encryption";
      this.makeRequest({
        method,
        bucketName,
        query
      }, '', [200], '', true, function (e, response) {
        if (e) return cb(e);
        var bucketEncConfig = Buffer.from('');
        (0, _helpers.pipesetup)(response, transformers.bucketEncryptionTransformer()).on('data', function (data) {
          bucketEncConfig = data;
        }).on('error', cb).on('end', function () {
          cb(null, bucketEncConfig);
        });
      });
    }
  }, {
    key: "removeBucketEncryption",
    value: function removeBucketEncryption(bucketName, cb) {
      if (!(0, _helpers.isValidBucketName)(bucketName)) {
        throw new errors.InvalidBucketNameError('Invalid bucket name: ' + bucketName);
      }

      if (!(0, _helpers.isFunction)(cb)) {
        throw new errors.InvalidArgumentError('callback should be of type "function"');
      }

      var method = 'DELETE';
      var query = "encryption";
      this.makeRequest({
        method,
        bucketName,
        query
      }, '', [204], '', false, cb);
    }
  }, {
    key: "setBucketReplication",
    value: function setBucketReplication(bucketName) {
      var replicationConfig = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var cb = arguments.length > 2 ? arguments[2] : undefined;

      if (!(0, _helpers.isValidBucketName)(bucketName)) {
        throw new errors.InvalidBucketNameError('Invalid bucket name: ' + bucketName);
      }

      if (!(0, _helpers.isObject)(replicationConfig)) {
        throw new errors.InvalidArgumentError('replicationConfig should be of type "object"');
      } else {
        if (_lodash.default.isEmpty(replicationConfig.role)) {
          throw new errors.InvalidArgumentError('Role cannot be empty');
        } else if (replicationConfig.role && !(0, _helpers.isString)(replicationConfig.role)) {
          throw new errors.InvalidArgumentError('Invalid value for role', replicationConfig.role);
        }

        if (_lodash.default.isEmpty(replicationConfig.rules)) {
          throw new errors.InvalidArgumentError('Minimum one replication rule must be specified');
        }
      }

      if (!(0, _helpers.isFunction)(cb)) {
        throw new TypeError('callback should be of type "function"');
      }

      var method = 'PUT';
      var query = "replication";
      var headers = {};
      var replicationParamsConfig = {
        ReplicationConfiguration: {
          Role: replicationConfig.role,
          Rule: replicationConfig.rules
        }
      };
      var builder = new _xml2js.default.Builder({
        renderOpts: {
          'pretty': false
        },
        headless: true
      });
      var payload = builder.buildObject(replicationParamsConfig);
      headers['Content-MD5'] = (0, _helpers.toMd5)(payload);
      this.makeRequest({
        method,
        bucketName,
        query,
        headers
      }, payload, [200], '', false, cb);
    }
  }, {
    key: "getBucketReplication",
    value: function getBucketReplication(bucketName, cb) {
      if (!(0, _helpers.isValidBucketName)(bucketName)) {
        throw new errors.InvalidBucketNameError('Invalid bucket name: ' + bucketName);
      }

      if (!(0, _helpers.isFunction)(cb)) {
        throw new errors.InvalidArgumentError('callback should be of type "function"');
      }

      var method = 'GET';
      var query = "replication";
      this.makeRequest({
        method,
        bucketName,
        query
      }, '', [200], '', true, function (e, response) {
        if (e) return cb(e);
        var replicationConfig = Buffer.from('');
        (0, _helpers.pipesetup)(response, transformers.replicationConfigTransformer()).on('data', function (data) {
          replicationConfig = data;
        }).on('error', cb).on('end', function () {
          cb(null, replicationConfig);
        });
      });
    }
  }, {
    key: "removeBucketReplication",
    value: function removeBucketReplication(bucketName, cb) {
      if (!(0, _helpers.isValidBucketName)(bucketName)) {
        throw new errors.InvalidBucketNameError('Invalid bucket name: ' + bucketName);
      }

      var method = 'DELETE';
      var query = "replication";
      this.makeRequest({
        method,
        bucketName,
        query
      }, '', [200, 204], '', false, cb);
    }
  }, {
    key: "getObjectLegalHold",
    value: function getObjectLegalHold(bucketName, objectName) {
      var getOpts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var cb = arguments.length > 3 ? arguments[3] : undefined;

      if (!(0, _helpers.isValidBucketName)(bucketName)) {
        throw new errors.InvalidBucketNameError('Invalid bucket name: ' + bucketName);
      }

      if (!(0, _helpers.isValidObjectName)(objectName)) {
        throw new errors.InvalidObjectNameError(`Invalid object name: ${objectName}`);
      }

      if ((0, _helpers.isFunction)(getOpts)) {
        cb = getOpts;
        getOpts = {};
      }

      if (!(0, _helpers.isObject)(getOpts)) {
        throw new TypeError('getOpts should be of type "Object"');
      } else if (Object.keys(getOpts).length > 0 && getOpts.versionId && !(0, _helpers.isString)(getOpts.versionId)) {
        throw new TypeError('versionId should be of type string.:', getOpts.versionId);
      }

      if (!(0, _helpers.isFunction)(cb)) {
        throw new errors.InvalidArgumentError('callback should be of type "function"');
      }

      var method = 'GET';
      var query = "legal-hold";

      if (getOpts.versionId) {
        query += `&versionId=${getOpts.versionId}`;
      }

      this.makeRequest({
        method,
        bucketName,
        objectName,
        query
      }, '', [200], '', true, function (e, response) {
        if (e) return cb(e);
        var legalHoldConfig = Buffer.from('');
        (0, _helpers.pipesetup)(response, transformers.objectLegalHoldTransformer()).on('data', function (data) {
          legalHoldConfig = data;
        }).on('error', cb).on('end', function () {
          cb(null, legalHoldConfig);
        });
      });
    }
  }, {
    key: "setObjectLegalHold",
    value: function setObjectLegalHold(bucketName, objectName) {
      var setOpts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var cb = arguments.length > 3 ? arguments[3] : undefined;

      if (!(0, _helpers.isValidBucketName)(bucketName)) {
        throw new errors.InvalidBucketNameError('Invalid bucket name: ' + bucketName);
      }

      if (!(0, _helpers.isValidObjectName)(objectName)) {
        throw new errors.InvalidObjectNameError(`Invalid object name: ${objectName}`);
      }

      var defaultOpts = {
        status: _helpers.LEGAL_HOLD_STATUS.ENABLED
      };

      if ((0, _helpers.isFunction)(setOpts)) {
        cb = setOpts;
        setOpts = defaultOpts;
      }

      if (!(0, _helpers.isObject)(setOpts)) {
        throw new TypeError('setOpts should be of type "Object"');
      } else {
        if (![_helpers.LEGAL_HOLD_STATUS.ENABLED, _helpers.LEGAL_HOLD_STATUS.DISABLED].includes(setOpts.status)) {
          throw new TypeError('Invalid status: ' + setOpts.status);
        }

        if (setOpts.versionId && !setOpts.versionId.length) {
          throw new TypeError('versionId should be of type string.:' + setOpts.versionId);
        }
      }

      if (!(0, _helpers.isFunction)(cb)) {
        throw new errors.InvalidArgumentError('callback should be of type "function"');
      }

      if (_lodash.default.isEmpty(setOpts)) {
        setOpts = {
          defaultOpts
        };
      }

      var method = 'PUT';
      var query = "legal-hold";

      if (setOpts.versionId) {
        query += `&versionId=${setOpts.versionId}`;
      }

      var config = {
        Status: setOpts.status
      };
      var builder = new _xml2js.default.Builder({
        rootName: 'LegalHold',
        renderOpts: {
          'pretty': false
        },
        headless: true
      });
      var payload = builder.buildObject(config);
      var headers = {};
      headers['Content-MD5'] = (0, _helpers.toMd5)(payload);
      this.makeRequest({
        method,
        bucketName,
        objectName,
        query,
        headers
      }, payload, [200], '', false, cb);
    }
    /**
       * Internal Method to abort a multipart upload request in case of any errors.
       * @param bucketName __string__ Bucket Name
       * @param objectName __string__ Object Name
       * @param uploadId __string__ id of a multipart upload to cancel during compose object sequence.
       * @param cb __function__ callback function
       */

  }, {
    key: "abortMultipartUpload",
    value: function abortMultipartUpload(bucketName, objectName, uploadId, cb) {
      var method = 'DELETE';
      var query = `uploadId=${uploadId}`;
      var requestOptions = {
        method,
        bucketName,
        objectName: objectName,
        query
      };
      this.makeRequest(requestOptions, '', [204], '', false, cb);
    }
    /**
       * Internal method to upload a part during compose object.
       * @param partConfig __object__ contains the following.
       *    bucketName __string__
       *    objectName __string__
       *    uploadID __string__
       *    partNumber __number__
       *    headers __object__
       * @param cb called with null incase of error.
       */

  }, {
    key: "uploadPartCopy",
    value: function uploadPartCopy(partConfig, cb) {
      var bucketName = partConfig.bucketName,
          objectName = partConfig.objectName,
          uploadID = partConfig.uploadID,
          partNumber = partConfig.partNumber,
          headers = partConfig.headers;
      var method = 'PUT';
      var query = `uploadId=${uploadID}&partNumber=${partNumber}`;
      var requestOptions = {
        method,
        bucketName,
        objectName: objectName,
        query,
        headers
      };
      return this.makeRequest(requestOptions, '', [200], '', true, function (e, response) {
        var partCopyResult = Buffer.from('');
        if (e) return cb(e);
        (0, _helpers.pipesetup)(response, transformers.uploadPartTransformer()).on('data', function (data) {
          partCopyResult = data;
        }).on('error', cb).on('end', function () {
          var uploadPartCopyRes = {
            etag: (0, _helpers.sanitizeETag)(partCopyResult.ETag),
            key: objectName,
            part: partNumber
          };
          cb(null, uploadPartCopyRes);
        });
      });
    }
  }, {
    key: "composeObject",
    value: function composeObject() {
      var _this17 = this;

      var destObjConfig = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var sourceObjList = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      var cb = arguments.length > 2 ? arguments[2] : undefined;
      var me = this; // many async flows. so store the ref.

      var sourceFilesLength = sourceObjList.length;

      if (!(0, _helpers.isArray)(sourceObjList)) {
        throw new errors.InvalidArgumentError('sourceConfig should an array of CopySourceOptions ');
      }

      if (!(destObjConfig instanceof _helpers.CopyDestinationOptions)) {
        throw new errors.InvalidArgumentError('destConfig should of type CopyDestinationOptions ');
      }

      if (sourceFilesLength < 1 || sourceFilesLength > _helpers.PART_CONSTRAINTS.MAX_PARTS_COUNT) {
        throw new errors.InvalidArgumentError(`"There must be as least one and up to ${_helpers.PART_CONSTRAINTS.MAX_PARTS_COUNT} source objects.`);
      }

      if (!(0, _helpers.isFunction)(cb)) {
        throw new TypeError('callback should be of type "function"');
      }

      for (var i = 0; i < sourceFilesLength; i++) {
        if (!sourceObjList[i].validate()) {
          return false;
        }
      }

      if (!destObjConfig.validate()) {
        return false;
      }

      var getStatOptions = function getStatOptions(srcConfig) {
        return {
          versionId: srcConfig.VersionID
        };
      };

      var srcObjectSizes = [];
      var totalSize = 0;
      var totalParts = 0;
      var sourceObjStats = sourceObjList.map(function (srcItem) {
        return me.statObject(srcItem.Bucket, srcItem.Object, getStatOptions(srcItem));
      });
      return Promise.all(sourceObjStats).then(function (srcObjectInfos) {
        var validatedStats = srcObjectInfos.map(function (resItemStat, index) {
          var srcConfig = sourceObjList[index];
          var srcCopySize = resItemStat.size; // Check if a segment is specified, and if so, is the
          // segment within object bounds?

          if (srcConfig.MatchRange) {
            // Since range is specified,
            //    0 <= src.srcStart <= src.srcEnd
            // so only invalid case to check is:
            var srcStart = srcConfig.Start;
            var srcEnd = srcConfig.End;

            if (srcEnd >= srcCopySize || srcStart < 0) {
              throw new errors.InvalidArgumentError(`CopySrcOptions ${index} has invalid segment-to-copy [${srcStart}, ${srcEnd}] (size is ${srcCopySize})`);
            }

            srcCopySize = srcEnd - srcStart + 1;
          } // Only the last source may be less than `absMinPartSize`


          if (srcCopySize < _helpers.PART_CONSTRAINTS.ABS_MIN_PART_SIZE && index < sourceFilesLength - 1) {
            throw new errors.InvalidArgumentError(`CopySrcOptions ${index} is too small (${srcCopySize}) and it is not the last part.`);
          } // Is data to copy too large?


          totalSize += srcCopySize;

          if (totalSize > _helpers.PART_CONSTRAINTS.MAX_MULTIPART_PUT_OBJECT_SIZE) {
            throw new errors.InvalidArgumentError(`Cannot compose an object of size ${totalSize} (> 5TiB)`);
          } // record source size


          srcObjectSizes[index] = srcCopySize; // calculate parts needed for current source

          totalParts += (0, _helpers.partsRequired)(srcCopySize); // Do we need more parts than we are allowed?

          if (totalParts > _helpers.PART_CONSTRAINTS.MAX_PARTS_COUNT) {
            throw new errors.InvalidArgumentError(`Your proposed compose object requires more than ${_helpers.PART_CONSTRAINTS.MAX_PARTS_COUNT} parts`);
          }

          return resItemStat;
        });

        if (totalParts === 1 && totalSize <= _helpers.PART_CONSTRAINTS.MAX_PART_SIZE || totalSize === 0) {
          return _this17.copyObject(sourceObjList[0], destObjConfig, cb); // use copyObjectV2
        } // preserve etag to avoid modification of object while copying.


        for (var _i2 = 0; _i2 < sourceFilesLength; _i2++) {
          sourceObjList[_i2].MatchETag = validatedStats[_i2].etag;
        }

        var splitPartSizeList = validatedStats.map(function (resItemStat, idx) {
          var calSize = (0, _helpers.calculateEvenSplits)(srcObjectSizes[idx], sourceObjList[idx]);
          return calSize;
        });

        function getUploadPartConfigList(uploadId) {
          var uploadPartConfigList = [];
          splitPartSizeList.forEach(function (splitSize, splitIndex) {
            var startIdx = splitSize.startIndex,
                endIdx = splitSize.endIndex,
                objConfig = splitSize.objInfo;
            var partIndex = splitIndex + 1; // part index starts from 1.

            var totalUploads = Array.from(startIdx);
            var headers = sourceObjList[splitIndex].getHeaders();
            totalUploads.forEach(function (splitStart, upldCtrIdx) {
              var splitEnd = endIdx[upldCtrIdx];
              var sourceObj = `${objConfig.Bucket}/${objConfig.Object}`;
              headers['x-amz-copy-source'] = `${sourceObj}`;
              headers["x-amz-copy-source-range"] = `bytes=${splitStart}-${splitEnd}`;
              var uploadPartConfig = {
                bucketName: destObjConfig.Bucket,
                objectName: destObjConfig.Object,
                uploadID: uploadId,
                partNumber: partIndex,
                headers: headers,
                sourceObj: sourceObj
              };
              uploadPartConfigList.push(uploadPartConfig);
            });
          });
          return uploadPartConfigList;
        }

        var performUploadParts = function performUploadParts(uploadId) {
          var uploadList = getUploadPartConfigList(uploadId);

          _async.default.map(uploadList, me.uploadPartCopy.bind(me), function (err, res) {
            if (err) {
              return _this17.abortMultipartUpload(destObjConfig.Bucket, destObjConfig.Object, uploadId, cb);
            }

            var partsDone = res.map(function (partCopy) {
              return {
                etag: partCopy.etag,
                part: partCopy.part
              };
            });
            return me.completeMultipartUpload(destObjConfig.Bucket, destObjConfig.Object, uploadId, partsDone, cb);
          });
        };

        var newUploadHeaders = destObjConfig.getHeaders();
        me.initiateNewMultipartUpload(destObjConfig.Bucket, destObjConfig.Object, newUploadHeaders, function (err, uploadId) {
          if (err) {
            return cb(err, null);
          }

          performUploadParts(uploadId);
        });
      }).catch(function (error) {
        cb(error, null);
      });
    }
  }, {
    key: "extensions",
    get: function get() {
      if (!this.clientExtensions) {
        this.clientExtensions = new _extensions.default(this);
      }

      return this.clientExtensions;
    }
  }]);

  return Client;
}(); // Promisify various public-facing APIs on the Client module.


exports.Client = Client;
Client.prototype.makeBucket = (0, _helpers.promisify)(Client.prototype.makeBucket);
Client.prototype.listBuckets = (0, _helpers.promisify)(Client.prototype.listBuckets);
Client.prototype.bucketExists = (0, _helpers.promisify)(Client.prototype.bucketExists);
Client.prototype.removeBucket = (0, _helpers.promisify)(Client.prototype.removeBucket);
Client.prototype.getObject = (0, _helpers.promisify)(Client.prototype.getObject);
Client.prototype.getPartialObject = (0, _helpers.promisify)(Client.prototype.getPartialObject);
Client.prototype.fGetObject = (0, _helpers.promisify)(Client.prototype.fGetObject);
Client.prototype.putObject = (0, _helpers.promisify)(Client.prototype.putObject);
Client.prototype.fPutObject = (0, _helpers.promisify)(Client.prototype.fPutObject);
Client.prototype.copyObject = (0, _helpers.promisify)(Client.prototype.copyObject);
Client.prototype.statObject = (0, _helpers.promisify)(Client.prototype.statObject);
Client.prototype.removeObject = (0, _helpers.promisify)(Client.prototype.removeObject);
Client.prototype.removeObjects = (0, _helpers.promisify)(Client.prototype.removeObjects);
Client.prototype.presignedUrl = (0, _helpers.promisify)(Client.prototype.presignedUrl);
Client.prototype.presignedGetObject = (0, _helpers.promisify)(Client.prototype.presignedGetObject);
Client.prototype.presignedPutObject = (0, _helpers.promisify)(Client.prototype.presignedPutObject);
Client.prototype.presignedPostPolicy = (0, _helpers.promisify)(Client.prototype.presignedPostPolicy);
Client.prototype.getBucketNotification = (0, _helpers.promisify)(Client.prototype.getBucketNotification);
Client.prototype.setBucketNotification = (0, _helpers.promisify)(Client.prototype.setBucketNotification);
Client.prototype.removeAllBucketNotification = (0, _helpers.promisify)(Client.prototype.removeAllBucketNotification);
Client.prototype.getBucketPolicy = (0, _helpers.promisify)(Client.prototype.getBucketPolicy);
Client.prototype.setBucketPolicy = (0, _helpers.promisify)(Client.prototype.setBucketPolicy);
Client.prototype.removeIncompleteUpload = (0, _helpers.promisify)(Client.prototype.removeIncompleteUpload);
Client.prototype.getBucketVersioning = (0, _helpers.promisify)(Client.prototype.getBucketVersioning);
Client.prototype.setBucketVersioning = (0, _helpers.promisify)(Client.prototype.setBucketVersioning);
Client.prototype.setBucketTagging = (0, _helpers.promisify)(Client.prototype.setBucketTagging);
Client.prototype.removeBucketTagging = (0, _helpers.promisify)(Client.prototype.removeBucketTagging);
Client.prototype.getBucketTagging = (0, _helpers.promisify)(Client.prototype.getBucketTagging);
Client.prototype.setObjectTagging = (0, _helpers.promisify)(Client.prototype.setObjectTagging);
Client.prototype.removeObjectTagging = (0, _helpers.promisify)(Client.prototype.removeObjectTagging);
Client.prototype.getObjectTagging = (0, _helpers.promisify)(Client.prototype.getObjectTagging);
Client.prototype.setBucketLifecycle = (0, _helpers.promisify)(Client.prototype.setBucketLifecycle);
Client.prototype.getBucketLifecycle = (0, _helpers.promisify)(Client.prototype.getBucketLifecycle);
Client.prototype.removeBucketLifecycle = (0, _helpers.promisify)(Client.prototype.removeBucketLifecycle);
Client.prototype.setObjectLockConfig = (0, _helpers.promisify)(Client.prototype.setObjectLockConfig);
Client.prototype.getObjectLockConfig = (0, _helpers.promisify)(Client.prototype.getObjectLockConfig);
Client.prototype.putObjectRetention = (0, _helpers.promisify)(Client.prototype.putObjectRetention);
Client.prototype.getObjectRetention = (0, _helpers.promisify)(Client.prototype.getObjectRetention);
Client.prototype.setBucketEncryption = (0, _helpers.promisify)(Client.prototype.setBucketEncryption);
Client.prototype.getBucketEncryption = (0, _helpers.promisify)(Client.prototype.getBucketEncryption);
Client.prototype.removeBucketEncryption = (0, _helpers.promisify)(Client.prototype.removeBucketEncryption);
Client.prototype.setBucketReplication = (0, _helpers.promisify)(Client.prototype.setBucketReplication);
Client.prototype.getBucketReplication = (0, _helpers.promisify)(Client.prototype.getBucketReplication);
Client.prototype.removeBucketReplication = (0, _helpers.promisify)(Client.prototype.removeBucketReplication);
Client.prototype.setObjectLegalHold = (0, _helpers.promisify)(Client.prototype.setObjectLegalHold);
Client.prototype.getObjectLegalHold = (0, _helpers.promisify)(Client.prototype.getObjectLegalHold);
Client.prototype.composeObject = (0, _helpers.promisify)(Client.prototype.composeObject);

var CopyConditions = /*#__PURE__*/function () {
  function CopyConditions() {
    _classCallCheck(this, CopyConditions);

    this.modified = "";
    this.unmodified = "";
    this.matchETag = "";
    this.matchETagExcept = "";
  }

  _createClass(CopyConditions, [{
    key: "setModified",
    value: function setModified(date) {
      if (!(date instanceof Date)) throw new TypeError('date must be of type Date');
      this.modified = date.toUTCString();
    }
  }, {
    key: "setUnmodified",
    value: function setUnmodified(date) {
      if (!(date instanceof Date)) throw new TypeError('date must be of type Date');
      this.unmodified = date.toUTCString();
    }
  }, {
    key: "setMatchETag",
    value: function setMatchETag(etag) {
      this.matchETag = etag;
    }
  }, {
    key: "setMatchETagExcept",
    value: function setMatchETagExcept(etag) {
      this.matchETagExcept = etag;
    }
  }]);

  return CopyConditions;
}(); // Build PostPolicy object that can be signed by presignedPostPolicy


exports.CopyConditions = CopyConditions;

var PostPolicy = /*#__PURE__*/function () {
  function PostPolicy() {
    _classCallCheck(this, PostPolicy);

    this.policy = {
      conditions: []
    };
    this.formData = {};
  } // set expiration date


  _createClass(PostPolicy, [{
    key: "setExpires",
    value: function setExpires(date) {
      if (!date) {
        throw new errors.InvalidDateError('Invalid date : cannot be null');
      }

      this.policy.expiration = date.toISOString();
    } // set object name

  }, {
    key: "setKey",
    value: function setKey(objectName) {
      if (!(0, _helpers.isValidObjectName)(objectName)) {
        throw new errors.InvalidObjectNameError(`Invalid object name : ${objectName}`);
      }

      this.policy.conditions.push(['eq', '$key', objectName]);
      this.formData.key = objectName;
    } // set object name prefix, i.e policy allows any keys with this prefix

  }, {
    key: "setKeyStartsWith",
    value: function setKeyStartsWith(prefix) {
      if (!(0, _helpers.isValidPrefix)(prefix)) {
        throw new errors.InvalidPrefixError(`Invalid prefix : ${prefix}`);
      }

      this.policy.conditions.push(['starts-with', '$key', prefix]);
      this.formData.key = prefix;
    } // set bucket name

  }, {
    key: "setBucket",
    value: function setBucket(bucketName) {
      if (!(0, _helpers.isValidBucketName)(bucketName)) {
        throw new errors.InvalidBucketNameError(`Invalid bucket name : ${bucketName}`);
      }

      this.policy.conditions.push(['eq', '$bucket', bucketName]);
      this.formData.bucket = bucketName;
    } // set Content-Type

  }, {
    key: "setContentType",
    value: function setContentType(type) {
      if (!type) {
        throw new Error('content-type cannot be null');
      }

      this.policy.conditions.push(['eq', '$Content-Type', type]);
      this.formData['Content-Type'] = type;
    } // set minimum/maximum length of what Content-Length can be.

  }, {
    key: "setContentLengthRange",
    value: function setContentLengthRange(min, max) {
      if (min > max) {
        throw new Error('min cannot be more than max');
      }

      if (min < 0) {
        throw new Error('min should be > 0');
      }

      if (max < 0) {
        throw new Error('max should be > 0');
      }

      this.policy.conditions.push(['content-length-range', min, max]);
    }
  }]);

  return PostPolicy;
}();

exports.PostPolicy = PostPolicy;
//# sourceMappingURL=minio.js.map
