var CorpusView = function() {

    var charsSlider  = null,
        wordsSlider  = null,
        tweetsSlider = null,

        charsInput  =  null,
        wordsInput  =  null,
        tweetsInput =  null,
        titleInput = null,

        form = null,

        that = {};


    var init = function() {
        initSliders();
        initForm();
        initLanguageInputField();
        initInputFields();
    };

    var initInputFields = function() {
        titleInput = $('#input_title');
    };

    var initLanguageInputField = function() {
        $("#select-language").select2({
            placeholder: "Sprache auswählen",
            allowClear: true
        });
    };

    var initForm = function() {
        form = $("form");
        form.submit(onFormSubmit);
    };

    var initSliders = function() {
        // http://www.eyecon.ro/bootstrap-slider/
        charsSlider  = $('#input_slider_min_chars').slider();
        wordsSlider  = $('#input_slider_min_words').slider();
        tweetsSlider = $('#input_slider_num_tweets').slider();

        charsInput  =  $("#input_min_chars");
        wordsInput  =  $("#input_min_words");
        tweetsInput =  $("#input_num_tweets");

        connectSliderToInput(charsSlider,  charsInput);
        connectSliderToInput(wordsSlider,  wordsInput);
        connectSliderToInput(tweetsSlider, tweetsInput);
    };

    var connectSliderToInput = function($slider, $textbox) {
        $slider.on("slide", function(event) {
            $textbox.val($(this).val());
        });
        $textbox.change(function(event) {
            $slider.slider("setValue", $(this).val());
        });
    };

    var onFormSubmit = function(event) {
        event.preventDefault();

        var url = $(this).attr('action');
        console.log("url", url);

        var data = {
            "title": titleInput.val(),
            "minWords": wordsInput.val(),
            "minChars": charsInput.val(),
            "language": "de",
            "limit": tweetsInput.val()
        }

        // Start corpus creation
        $.ajax({
            type: "POST",
            url: url,
            data: data,
            success: function(data) {
                console.log("success", data)
                $("form").trigger("startCorpusCreation");
            },
            error: function(err) {
                console.log("error", err)
                $.pnotify({
                    title: 'Fehler',
                    text: 'Fehler beim erstellen des Korpus',
                    type: 'error'
                });
            }
        });
    };

    that.init = init;
    return that;
}