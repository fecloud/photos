/**
 * Created by ouyangfeng on 10/17/15.
 */
var util = require('./util.js');

var All = 0;
var VERBOSE = 1;
var DEBUG = 2;
var INFO = 3;
var WARN = 4;
var ERROR = 5;

/*全局日志配置*/
var LEVEL = All;

function log(level, message) {

    if (level >= LEVEL) {
        var msg = util.format_time();
        switch (level) {
            case VERBOSE:
                msg += " [VERBOSE] :";
                msg += message;
                console.log(msg);
                break;
            case DEBUG:
                msg += " [DEBUG] :";
                msg += message;
                console.log(msg);
                break;
            case INFO:
                msg += " [INFO] :";
                msg += message;
                console.info(msg);
                break;
            case WARN:
                msg += " [WARN] :";
                msg += message;
                console.warn(msg);
                break;
            case ERROR:
                msg += " [ERROR] :";
                msg += message;
                console.error(message);
                break;
        }
    }
};

function v(message) {
    log(VERBOSE, message);
};

exports.v = v;

function d(message) {
    log(DEBUG, message);
};

exports.d = d;

function i(message) {
    log(WARN, message);
};

exports.i = i;

function w(message) {
    log(WARN, message);
};

exports.w = w;

function e(message) {
    log(ERROR, message);
};

exports.e = e;
