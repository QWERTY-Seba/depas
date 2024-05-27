
let map;



var click = false;
var click_top = null;
var click_bottom;
var temp_drag_boundie;
var boundies = [];
var lista = document.querySelector("#lista")

var metros_innerPoint = 1000
var metros_lat;
var metros_lng;
var debug_dibujar_subpuntos = true

/*
CLASES A CREAR

CRUD RECT/POINTS : Crear y Calcular subpuntos
UX : Objetos a HTML
DRAWING : crear rectangulos desde objetos o desde interacciones
DB : almacenar y buscar datos a partir de filtros del ux
SCRAPPER : manejar queries para scrapear deptos usando las coords
CARGADOR : Transformar archivos / request en lista u objetos manejables


*/



var request_headers = {
    "accept": "application/json, text/plain, */*",
    "accept-language": "es-ES,es;q=0.9",
    "device-memory": "8",
    "downlink": "10",
    "dpr": "1",
    "ect": "4g",
    "encoding": "UTF-8",
    "priority": "u=1, i",
    "rtt": "0",
    "sec-ch-ua": "\"Chromium\";v=\"124\", \"Google Chrome\";v=\"124\", \"Not-A.Brand\";v=\"99\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "viewport-width": "787",
    "x-csrf-token": "x6Q1gPUr-_Bacu9G39Ziztj5nScdgnv7eU5I",
    "x-requested-with": "XMLHttpRequest"
  }

fetch("https://www.portalinmobiliario.com/api/venta/departamento/_DisplayType_M_item*location_lat:-40.56486632430563*-23.62556657735584,lon:-89.97462635253906*-57.23536854003906", {
  "headers": request_headers ,
  "referrer": "https://www.portalinmobiliario.com/venta/departamento/_DisplayType_M_item*location_lat:-40.56486632430563*-23.62556657735584,lon:-89.97462635253906*-57.23536854003906",
  "referrerPolicy": "no-referrer-when-downgrade",
  "body": null,
  "method": "GET",
  "mode": "cors",
  "credentials": "include"
});

//const punto_partida =  { lat: -33, lng: -70 }
const punto_partida =  { lat: -33.35347292760934, lng: -70.52849330515278 }


function cargar_rect(){

}

//CREAR FUNCION PARA CARGAR LUGARES PUBLICOS

function exportar_coords(){
	let res = []
	
  for(let rect of boundies){
  
  	let rect_json = {
    	dimensiones : rect.getBounds().toJSON(),
      inner_points : puntos_a_cubos(rect.inner_points)
    
    }
    res.push(rect_json)
    
  }
	console.log(res)


}

function mostrar_inner_points(){
	let valor = document.querySelector("#mostrar_puntos").checked
  console.log(valor)
  debug_dibujar_subpuntos = valor 
  
  for(let rect of boundies){
  	if(valor){
    	rect.mostrar_subpuntos()
    }else{
    	rect.ocultar_subpuntos()
    }
    
  }
}




function calcular_metros() {
    metros_lat = punto_partida.lat - google.maps.geometry.spherical.computeOffset(punto_partida, metros_innerPoint, 180 ).lat()
    metros_lng = punto_partida.lng -  google.maps.geometry.spherical.computeOffset(punto_partida, metros_innerPoint, 90 ).lng()    
    console.log(metros_lat, metros_lng)
}





//A PARTIR DE BOUNDS, CALCULAR DIFERENCIA Y CANTIDAD DE SUBCUADROS POSIBLES, LUEGO ITERAR CREANDO SUBPUNTOS A PARTIR DE CANTIDAD




