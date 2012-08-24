// function to create a graphic from the showdown markup
// apologies on the name

var manipulate = function(form_id, graph_id, inputs,  expression) {

    // used to replace %variable_name% with a value, from showdown code
    var render = function(template, values) {
       for (value in values) {template = template.replace(new RegExp('%' + value + '%', 'g'), values[value], 'g');}
       return(template);
    }

    // some random id
    var rnd_id = (((1+Math.random())*0x10000)|0).toString(16).substring(1); // oops, from internet search (who?)
    
    // make HTML from markup
    var converter = new Showdown.converter();
    html = converter.makeHtml(inputs);              

    // add inputs and create blank graph to be replaced later
    $("#" + form_id).append("<form action='#' id='" + rnd_id + "'>" + html + "</form>") ; // class='form-horizontal' gives wider layout
    $("#" + graph_id).append("<img src='data:image/gif;base64,R0lGODlhAQABAID/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='></img>"); //blank

    // kill enter key submit for text fields.
    // this also kills enter as a way to commit changes. This is
    // somewhat non-intuitive and could be improved
    $('.noEnterSubmit').keypress(function(e){
        if ( e.which == 13 ) return false;
    });

    // call expression, fill in params
    var call_expression = function(params, expression) {
        var tmp = {}
        $.each(params, function() {
	    tmp[this.name] = this.value
	});
        var out = render(expression, tmp);

	$.post("https://public.opencpu.org/R/pub/base/identity/save",
	       {x:out}, function(data, status, xhr) {
		   var data = JSON.parse(data)
                   $("#" + graph_id).children()[0].src = "https://public.opencpu.org/R/tmp/" + data.graphs[0] + "/png"
	       })
    };

    // call expression on change
    $("#" + form_id).on("change", ':input:not([type="submit"])', function() { //change input
         call_expression($("#" + rnd_id).serializeArray(), expression);
    })

   // initial graphic
   call_expression($("#" + rnd_id).serializeArray(), expression);
}
