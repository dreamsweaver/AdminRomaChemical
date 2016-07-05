//url_base = 'http://localhost/RomaChemical/wp/';
url_base = 'http://romachemical.laeliteweb.com/'
ajax_url = url_base+'wp-admin/admin-ajax.php';
jQuery(document).ready(function(e) {
	
	jQuery('body').delegate('.logout','clic tap',function(){
		loading_ajax();
		localStorage.removeItem('wordpress_loggedin');
		localStorage.removeItem('app_user_id');
		if (!localStorage.getItem('wordpress_loggedin') && !localStorage.getItem('app_user_id')) {
			window.location.href = 'index.html';
		} else {
			localStorage.setItem('wordpress_loggedin', '');
			localStorage.setItem('app_user_id', 0);
			window.location.href = 'index.html';
		}
	});
	
	if( jQuery('body').hasClass('home') ){
		verify_loggedin_cookie();
		nonce = get_nonce();
		
		jQuery('body').delegate('#sendLogin','tap',function(){
			var pass = jQuery('#pass').val();
			var user = jQuery('#user').val();
			jQuery.ajax({
				type: "POST",
				data: {
					nonce : nonce,
					username : user,
					password : pass,
					insecure : "cool"
				},
				url: url_base+'api/auth/generate_auth_cookie/',
				beforeSend: function(){
					loading_ajax();
				},
				success: function (data) {
					loading_ajax({estado:false});
					if( data.status == "ok" ){
						//jQuery.cookie('wordpress_loggedin', data.cookie, { expires: 14, path: '/' });
						//jQuery.cookie('app_user_id', data.user.id, { expires: 14, path: '/' });
						localStorage.setItem("wordpress_loggedin", data.cookie);
						localStorage.setItem("app_user_id", data.user.id);
						window.location.href = 'app.html';
					} else {
						jQuery( "#popupLogin" ).popup( "open" );
					}
				}
			});
			return false;
		});
	}
	
	if( jQuery('#login-page').length ){
		jQuery('#login-page').removeClass('ui-page-theme-a');
	}
	
	if( jQuery('.agenda').length ){
		jQuery('.agenda').fullCalendar({
			header:{
				left:   'today prev,next',
				center: 'title',
				right:  'agendaWeek,agendaDay'
			},
			businessHours: {
				start: '08:00',
				end: '17:00',
				dow: [ 1, 2, 3, 4, 5, 6 ]
			},
			firstDay: 1,
			defaultView: 'agendaDay',
			allDaySlot:false,
			height: 450,
			lang: "es",
			minTime:"07:00:00",
			maxTime:"18:00:00",
			slotLabelFormat:"h:mm",
			hiddenDays: [ 0 ]
		});
	}
	if( jQuery('.timepicker').length ){
		jQuery('.timepicker').timepicker({
			template: false,
			showInputs: false,
			minuteStep: 15,
			showMeridian: false,
			defaultTime: '08:30'
		});
	}
	
	if( jQuery('#signature-pad').length ){
		var wrapper = document.getElementById("signature-pad"),
		clearButton = document.querySelector('[data-action="clear"]'),
		//saveButton = document.querySelector("[data-action=save]"),
		canvas = wrapper.querySelector("canvas"),
		signaturePad;
	
		function resizeCanvas() {
			var ratio =  Math.max(window.devicePixelRatio || 1, 1);
			canvas.width = canvas.offsetWidth * ratio;
			canvas.height = canvas.offsetHeight * ratio;
			canvas.getContext("2d").scale(ratio, ratio);
		}
		
		window.onresize = resizeCanvas;
		resizeCanvas();
		signaturePad = new SignaturePad(canvas);
		
		setTimeout(function(){
			resizeCanvas();
		},2000);
		
		clearButton.addEventListener("tap", function (event) {
			signaturePad.clear();
		});
	}
	
	if( jQuery('body').hasClass('app') ){
		verify_loggedout_cookie();
		
		jQuery.ajax({
			type: "POST",
			url: ajax_url,
			data: {
				user : localStorage.getItem('app_user_id'),
				action: "get_visitis_per_user"
			},
			beforeSend: function(){
				loading_ajax();
			},
			success: function (data) {
				var tabla = '';
				dat_ = jQuery.parseJSON(data);
				console.log(dat_.eventos);
				jQuery('.agenda').fullCalendar( 'destroy' );
				jQuery('.agenda').fullCalendar({
					header:{
						left:   'today prev,next',
						center: 'title',
						right:  'agendaWeek,agendaDay'
					},
					businessHours: {
						start: '08:00',
						end: '17:00',
						dow: [ 1, 2, 3, 4, 5, 6 ]
					},
					firstDay: 1,
					defaultView: 'agendaDay',
					allDaySlot:false,
					height: 450,
					lang: "es",
					minTime:"07:00:00",
					maxTime:"18:00:00",
					slotLabelFormat:"h:mm",
					hiddenDays: [ 0 ],
					events: dat_.eventos
				});
				
				for(i = 0; i < dat_.estados.length; i++){
					
					var fecha = dat_.estados[i].date.split('-');
					var date = new Date();
					var dia = date.getDate();
					var mes = date.getMonth();
					var anio = date.getFullYear();
					
					var hoy = new Date(anio+'/'+mes+'/'+dia);
					var day = new Date(fecha[0]+'/'+(parseInt(fecha[1])-1)+'/'+fecha[2]);
					
					if( day.getTime() < hoy.getTime() && dat_.estados[i].state === 'pendiente' ){
						botones = '<a href="reprogramar.html?id='+dat_.estados[i].id+'" class="btn btn-default"><i class="fa fa-clock-o"></i></a><a href="#popupDialogEstrellaO" data-rel="popup" data-position-to="window" data-transition="pop" class="btn btn-default"><i class="fa fa-star-o"></i></a>';
					} else if( day.getTime() <= hoy.getTime() && dat_.estados[i].state === 'completado' ){
						botones = '<a href="" class="btn btn-default disabled"><i class="fa fa-clock-o"></i></a><a href="#popupDialogEstrella" data-rel="popup" data-position-to="window" data-transition="pop" class="btn btn-default"><i class="fa fa-star"></i></a>';
					} else if( day.getTime() === hoy.getTime() ){
						botones = '<a href="reprogramar.html?id='+dat_.estados[i].id+'" class="btn btn-default"><i class="fa fa-clock-o"></i></a><a href="#popupDialogRojo" data-rel="popup" data-position-to="window" data-id="'+dat_.estados[i].id+'" data-transition="pop" class="btn btn-default firmar"><i class="fa fa-bell curso"></i></a>';
					} else if( day.getTime() > hoy.getTime() ){
						botones = '<a href="reprogramar.html?id='+dat_.estados[i].id+'" class="btn btn-default"><i class="fa fa-clock-o"></i></a><a href="#popupDialogVerde" data-rel="popup" data-position-to="window" data-transition="pop" class="btn btn-default"><i class="fa fa-bell proxima"></i></a>';
					}
					
					tabla += '<tr><td class="col-xs-8 col-sm-8"><p>'+dat_.estados[i].title+'</p><span>'+dat_.estados[i].date+' '+dat_.estados[i].start+'</span></td><td class="col-xs-4 col-sm-4">'+botones+'</td></tr>';
				}
				
				jQuery('#tabla-estados').html(tabla);
				
				loading_ajax({estado:false});
			}
		});
		
		jQuery.ajax({
			type: "POST",
			url: ajax_url,
			data: {
				user : localStorage.getItem('app_user_id'),
				action: "get_costumers_per_user"
			},
			beforeSend: function(){
				loading_ajax();
			},
			success: function (data) {
				var tabla = '';
				var option = '';
				dat_ = jQuery.parseJSON(data);
				for(i = 0; i < dat_.clientes.length; i++){
					
					tabla += '<tr><td class="col-xs-9 col-sm-9"><p>'+dat_.clientes[i].empresa+'</p><span>'+dat_.clientes[i].nombre+'</span></td><td class="col-xs-3 col-sm-3"><a href="editar-cliente.html?id='+dat_.clientes[i].id+'" class="btn btn-default"><i class="fa fa-edit"></i></a></td></tr>';
					
					option += '<option value="'+dat_.clientes[i].empresa+'">'+dat_.clientes[i].empresa+'</option>';
				}
				
				jQuery('#mis-clientes').html(tabla);
				jQuery('#cliente-programar').html(option);
				
				loading_ajax({estado:false});
			}
		});
	}
	
	jQuery('body').delegate('.firmar','tap', function(){
		var element = jQuery(this);
		var id = element.data('id');
		var url = jQuery('#popupDialogRojo .boton-editar').attr('href');
		var parts = url.split('=');
		parts[1] = id;
		var new_url = parts.join('=');
		jQuery('#popupDialogRojo .boton-editar').attr('href',new_url);
	});
	
	if( jQuery('body').hasClass('reprogramacion') ){
		verify_loggedout_cookie();
		var id = decodeURI(get_URL_parameter('id'));
		jQuery.ajax({
			type: "POST",
			url: ajax_url,
			data: {
				id:id,
				action: "get_visit_data"
			},
			beforeSend: function(){
				loading_ajax();
			},
			success: function (data) {
				dat_ = jQuery.parseJSON(data);
				if( dat_[0].error ){
					jQuery( "#popupDialogError .mensaje" ).html(data.msj);
					jQuery( "#popupDialogError" ).popup( "open" );
				} else {
					jQuery('#cambio-fecha').val(dat_[0].fecha);
					jQuery('#cambio-hora').val(dat_[0].hora);
				}
				loading_ajax({estado:false});
			}
		});
	}
	
	jQuery('body').delegate('.programar-send-btn','tap',function(){
		var fecha = jQuery('#cambio-fecha').val();
		var hora = jQuery('#cambio-hora').val();
		var cliente = jQuery('#cliente-programar').val();
		
		if( !fecha.length || !hora.length || !cliente.length ){
			alert("Debes rellenar todos los campos");
			return;
		}
		
		jQuery.ajax({
			type: "POST",
			url: ajax_url,
			data: {
				fecha : fecha,
				hora : hora,
				cliente: cliente,
				user : localStorage.getItem('app_user_id'),
				action: "set_visit"
			},
			beforeSend: function(){
				loading_ajax();
			},
			success: function (data) {
				dat_ = jQuery.parseJSON(data);
				if( dat_.error ){
					jQuery( "#popupDialogError2 .mensaje" ).html(dat_.msj);
					jQuery( "#popupDialogError2" ).popup( "open" );
				} else if(dat_.exito) {
					window.location.href = 'respuestas-forms.html?#respuesta-exito';
				} else {
					//alert("No hay respuesta del servidor");
					navigator.notification.alert('No hay respuesta del servidor', function(){}, 'Error','Aceptar');
					navigator.notification.vibrate(1000);
				}
				loading_ajax({estado:false});
			}
		});
	});
	
	jQuery('body').delegate('.reprogramar-send-btn','tap',function(){
		var id = decodeURI(get_URL_parameter('id'));
		var fecha = jQuery('#cambio-fecha').val();
		var hora = jQuery('#cambio-hora').val();
		var motivo = jQuery('#motivo-cambio').val();
		
		if( !fecha.length || !hora.length || !id.length || !motivo.length ){
			alert("Debes rellenar todos los campos");
			return;
		}
		
		jQuery.ajax({
			type: "POST",
			url: ajax_url,
			data: {
				fecha : fecha,
				hora : hora,
				motivo: motivo,
				id:id,
				user : localStorage.getItem('app_user_id'),
				action: "reset_visit"
			},
			beforeSend: function(){
				loading_ajax();
			},
			success: function (data) {
				dat_ = jQuery.parseJSON(data);
				if( dat_.error ){
					jQuery( "#popupDialogError2 .mensaje" ).html(dat_.msj);
					jQuery( "#popupDialogError2" ).popup( "open" );
				} else if(dat_.exito) {
					window.location.href = 'respuestas-forms.html?#respuesta-exito';
				} else {
					//alert("No hay respuesta del servidor");
					navigator.notification.alert('No hay respuesta del servidor', function(){}, 'Error','Aceptar');
					navigator.notification.vibrate(1000);
				}
				loading_ajax({estado:false});
			}
		});
	});
	
	
	if( jQuery('body').hasClass('edit-cliente') ){
		verify_loggedout_cookie();
	}
	
	jQuery('body').delegate('.edit-send-btn','tap', function(){
		var cambios = jQuery('#cambio-solicitud').val();
		var id = decodeURI(get_URL_parameter('id'));
		
		if( !cambios.length ){
			alert("Debes rellenar el campo");
			return;
		}
		
		jQuery.ajax({
			type: "POST",
			url: ajax_url,
			data: {
				id:id,
				cambios : cambios,
				user : localStorage.getItem('app_user_id'),
				action: "query_user_changes"
			},
			beforeSend: function(){
				loading_ajax();
			},
			success: function (data) {
				dat_ = jQuery.parseJSON(data);
				if( dat_.error ){
					jQuery( "#popupDialogError .mensaje" ).html( dat_.msj );
					jQuery( "#popupDialogError" ).popup( "open" );
				} else if(dat_.exito) {
					window.location.href = 'respuestas-forms.html?#respuesta-exito';
				} else {
					//alert("No hay respuesta del servidor");
					navigator.notification.alert('No hay respuesta del servidor', function(){}, 'Error','Aceptar');
					navigator.notification.vibrate(1000);
				}
				loading_ajax({estado:false});
			}
		});
		return false;
	});
	
	if( jQuery('body').hasClass('firma') ){
		verify_loggedout_cookie();
		var id = decodeURI(get_URL_parameter('id'));
		jQuery.ajax({
			type: "POST",
			url: ajax_url,
			data: {
				id:id,
				action: "get_costumer_data"
			},
			beforeSend: function(){
				loading_ajax();
			},
			success: function (data) {
				dat_ = jQuery.parseJSON(data);
				if( dat_[0].error ){
					jQuery( "#popupDialogError .mensaje" ).html(data.msj);
					jQuery( "#popupDialogError" ).popup( "open" );
				} else {
					jQuery('#nombre_encargado').val(dat_[0].encargado);
					jQuery('#email_encargado').val(dat_[0].email);
				}
				loading_ajax({estado:false});
			}
		});
	}
	
	jQuery('body').delegate('.firma-send-btn','tap', function(){
		var nombre = jQuery('#nombre_encargado').val();
		var email = jQuery('#email_encargado').val();
		var comentarios = jQuery('#comentarios_visitas').val();
		var id = decodeURI(get_URL_parameter('id'));
		var img = signaturePad.toDataURL();
		
		if( !nombre.length || !email.length || !comentarios.length || !img.length || !id.length ){
			alert("Debes rellenar los campos y haber firmado");
			return;
		}
		
		jQuery.ajax({
			type: "POST",
			url: ajax_url,
			data: {
				nombre : nombre,
				email : email,
				id : id,
				comentarios : comentarios,
				img : img,
				user : localStorage.getItem('app_user_id'),
				action: "comprobar_visita"
			},
			beforeSend: function(){
				loading_ajax();
			},
			success: function (data) {
				dat_ = jQuery.parseJSON(data);
				if( dat_.error ){
					jQuery( "#popupDialogError .mensaje" ).html( dat_.msj );
					jQuery( "#popupDialogError" ).popup( "open" );
				} else if(dat_.exito) {
					window.location.href = 'respuestas-forms.html?#respuesta-exito';
				} else {
					//alert("No hay respuesta del servidor");
					navigator.notification.alert('No hay respuesta del servidor', function(){}, 'Error','Aceptar');
					navigator.notification.vibrate(1000);
				}
				loading_ajax({estado:false});
			}
		});
		return false;
	});
});

