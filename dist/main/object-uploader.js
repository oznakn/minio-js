"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _stream = require("stream");

var _crypto = _interopRequireDefault(require("crypto"));

var querystring = _interopRequireWildcard(require("querystring"));

var _helpers = require("./helpers");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (typeof call === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

// We extend Transform because Writable does not implement ._flush().
var ObjectUploader = /*#__PURE__*/function (_Transform) {
  _inherits(ObjectUploader, _Transform);

  var _super = _createSuper(ObjectUploader);

  function ObjectUploader(client, bucketName, objectName, partSize, metaData, callback) {
    var _this;

    _classCallCheck(this, ObjectUploader);

    _this = _super.call(this);
    _this.emptyStream = true;
    _this.client = client;
    _this.bucketName = bucketName;
    _this.objectName = objectName; // The size of each multipart, chunked by BlockStream2.

    _this.partSize = partSize; // This is the metadata for the object.

    _this.metaData = metaData; // Call like: callback(error, {etag, versionId}).

    _this.callback = callback; // We need to keep track of what number chunk/part we're on. This increments
    // each time _write() is called. Starts with 1, not 0.

    _this.partNumber = 1; // A list of the previously uploaded chunks, for resuming a file upload. This
    // will be null if we aren't resuming an upload.

    _this.oldParts = null; // Keep track of the etags for aggregating the chunks together later. Each
    // etag represents a single chunk of the file.

    _this.etags = []; // This is for the multipart upload request — if null, we're either not initiated
    // yet or we're flushing in one packet.

    _this.id = null; // Handle errors.

    _this.on('error', function (err) {
      callback(err);
    });

    return _this;
  }

  _createClass(ObjectUploader, [{
    key: "_transform",
    value: function _transform(chunk, encoding, callback) {
      var _this2 = this;

      this.emptyStream = false;
      var method = 'PUT';
      var headers = {
        'Content-Length': chunk.length
      };
      var md5digest = ''; // Calculate and set Content-MD5 header if SHA256 is not set.
      // This will happen only when there is a secure connection to the s3 server.

      if (!this.client.enableSHA256) {
        md5digest = _crypto.default.createHash('md5').update(chunk).digest();
        headers['Content-MD5'] = md5digest.toString('base64');
      } // We can flush the object in one packet if it fits in one chunk. This is true
      // if the chunk size is smaller than the part size, signifying the end of the
      // stream.


      if (this.partNumber == 1 && chunk.length < this.partSize) {
        // PUT the chunk in a single request — use an empty query.
        var _options = {
          method,
          // Set user metadata as this is not a multipart upload
          headers: Object.assign({}, this.metaData, headers),
          query: '',
          bucketName: this.bucketName,
          objectName: this.objectName
        };
        this.client.makeRequest(_options, chunk, [200], '', true, function (err, response) {
          if (err) return callback(err);
          var result = {
            etag: (0, _helpers.sanitizeETag)(response.headers.etag),
            versionId: (0, _helpers.getVersionId)(response.headers)
          }; // Ignore the 'data' event so that the stream closes. (nodejs stream requirement)

          response.on('data', function () {}); // Give the etag back, we're done!

          process.nextTick(function () {
            _this2.callback(null, result);
          }); // Because we're sure the stream has ended, allow it to flush and end.

          callback();
        });
        return;
      } // If we aren't flushing in one packet, we need to initiate the multipart upload,
      // if it hasn't already been done. The write will be buffered until the upload has been
      // initiated.


      if (this.id === null) {
        this.once('ready', function () {
          _this2._transform(chunk, encoding, callback);
        }); // Check for an incomplete previous upload.

        this.client.findUploadId(this.bucketName, this.objectName, function (err, id) {
          if (err) return _this2.emit('error', err); // If no upload ID exists, initiate a new one.

          if (!id) {
            _this2.client.initiateNewMultipartUpload(_this2.bucketName, _this2.objectName, _this2.metaData, function (err, id) {
              if (err) return callback(err);
              _this2.id = id; // We are now ready to accept new chunks — this will flush the buffered chunk.

              _this2.emit('ready');
            });

            return;
          }

          _this2.id = id; // Retrieve the pre-uploaded parts, if we need to resume the upload.

          _this2.client.listParts(_this2.bucketName, _this2.objectName, id, function (err, etags) {
            if (err) return _this2.emit('error', err); // It is possible for no parts to be already uploaded.

            if (!etags) etags = []; // oldParts will become an object, allowing oldParts[partNumber].etag

            _this2.oldParts = etags.reduce(function (prev, item) {
              if (!prev[item.part]) {
                prev[item.part] = item;
              }

              return prev;
            }, {});

            _this2.emit('ready');
          });
        });
        return;
      } // Continue uploading various parts if we have initiated multipart upload.


      var partNumber = this.partNumber++; // Check to see if we've already uploaded this chunk. If the hash sums match,
      // we can skip to the next chunk.

      if (this.oldParts) {
        var oldPart = this.oldParts[partNumber]; // Calulcate the md5 hash, if it has not already been calculated.

        if (!md5digest) {
          md5digest = _crypto.default.createHash('md5').update(chunk).digest();
        }

        if (oldPart && md5digest.toString('hex') === oldPart.etag) {
          // The md5 matches, the chunk has already been uploaded.
          this.etags.push({
            part: partNumber,
            etag: oldPart.etag
          });
          callback();
          return;
        }
      } // Write the chunk with an uploader.


      var query = querystring.stringify({
        partNumber: partNumber,
        uploadId: this.id
      });
      var options = {
        method,
        query,
        headers,
        bucketName: this.bucketName,
        objectName: this.objectName
      };
      this.client.makeRequest(options, chunk, [200], '', true, function (err, response) {
        if (err) return callback(err); // In order to aggregate the parts together, we need to collect the etags.

        var etag = response.headers.etag;
        if (etag) etag = etag.replace(/^"/, '').replace(/"$/, '');

        _this2.etags.push({
          part: partNumber,
          etag
        }); // Ignore the 'data' event so that the stream closes. (nodejs stream requirement)


        response.on('data', function () {}); // We're ready for the next chunk.

        callback();
      });
    }
  }, {
    key: "_flush",
    value: function _flush(callback) {
      var _this3 = this;

      if (this.emptyStream) {
        var method = 'PUT';
        var headers = Object.assign({}, this.metaData, {
          'Content-Length': 0
        });
        var options = {
          method,
          headers,
          query: '',
          bucketName: this.bucketName,
          objectName: this.objectName
        };
        this.client.makeRequest(options, '', [200], '', true, function (err, response) {
          if (err) return callback(err);
          var result = {
            etag: (0, _helpers.sanitizeETag)(response.headers.etag),
            versionId: (0, _helpers.getVersionId)(response.headers)
          }; // Ignore the 'data' event so that the stream closes. (nodejs stream requirement)

          response.on('data', function () {}); // Give the etag back, we're done!

          process.nextTick(function () {
            _this3.callback(null, result);
          }); // Because we're sure the stream has ended, allow it to flush and end.

          callback();
        });
        return;
      } // If it has been uploaded in a single packet, we don't have to do anything.


      if (this.id === null) {
        return;
      } // This is called when all of the chunks uploaded successfully, thus
      // completing the multipart upload.


      this.client.completeMultipartUpload(this.bucketName, this.objectName, this.id, this.etags, function (err, etag) {
        if (err) return callback(err); // Call our callback on the next tick to allow the streams infrastructure
        // to finish what its doing before we continue.

        process.nextTick(function () {
          _this3.callback(null, etag);
        });
        callback();
      });
    }
  }]);

  return ObjectUploader;
}(_stream.Transform);

exports.default = ObjectUploader;
//# sourceMappingURL=object-uploader.js.map
