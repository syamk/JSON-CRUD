/**
 * jQuery J2H v1.0
 * A dynamic CRUDS system for JSON 
 *
 * Licensed under the MIT license.
 * Copyright 2012 syamk
 */
// TODO : move the presentation logic to a microtemplate
(function( $ ) {
	var disp, parents=[];
	var methods = {
		exhibit : function( obj ) { 
			$.each(obj, function(index, val) { 
				if (typeof (val) == "function") { 
					return "";
				}
				if(typeof (val) != "object"){	
					disp += "<tr><td>" + index + "</td><td><input type='text' id='" + parents.join('.') + "." + index 
 + "' value='" + val + "' class='j2h_watchthis' /></td></tr>";
				}else{ 
					parents.push(index);
					disp += "<tr><td>" + index + "</td>" + "<td><div>"+ val.constructor.name  +"</div><table class='j2h_table_" + val.constructor.name + "_table'><tr><th>" + ((val instanceof Array) ? "Index" : "Name") + "</th><th>Value</th></tr>";
				}
				//recursion 
				( typeof (val) == "object") && methods[ 'exhibit' ].apply( this, [val] );
				
			});
			parents.pop();
			disp += "</table></div></td></tr>";  
			return disp;	
		},
		pulloff : function() {
			var j,e = ((j=this.data('obj'))&&JSON.stringify)&&JSON.stringify(j) || false;
			return e;
		},
		//TODO: refactor this
		caster : function(ns, obj, val) {
			var global = (function () { return this;})(), // reference to the global object
			  levels = ns.split('.'), first = levels.shift();
			obj = obj || global; //if no object argument supplied declare a global property
			obj[first] = obj[first] || {}; // initialize the "level"
			if (levels.length == 0) { // val assignment
				obj[first] = val;
			}
			if (levels.length) { // recursion condition
				this.caster(levels.join('.'), obj[first], val);
			}
			return obj[first]; // return a reference to the top level object
		},
		attachListen : function (me) {
			$(".j2h_watchthis").live("change", function(){
				var path = $(this).attr('id').split('.'), obj = $(me).data('obj');
				methods.caster( $(this).attr('id'), obj, $(this).val());
				$(me).data('obj', obj); 
			});
		}
	};
	$.fn.j2h = function( method ) {
		if ( methods[method] ) {
			//calling specific action
			return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			disp= "", parents=[];
			//caling the default action
			var jsonString = arguments[0]['jsonString'];
			//first, try parsing the string
			(jsonString === null || jsonString === undefined) && $.error("JSON string invalid error");
			try{
				this.data('obj', $.parseJSON(jsonString)); 
			}catch(e){
				$.error('JSON string parse error');
			}
			var returndisp  = methods.exhibit.apply( this, [this.data('obj')] );
			this.html('<div class="j2h_container"><table>'+returndisp+'</table></div>');
			methods.attachListen(this);
			return returndisp;
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.j2h' );
		}    
	};
})( jQuery );