function get_nonce(){
	jQuery.ajax({
		type: "GET",
		url: url_base+'api/get_nonce/?controller=auth&method=generate_auth_cookie',
		beforeSend: function(){
			loading_ajax();
		},
		success: function (data) {
			loading_ajax({estado:false});
			if( data.status == "ok" ){
				return data.nonce;
			} else {
				return false;
			}
		}
	});
}

function verify_loggedin_cookie(){
	if (localStorage.getItem('wordpress_loggedin')) {
		window.location.href = 'app.html';
	}
}

function verify_loggedout_cookie(){
	if (!localStorage.getItem('wordpress_loggedin')) {
		window.location.href = 'index.html';
	}
}

function loading_ajax(options){
	var defaults = {
		'estado' : true
	}
	jQuery.extend(defaults, options);
	
	if(defaults.estado == true){
		jQuery('body').append('<div class="sombra_popup sportive-ajax"><div class="sk-three-bounce"><div class="sk-child sk-bounce1"></div><div class="sk-child sk-bounce2"></div><div class="sk-child sk-bounce3"></div></div></div>');
		jQuery('.sombra_popup').fadeIn(1000);
	} else {
		jQuery('.sombra_popup').fadeOut(800, function(){
			jQuery('.sportive-ajax').remove();
		});
	}
}

function get_URL_parameter(sParam){
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for(i = 0; i < sURLVariables.length; i++){
        var sParameterName = sURLVariables[i].split('=');
        if(sParameterName[0] == sParam){
            return sParameterName[1];
		}
	}
}

/*function checkConnection() {
    var networkState = navigator.connection.type;

    var states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.NONE]     = 'No network connection';
	
	if( states[networkState] === states[Connection.UNKNOWN] || states[networkState] === states[Connection.NONE] ){
		navigator.notification.alert('No hay Conexión a internet', function(){}, 'Error','Aceptar');
		navigator.notification.vibrate(1000);
	}
}*/