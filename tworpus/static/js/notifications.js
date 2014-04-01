angular.module("notifications", [])
    .factory("notify", [function() {
        return function(message, type) {
            type = type || "success";
            console.log("notifification: ", message);
            console.log("notifification type: ", type);

            var res = {
                text: message,
                type: type
            };
            if(type === "info") res.icon = "glyphicon glyphicon-info-sign";
            else if(type === "success") res.icon = "glyphicon glyphicon-ok-sign";

            $.pnotify(res);
        }
    }])
;