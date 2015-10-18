/**
 * Created with JetBrains WebStorm.
 * User: ouyangfeng
 * Date: 7/15/14
 * Time: 22:37
 * To change this template use File | Settings | File Templates.
 */
var util = require('./util.js');
var log = require('./log.js');
var photos = require('./photos.js');

var route = {};

route.list_photos = function (req, res, params) {

    photos.list_photos(req, res, params);

};

route.delete_phots = function (req, res, params) {

    util.result_client(req, res, filemanager.delete_file(params));

};

route.new_photos = function (req, res, params) {

    photos.new_photos(req,res,params);

};

route.save_photos = function (req, res, params) {
    photos.save_photos(req, res, params);

};

route.rename_photos = function (req, res, params) {

    filemanager.rename(req, res, params);
};


route.get_pic_albume = function(req, res, params){

    photos.get_pic_albume(req, res, params);

}

route.get_album_pics = function(req, res, params){

    photos.get_album_pics(req, res, params);

}


exports.route = route;

var photosroot = process.argv[3];

if (photosroot) {
    log.w("photos root:" + photosroot);
} else {
    log.e("not setting photos root ,please set !");
    process.exit(1);
}