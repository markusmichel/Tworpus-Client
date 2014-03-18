angular.module("notifications", [])
    .factory("notify", [function() {
        return function(message, type) {
            type = type || "success";
            console.log("notifification: ", message);
            console.log("notifification type: ", type);
            $.pnotify({
//                title: 'Regular Notice',
                text: message,
                type: type
            });
        }
    }])
;