function cantidad_subpuntos(bounds, metros){
		
    let coords = bounds.toJSON()
    console.log(coords)
    
    let lat1 = {lat : coords.north, lng: coords.west}
    let lat2 = {lat : coords.south, lng: coords.west}
    
    let lng1 = {lat : coords.north, lng: coords.west}
    let lng2 = {lat : coords.north, lng: coords.east}
    
    
    //CALCULAR LA DISTANCIA EN METROS
    let cantLat =   Math.ceil(google.maps.geometry.spherical.computeDistanceBetween(lat1, lat2) / metros_innerPoint) + 1
    let cantLng =   Math.ceil(google.maps.geometry.spherical.computeDistanceBetween(lng1, lng2) / metros_innerPoint) + 1
    
    
   console.log(cantLat, cantLng)
    
    return [cantLat, cantLng]   
}

function calcular_subpuntos(bounds,cantidad_lat, cantidad_lng){
	let coords = bounds.toJSON()
  let punto_comienzo = {lat : coords.west, lng : coords.north}
  var innerPoints = []
   
  
  let lat_acumulado = coords.north
  
	for(let i = 0;i < cantidad_lat ; i++ ){
  
  	let lng_acumulado = coords.west
  	let fila = []
    for(let e = 0; e < cantidad_lng ; e++ ){
			//ACA SE PODRIA USAR UNA CONSTANTE 
      let new_pos = {lat : lat_acumulado, lng : lng_acumulado}
    	lng_acumulado -= metros_lng  
      fila.push(new_pos)
     
  	}
  	lat_acumulado -= metros_lat
    innerPoints.push(fila)
  }
  return innerPoints
	

}

function puntos_a_cubos(subpuntos) {
    let res = [];

    
    for (let i = 0; i < subpuntos.length - 1; i++) {
        for (let e = 0; e < subpuntos[i].length - 1; e++) {
            // CREAR CUBO
           
            try{
            	let obj = {
            		//el structuredClone tiene que usarse para evitar problemas con referencia 
                topLeft: structuredClone(subpuntos[i][e]),
                bottomRight: structuredClone(subpuntos[i + 1][e + 1])
            };
            res.push(obj);
            
            }catch(Error){
            	console.log("ERROR", subpuntos[i][e], subpuntos[i + 1][e + 1] )
              throw Error
            
            }	
            
            
            
        }
    }
    return res;
}


//AL DIBUJAR ASEGURAR DE 
function crear_marker_subpuntos(subpuntos){
 
  //FLAT
  let flat_subpuntos = [].concat(...subpuntos);
  let ref = []
  let usar = debug_dibujar_subpuntos == true ? map : null
  
  
  for(let punto of flat_subpuntos){
  
  	ref.push(new google.maps.marker.AdvancedMarkerElement({
    	map : usar,
      position : punto
    
    }))
    
    
  }
  return ref

}


//AGREGAR PARAMETROS PARA QUE AL AJUSTAR UN RECT, SE USE EL PUNTO INTERIOR O EXTERIOR, O MAS CERCANO

//MODO 1 es indice sup
async function buscar_punto(){
	
  let valor = document.querySelector("#buscar_punto").value
  
  const regex_p = /{\s*lat: ([-]*\d+(?:\.\d+)?)\s*,\s*lng: ([-]*\d+(?:\.\d+)?)\s*}/gmi
  
  let regex = new RegExp(regex_p)
  let res = regex.exec(valor)
  
  
  if(res == null){
  	return;
  }
  
  let latlng = {lat : parseFloat(res[1]), lng : parseFloat(res[2]) }
  console.log(latlng)
  //crear puntto y borrarlo despues de X segundos
  
  let temp_mark = new google.maps.marker.AdvancedMarkerElement({
  	position : latlng,
  	map, 
    content : new google.maps.marker.PinElement({background: "blue"}).element
  })
  
  
  map.setCenter(latlng)
  
  
  setTimeout(() => {temp_mark.setMap(null)}, 10000)
  
  
  console.log(regex, valor )

}


