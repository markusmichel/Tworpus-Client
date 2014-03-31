   tworpusApp.startJoyride = function() {
             setTimeout(function() {
                $("#joyRideTipContent").joyride({
                autostart : true,
                expose : true
            });
            }, 500);
        };

        $('#help').click(tworpusApp.startJoyride);

        if (!localStorage.getItem('firstStart')) {
            localStorage.setItem('firstStart', true);

            $(window).load(function(){
               tworpusApp.startJoyride();
            });
        }