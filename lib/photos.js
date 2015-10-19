/**
 * Created by Feng OuYang on 2014-07-08.
 */
var fs = require("fs");
var crypto = require('crypto');
var node_util = require('util');

var util = require('./util.js');
var err_const = require('./error.js');

var base_photos = process.argv[3];


function list_photos(req, res, params) {

    if (params.value) {
        var dir = base_photos + params.value;
        fs.readdir(dir, function (err, files) {

            if (err) {
                util.result_client(req, res, err_const.err_500);
            } else {
                var file_array = [];

                files.forEach(function (f) {
                    var once = new Object();
                    once.name = f;
                    once.first = get_max_date(base_photos + "/" + f, "/" + f);
                    file_array.push(once);
                });

                var result = new Object();
                result.data = file_array;
                util.result_client(req, res, result);
            }


        });
    } else {
        util.result_client(req, res, err_const.err_400);
    }

}

exports.list_photos = list_photos;

/**
 * 返回当前目录的子目录以及文件
 */
function list_dir(params) {

    var result = new com.web_result();
    if (params.value) {
        //如果客户端传来的数据没有加/,自动加上
        if (params.value.substring(params.value.length - 1) != '/') {
            params.value = params.value + '/';
        }
        var dir = base_photos + params.value;

        var array_files = list_dir_files(dir, params.value);

        //有按页加载
        if (params.skip != undefined) {

            if (array_files.length >= params.skip) {
                var page_array = [];
                for (var i = params.skip; i < array_files.length; i++) {

                    page_array.push(array_files[i]);

                    if (params.num != undefined && (i - params.skip == (params.num - 1) )) {

                        result.data = page_array;
                        if (i < array_files.length - 1) {
                            result.more = true;
                        }
                        return result;
                    }

                }
                result.data = page_array;
                result.more = false;

            } else {
                result.data = [];
                result.more = false;
            }

        } else {
            result.data = array_files;
        }

    }
    return result;
}

exports.list_dir = list_dir;

/**
 * 保存文件
 * @param req
 * @param res
 * @returns {Result}
 */
function save_photos(req, res, params) {

    var result = new com.web_result();
    if (!params.value) {
        util.error('require save path');
        result.error = err_const.err_400;
    } else {
        var save_dir = base_photos + params.value;
        if (save_dir.substring(save_dir.length - 1) != '/') {
            save_dir = save_dir + '/';
        }
        // parse a file upload
        var form = new formidable.IncomingForm();
        form.encoding = 'utf-8';
        form.uploadDir = save_dir;

        form.parse(req, function (err, fields, files) {

            // util.debug(files);
            if (fields.file_list) {
                var renamefiles = JSON.parse(fields.file_list);
                renamefiles.forEach(function (name) {

                    fs.rename(files[name].path, save_dir + name);
                    util.debug("rename " + files[name].path + " to " + save_dir + name);
                    gen_thumbnailpic(save_dir + name);

                });
                result.data = renamefiles;

            } else {
                util.error('not found files!');
                result.error = err_const.err_400;
            }
            util.result_client(req, res, result);

        });
    }

    return result;
}

exports.save_photos = save_photos;


/**
 * 新建文件夹
 * @param params
 * @returns {exports.web_result}
 */
function new_photos(req, res, params) {

    var result = new com.web_result();
    var path = base_photos + params.value;
    fs.mkdir(path, function () {

        result.data = path;
        util.debug('new photos:' + path);
        util.result_client(req, res, result);

    });

}

exports.new_photos = new_photos;

/**
 * 取得相册最后上传的一张图片
 * @param dir
 * @param base
 * @returns {*}
 */
function get_max_date(dir, base) {

    var files = fs.readdirSync(dir);

    var max_date = new Object();

    var num = files.length;
    max_date.num = num;

    if (num > 0) {
		for (var i = 0; i < num; i++) {
			if (util.is_pic(files[i])) {
				max_date.path = base + "/" + files[i];
				break;
			}
		}
    }

    return max_date;
}


function read_album_res(req, res, tofile, gm) {

    util.debug("read_album_res file:" + tofile);

    if (gm) {
        var date = new Date().toTimeString();
        var b = new Buffer(date);
        var s = b.toString('base64');
        res.setHeader("ETag", s);
        res.setHeader("Last-Modified", date);
    }
    fs.readFile(tofile, "binary", function (err, file) {
        if (err) {
            res.writeHead(500, {
                'Content-Type': 'text/plain'
            });
            res.end(err.toString());
        } else {
            res.writeHead(200, {
                'Content-Type': 'image/jpeg'
            });
            res.write(file, "binary");
            res.end();
        }
    });
}

/**
 * 取缩略图服务
 * @param req
 * @param res
 * @param param
 */
function get_pic_albume(req, res, param) {

    var file = new Buffer(param.file, 'base64');
    var w = param.w;
    var h = param.h;
    var md5 = crypto.createHash('md5');
    md5.update(node_util.format("%s_%s_%s", file, w, h));
    var tofile = img_cache + "/" + md5.digest('hex') + ".jpg";
    util.debug("tofile:" + tofile);
    if (!fs.existsSync(tofile)) {
        util.debug("get pic gm rezie");
        try {
            gm(base_photos + file)
                .resize(w, h)
                .write(tofile, function (err) {

                    if (err) {
                        res.writeHead(500, {
                            'Content-Type': 'text/plain'
                        });
                        res.end(err.toString());
                    } else {
                        //rezie成功
                        util.debug("get pic gm rezie success");
                        read_album_res(req, res, tofile, true);
                    }

                });
        } catch (error) {
            res.writeHead(500, {
                'Content-Type': 'text/plain'
            });
            res.end(err.toString());
        }
    } else {
        util.debug("get pic not gm rezie");
        read_album_res(req, res, tofile);
    }


}

exports.get_pic_albume = get_pic_albume;

/**
 * 取相册里所有图片
 * @param req
 * @param res
 * @param param
 */
function get_album_pics(req, res, params) {

    var result = new Object();
    if (params.value) {
        //如果客户端传来的数据没有加/,自动加上
        if (params.value.substring(params.value.length - 1) != '/') {
            params.value = params.value + '/';
        }
        var dir = base_photos + "/" + params.value;

        console.log("get_album_pics dir:" + dir);
        fs.readdir(dir, function (err, files) {

            if (err) {
                util.result_client(req, res, err_const.err_500);
            } else {
                result.data = files;
                util.result_client(req, res, result);
            }


        });
    } else {
        util.result_client(req, res, err_const.err_400);
    }

}

exports.get_album_pics = get_album_pics;
