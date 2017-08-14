'use strict';

/* global QB:true */

function Content(imageFile) {
    var self = this;

    return new Promise(function(resolve, reject) {
        self.getImageObject(imageFile)
            .then(function(imageParams) {
                return self.cropImage(imageParams);
            }).then(function(croppedImage) {
                return self.uploadImage(croppedImage);
            }).then(function(uid) {
                resolve(uid);
            }).catch(function(error) {
                reject(error);
            });
    });
}

Content.prototype.uploadImage = function(file) {
    return new Promise(function(resolve, reject) {
        QB.content.createAndUpload({
            'file': file,
            'name': file.name.slice(0, 99),
            'type': file.type,
            'size': file.size,
            'public': false
        }, function(err, response) {
            if (err) {
                reject(err);
            } else {
                resolve(response.uid);
            }
        });
    });
};

Content.prototype.getImageObject = function(file) {
    return new Promise(function(resolve, reject) {
        var _URL = window.URL || window.webkitURL,
            image = new Image();

        image.src = _URL.createObjectURL(file);

        image.onload = function() {
            var imageFile = this;

            resolve({
                file: file,
                w: imageFile.width,
                h: imageFile.height
            });
        };

        image.onerror = function() {
            reject('Incorrect image file');
        };
    });
};

Content.prototype.cropImage = function(img) {
    return new Promise(function(resolve, reject) {
        if (!loadImage || (img.h < 250)) {
            resolve(img.file);
        }

        loadImage(img.file, function (canvas) {
            canvas.toBlob(function (blob) {
                var croppedImg = new File(
                    [blob],
                    img.file.name,
                    {
                        type: img.file.type,
                        lastModified: Date.now()
                    }
                );

                resolve(croppedImg);
            }, img.file.type);
        }, {
            'crop': true,
            'canvas': true,
            'maxHeight': 250
        });
    });
};

window.Content = Content;