function main_puntos(rect){
		if(!(rect instanceof google.maps.Rectangle)){
    	throw "El objeto no es un google.maps.Rectangle, func: main_puntos"
    }
		
    console.log("rect creado")
    
		let bounds = rect.getBounds()

		let cant = cantidad_subpuntos(bounds, metros_innerPoint)
    
    
    
    let subpuntos = calcular_subpuntos(bounds, ...cant)
    //CREAR FUNCION PARA BUSCAR 
    
    console.log("cant", cant)
    
    let extremo = subpuntos[subpuntos.length-1][subpuntos[0].length - 1]
    
    rect.inner_points = subpuntos
    rect.ocultar_subpuntos = () => {
    	rect.inner_points_marker.forEach(e => {
      	e.setMap(null)
      })
    }
    
    rect.mostrar_subpuntos = () => {
    	rect.inner_points_marker.forEach(e => {
      	e.setMap(map)
      })
    }
    
    
    console.log("extremo", extremo)
    rect.setBounds(bounds.extend(extremo))
    
    //CAMBIAR EL NOMBRE A CREAR MARK
    rect.inner_points_marker = crear_marker_subpuntos(subpuntos)
    
    crear_boundie_lista(rect)
    
  	boundies.push(rect)
  
}




function initMap() {
		
    
   const estilo = [
  {
    "featureType": "all",
    "stylers": [
      { "visibility": "off" }
    ]
  }
]
     
     
   
   
   
    
	 map = new google.maps.Map(document.getElementById("map"), {
    center: punto_partida,
    zoom: 10,
    clickableIcons : false,
    mapId: "4504f8b37365c3d0",
    styles : estilo
   
  });
  
  map.setOptions({ styles: estilo });
  
  const drawingManager = new google.maps.drawing.DrawingManager({
    drawingMode: google.maps.drawing.OverlayType.RECTANGLE,
    drawingControl: true,
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_CENTER,
      drawingModes: [
        google.maps.drawing.OverlayType.RECTANGLE
      ],
    },
    markerOptions: {
      icon: "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png",
    },
    circleOptions: {
      fillColor: "#ffff00",
      fillOpacity: 1,
      strokeWeight: 5,
      clickable: false,
      editable: true,
      zIndex: 1,
    },
  
  })

  
  google.maps.event.addListener(drawingManager, 'rectanglecomplete', main_puntos)
   drawingManager.setMap(map);
  

	calcular_metros()
  
  
  map.addListener('keydown', function(event) {
  	console.log(event.code)
  	if(event.code == "KeyR"){
        boundies.slide(0, 1)
    }
    
    console.log(boundies)
  
  })
  
  temp_drag_boundie =  new google.maps.Rectangle({
      strokeColor: "#999999",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#999999",
      fillOpacity: 0,
      visible : false,
      clickable : false,
      map,
      bounds: {
        north: 0,
        south: 0,
        east: 0,
        west: 0,
      },
    });
   
   
   
   //AGREGAR MODO DE EDICION PARA QUE 
   map.addListener("mousemove", dragable_boundie)
   map.addListener('rightclick', function(event) {
     click = true
     temp_drag_boundie.setVisible(true)
     
     let coord = event.latLng.toJSON()
     
     
     //SI SE CLICKEA DENTRO DE UN RECTANGULO EXISTENTE, CAMBIAR LA LNG POR LA DEL RECTANGULO CLICKEADO EN BASE A LA POSICION DENTRO DEL MISMO RECT
     
     if(click_top == null){
     		click_top = coord
        
        return;
     }
     
     
     
     temp_drag_boundie.setVisible(false)
     let rect = dibujar_rectangulo(click_top, coord)       	
     main_puntos(rect)
     click = false
     boundies.push(rect)
     crear_boundie_lista(rect)
     click_top = null

     
     
     
     
     
     //SI HAY UN VALOR YA EXISTENTTE, HACER QUE SE DIBUJE UN BOUNDI PERMAMENTE HASTA QUE SE HAGA CLICK O SE CANCELE
     
     
     
     //BORRAR SELECCION SI SE APRETA ESC
     
     
     		//DETECTAR SI ESTA DENTRO DE OTRO BOUNDIE

        
     
     // Crea un marcador en la posición donde se presionó el botón
   });  
}



