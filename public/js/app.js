/**
 * Created by auggernaut on 4/7/14.
 */

$('#btnUpload').click(function(){
    console.log("upload");
    var files = $('input[id = \'uploadImg\']')[0].files;
    var file = files[0];
    if (!file || !file.type.match(/image.*/)) {
        return;
    }

    $.ajax({
        url: "/s3policy/" + file.name,
        dataType: "JSON",
        success: function (creds) {

            var loc = "img/" + file.name;
            var fd = new FormData();
            fd.append("key", loc);
            fd.append("AWSAccessKeyId", creds.s3Key);
            fd.append("acl", "public-read");
            fd.append("policy", creds.s3PolicyBase64);
            fd.append("signature", creds.s3Signature);
            fd.append("Content-Type", creds.s3Mime);
            fd.append("file", file);

            var xhr = new XMLHttpRequest();

            xhr.open("POST", "http://pegg.s3.amazonaws.com");

            xhr.onload = function (res) {
                console.log(res);
                //console.log("headers: " + xhr.getAllResponseHeaders().toLowerCase());
                //TODO: get link from response header Location
                if (xhr.responseText) {
                    console.log(xhr.responseText);
                } else {
                    $('#lblS3').html("http://pegg.s3.amazonaws.com/img/" + file.name);
                    console.log("Success");
                }
            };

            xhr.send(fd);



        },
        error: function (res, status, error) {
            console.log(error);
            //do some error handling here

        }
    });

});


$('#btnProcess').click(function(){
    var fd = new FormData();
    fd.append("location", $('#lblS3').html());

    var xhr = new XMLHttpRequest();

    xhr.open("POST", "/process");

    xhr.onload = function (res) {
        console.log(res);

        //console.log("headers: " + xhr.getAllResponseHeaders().toLowerCase());
        //TODO: get link from response header Location
        if (xhr.responseText) {
            console.log(xhr.responseText);
            $('#lblProcess').html(xhr.responseText);
        } else {
            $('#lblProcess').html(res);
            console.log("Success");
        }
    };

    xhr.send(fd);
});