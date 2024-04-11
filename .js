/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
// [START maps_map_simple]
let map;
var click_top;
var click_bottom;
var boundies = [];


async function initMap() {
  const { Map } = await google.maps.importLibrary("maps");

  map = new Map(document.getElementById("map"), {
    center: { lat: -34.397, lng: 150.644 },
    zoom: 8,
  });
  
  
  
  //EXTRAER LA FUNCION
   map.addListener('rightclick', function(event) {
     
     let coord = event.latLng.toJSON()
     
     if(click_top){
     		
     		if(click_top.lat < coord.lat){
        	
          click_bottom = click_top
          click_top = coord
        }else{
        
        	click_bottom = coord
        }       
     }

     if(click_top == null){
     		click_top = coord
     }   
     
     
     
     //DETECTAR SI EL CLICK ESTA DENTRO DE OTRO BOUNDIE
     //SI HAY UN VALOR YA EXISTENTTE, HACER QUE SE DIBUJE UN BOUNDI PERMAMENTE HASTA QUE SE HAGA CLICK O SE CANCELE
     //BORRAR SELECCION SI SE APRETA ESC
     
     if(click_top && click_bottom){
     		dibujar_rectangulo(click_top, click_bottom)
        
        click_top = null
        click_bottom = null
     }
     // Crea un marcador en la posición donde se presionó el botón
   });  
}

initMap();

//SOLAMENTE PERMITIR SELECCIONAR LUEGO DE QUE EL MAPA ESTA CREADO



//SELECCION PREVIO AL ALMACENAR
function eliminar_seleccion(){}

//ELIMINAR RECTANGULO
function eliminar_almacenado(){}

function sobreposicion_boundies(coord){
//HACER LA MARCA UN OBJETO PUBLICO Y QUE ESTO LO ELIMINTE
     for(var bound in boundies){
       if(sobreposicion_de_boundies(coord, bound)){
         return false
       }
     }
     return true
}
function dibujar_rectangulo(top,bottom){

  const rectangle = new google.maps.Rectangle({
      strokeColor: "#FF0000",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#FF0000",
      fillOpacity: 0,
      map,
      bounds: {
        north: top.lat,
        south: bottom.lat,
        east: bottom.lng,
        west: top.lng,
      },
    });
  }
function marcar_ubicacion(coord){


}
function almacenar_seleccion(){}

//DETECTAR SI SELECCION ESTA DENTRO DE OTRO
function sobreposicion_de_boundies(){}

//RECORRER LISTADO Y VER CUANDO QUEDO UN ESPACIO ENTRE 2 O MAS BOUNDIES
function normalizar_boundies(){}
// [END maps_map_simple]