//SOLAMENTE PERMITIR SELECCIONAR LUEGO DE QUE EL MAPA ESTA CREADO


//HACER QUE UN BOUNDIE SE TRANSFORME EN DRAGABLE CUANDO SE SELECCIONE DESDE LA LISTA O TALVEZ DESDE EL MAPA, SI ES QUE NO SE ESTA CREANDO UNO
function dragable_boundie(mouse_Event){
  		if(!click){
        return;
      }
      

      let go_to = mouse_Event.latLng.toJSON()
     
			let coorordenar_coords = ordenar_coords(click_top, go_to)
			
			try{
      	temp_drag_boundie.setBounds(coorordenar_coords)
      	
      }catch(Error){
      	console.log(coorordenar_coords, Error)
      }
      
}


function crear_boundie_lista(rect){
	let e = document.createElement("li")
  let r = document.createElement("button")
  
  
  
  //USAR API PARA OBTENER LA COMUNA O ALGUNA REFERENCIA DE LO QUE ESTA DENTRO DEL RECTANGULO Y USARLO PARA NOMBRAR
  e.innerText = "hgola"
  
  r.innerText = "Remover"
  //BUG ACA DE QUE SI ES EL ULTIMO NO SE ELIMINA
  r.onclick = function(){
  	rect.setMap(null);
    rect.ocultar_subpuntos()
    e.remove();
    //BUSCAR EN LISTA
    delete rect
    }
  
  //FALTA REMOVER ACA LOS SUBPUNTOS CORRESPONDIENTES AL RECTANGULO
  e.append(r)
  
  e.addEventListener("mouseover", () => {
	
  map.setCenter(rect.getBounds().getCenter())

	})
  
  lista.append(e)
  
  
  
  //ONHOVER, HACER QUE SE VAYA AL CUADRADO QUE CORRESPONDE

}




function modificar_boundie(){}

//SELECCION PREVIO AL ALMACENAR
function eliminar_seleccion(){}

//ELIMINAR RECTANGULO
function eliminar_almacenado(i){
	boundies.setMap(null)
  boundies.splice(i,1)
}

function sobreposicion_boundies(coord){
//HACER LA MARCA UN OBJETO PUBLICO Y QUE ESTO LO ELIMINTE
     for(var bound in boundies){
       if(sobreposicion_de_boundies(coord, bound)){
         return false
       }
     }
     return true
}

//CREAR FUNCION QUE ORDENE LAS COORDS PARA EVITAR ERRORES
function ordenar_coords(top, bottom){

  let lat = [top.lat, bottom.lat]
  let lng = [top.lng, bottom.lng]
	
	
	let res =  {
  	north : Math.max( ...lat),
    east : Math.max( ...lng), 
  	south : Math.min( ...lat),
    west : Math.min( ...lng)
  }
  
  return res
}



function dibujar_rectangulo(top,bottom){
	console.debug("Creando rectangulo con ", top, bottom)
  
  let bounds_correjido =  ordenar_coords(top,bottom)
  
  
  
  const rectangle = new google.maps.Rectangle({
      strokeColor: "#FF0000",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#FF0000",
      fillOpacity: 0,
      map,
      clickable : false,
      bounds: bounds_correjido,
    });
    
    return rectangle
  }
function marcar_ubicacion(coord){


}
function almacenar_seleccion(){}

//DETECTAR SI SELECCION ESTA DENTRO DE OTRO
function sobreposicion_de_boundies(){}

//RECORRER LISTADO Y VER CUANDO QUEDO UN ESPACIO ENTRE 2 O MAS BOUNDIES
function normalizar_boundies(){}
// [END maps_map_simple]
window.initMap = initMap;
