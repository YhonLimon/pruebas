var glMV    = null;
var glSlide = 0;
var glPresentation = null;
var glUi = null;
var glEditor = false;
var glSlot   = 0;
var glVideos = [];
var glBar = null;
var glGoal = null;
var glId = "";
var glBar = null;
var glLoader = null;
var glLoaderBar = null;
var glIsLoading = false;
var glReq = null;
var glInFullScreen = false;

var lcArScale = null;

(() => {

  glMV = document.querySelector('#mv');
  glUi = document.querySelector('#ui');
   
  glLoader = $("#loader");
  glLoaderBar = $("#loaderBar");
  glLoader.hide();
  
  glMV.setAttribute('camera-target', '100m 100m 100m 2m');
  
  glMV.addEventListener("scene-graph-ready", (ev) => 
  { 
      postLoad();
  });
  
  glMV.addEventListener("progress", (ev) => 
  {
	  var p = ev.detail.totalProgress * 100;
	 
	  glLoaderBar.css('width',p+'%'); 
      glLoaderBar.html(Math.round(p)+'%');
  });

  glMV.addEventListener("ar-status", (ev) => 
  {
	  if (event.detail.status === 'session-started')
	     {
		  lcArScale = glMV.scale;
          glMV.scale = '0 0 0';
         }
	  else if (null != lcArScale) glMV.scale = lcArScale;
	  
	  closePopup();
  });
  
  handlePanning();
  
  setInterval(function()
  {
	  for (var v in glVideos) 
	      {  
            if (glVideos[v].vid != null) 
			   {
				var o = glVideos[v].ent.css("opacity");
				if (o < 0.5 && glVideos[v].opacity >= 0.5)
				   {
					glVideos[v].stat = glVideos[v].vid.paused;
					glVideos[v].vid.pause();
				   }
				else if (o >= 0.5 && glVideos[v].opacity < 0.5)
				        {
						 if (false == glVideos[v].stat) glVideos[v].vid.play();
						} 
				glVideos[v].opacity = o;
			   }
		  }
	
	  if (null != glGoal)
	     {
		  var o = glMV.getCameraOrbit();
		  if (Math.abs(o.phi - glGoal.phi) < 0.018 && Math.abs(o.theta - glGoal.theta) < 0.018 && Math.abs(o.radius - glGoal.radius) < 0.005)
		     {
			  doActions(glGoal.actions);
			  glGoal = null;
		     }
		 }
  }, 50);
  
})();

function postLoad()
{
	glBar = glMV.shadowRoot.querySelector('#default-progress-bar > .bar');
		  
	glIsLoading = false;
	glLoader.hide();
	  
	if (null == glPresentation) return;
	
	//glMV.setAttribute('max-camera-orbit', 'Infinity 157.5deg auto');
	//glMV.setAttribute('min-camera-orbit', '-Infinity 22.5deg auto');
	//glMV.setAttribute('min-field-of-view', '0deg');
	//glMV.setAttribute('max-field-of-view', '180deg');
	  
   	glMV.removeAttribute('camera-orbit');
	glMV.removeAttribute('camera-target');

    if (glPresentation.slides.length > 0 && glPresentation.slides[glSlide].model.length > 0)
	   {
  	    glMV.setAttribute('camera-target', 'auto auto auto');
	    glMV.setAttribute('camera-orbit', 'auto auto auto');
		
		if (glPresentation.slides[glSlide].control !== undefined && glPresentation.slides[glSlide].control != null) setControl(glPresentation.slides[glSlide].control);
        else setControl(glPresentation.control);
	   }
	else {
  	      glMV.setAttribute('camera-target', '100m 100m 100m');
	     }

    show2D();
	setMeterials(); 

    $('#proj').trigger('model');	
}

function setControl(cont)
{
	glMV.removeAttribute('camera-controls');
	glMV.removeAttribute('disable-zoom');
	glMV.removeAttribute('min-camera-orbit');
	glMV.removeAttribute('max-camera-orbit');
	glMV.removeAttribute('min-field-of-view');
	glMV.removeAttribute('max-field-of-view');
	
	if (false == cont.allow) return;
    glMV.setAttribute('camera-controls', '');
	
	if (false == cont.zoom.allow) glMV.setAttribute('disable-zoom', '');
	else {
		  glMV.setAttribute('min-field-of-view', cont.zoom.min);
		  glMV.setAttribute('max-field-of-view', cont.zoom.max);
	     }
		 
    glMV.setAttribute('min-camera-orbit', cont.azimuth.min+' '+cont.polar.min+' '+cont.distance.min);
    glMV.setAttribute('max-camera-orbit', cont.azimuth.max+' '+cont.polar.max+' '+cont.distance.max);
}

function show2D()
{
	  glMV.innerHTML = ""; 
	  if (null == glPresentation || glPresentation.slides.length < 1) return;

	  buildHotSpots(glPresentation.slides[glSlide].hotspots);	  
	  buildUis(glPresentation.slides[glSlide].uis);
	  setNavigation(glPresentation.navigation, glPresentation.slides[glSlide].activateAr);
	  
	  if (true == glPresentation.slides[glSlide].activateAr) buildAr();
	  
	  doActions(glPresentation.slides[glSlide].onStart);
}

function buildAr()
{
	glMV.innerHTML += '<button slot="ar-button"></button>'; 
	glMV.innerHTML += '<div id="ar-prompt"><img src="./images/hand.png"></div>';
	
	glMV.setAttribute('ar', '');
	if (false == glPresentation.slides[glSlide].zoomAr) glMV.setAttribute('ar-scale', 'auto');
	else glMV.setAttribute('ar-scale', 'fixed');
	
	glMV.setAttribute('ios-src', glPresentation.slides[glSlide].usdz);
	
	if (glPresentation.slides[glSlide].usdz.length < 1) glMV.removeAttribute('ios-src');
	else glMV.setAttribute('ios-src', '../assets/'+glId+glPresentation.slides[glSlide].usdz);
}

function setEnvironmentImage(env)
{
	if (env.image.length < 1)
	   {
		glMV.removeAttribute('skybox-image');
		glMV.removeAttribute('environment-image');
	   }
	else {
		  if ("true" == env.skybox) 
		     {
			  glMV.removeAttribute('environment-image'); 
			  glMV.setAttribute('skybox-image', './assets/'+glId+env.image);
	         }
		  else {
			    glMV.removeAttribute('skybox-image');
				glMV.setAttribute('environment-image', './assets/'+glId+env.image);
		       }
	     }
}

function setEnvironment(env)
{
	setEnvironmentImage(env);
	
	glMV.style.background = 'linear-gradient('+env.bgColorTop+','+env.bgColorBottom+')';
	glMV.setAttribute('exposure', env.exposure);
    glMV.setAttribute('shadow-intensity', env.shadowIntensity);
    glMV.setAttribute('shadow-softness', env.shadowSoftness);
}

function setModel(path)
{
	glMV.setAttribute('src', '');
	
    glIsLoading = true;
	glLoader.show();
	
	if (path == null || path.length < 1) glMV.setAttribute('src', glOprDir+'empty.glb');
	else {
	      var src = '../assets/'+glId+path;
		  if (src === glMV.src) postLoad();
		  else glMV.setAttribute('src', src);
	     }
}

function ShowSlide()
{
   glMV.innerHTML = "";
   glUi.innerHTML = "";
   
   glMV.removeAttribute('ar');
   
   $("#nav").html('<div class="w3-tiny w3-display-bottommiddle w3-center w3-text-'+glPresentation.navigation.color+'" style="pointer-events:auto;"><a href="https://www.slide3d.com" target="_blank">Powered by Slide3D</a></div>');
   
   glVideos = []; 
 
   if (typeof(glPresentation.slides) === 'undefined' || glPresentation.slides.length <= glSlide)
      {	   
       glMV.setAttribute('src', glOprDir+'empty.glb');
	   glMV.style.background = 'linear-gradient(#245A94,#454545)';
	   
       return;
      }
	  
   var slide = glPresentation.slides[glSlide];
   
   if (slide.activateAr === undefined) slide.activateAr = false;
   if (slide.zoomAr === undefined) slide.zoomAr = false;
   if (slide.usdz === undefined) slide.usdz = "";
   
   setModel(slide.model);
   
   if (true == slide.overwriteEnvironment) setEnvironment(slide.environment);
   else setEnvironment(glPresentation.environment);


   $('#proj').trigger('slide');

   //if (true === slide.autoplay)   glMV.setAttribute('autoplay', true);    else glMV.removeAttribute("autoplay");
   //if (true === slide.autoRotate) glMV.setAttribute('auto-rotate', true); else glMV.removeAttribute("auto-rotate");
}


function Update(ev)
{
   console.log('ddd');	
}

function LoadPresentation(path)
{
    glSlide = -1;

	if (path == null)
	   {
		$.get(glOprDir+"new.json", function(data, status)
             {
	          glPresentation = data;
              if (true == glEditor) buildProjectTab('present');
	          glMV.setAttribute('src', glOprDir+'empty.glb');
			  glMV.setAttribute('camera-target', '100m 100m 100m 2m');
             });
	   }
	else {
		  $.get("getProject.php?path="+path, function(data, status)
               {
				glSlide = 0;
	            glPresentation = data;
				if (glPresentation.control === undefined || glPresentation.control == null)
				   {
					glPresentation.control = defaultControl();
				   }
	            if (true == glEditor)
				   {
					loadStyle();
					buildProjectTab('present');
				   }
	            ShowSlide();
				
				$("#userCss").html(data);
               });
	     }
		 


}

function ShowPresentation(id, slideNum)
{
	glPresentation = null;
	glSlide = -1;
	
	$.get(glOprDir+"presentation.php?cmd=show&id="+id, function(data, status)
         {
	      if (data.startsWith('{ "res"='))
             {
             } 
          else {
	 		    glPresentation = JSON.parse(data);
				glId = glPresentation.user;
			    if (glPresentation.control === undefined || glPresentation.control == null)
				   {
				    glPresentation.control = defaultControl();
				   }

				$.get(glOprDir+"setProject.php?id="+glId, function(data, status)
				     {
				      if (glPresentation.slides.length > slideNum)
				         {
					      glSlide = slideNum;
						  					
				          ShowSlide();
				         }
					  $("#userCss").html(data);
					 });
		       }
		 });
}


function setHotSpot(h)
{
    var e = $("#"+h.id);
    if (e.length < 1) return;
	
    if (h.type == "dot") e.attr('class', "HotspotDot");	
    else e.attr('class', "Hotspot");
    e.attr('data-position', h.pos);
    e.attr('data-normal', h.normal);
	
    if (h.annotation.type == 'n') e.attr('data-visibility-attribute', "hidden");
	else e.attr('data-visibility-attribute', "visible");
	
	if (typeof glVideos[h.id] != 'undefined') glVideos[h.id].vid = null;
	
	var cls = '';
	var style = h.annotation.style;
	if (h.annotation.class !== undefined && h.annotation.class.length > 0)
	   {
		 //style = '';
		 cls = ' class="'+h.annotation.class+'"';
	   }
	if (h.annotation.position !== undefined) style += buildPosition(h.annotation.position)+'position:absolute;';
	
	if (h.annotation.type == 't') 
	   {
		var txt = setParams(h.annotation.text);
		
		if (txt.length < 1) e.html('<div id="'+h.id+'-ano" style="'+style+'"'+cls+'><i>&lt;hotspot&gt;</i></div>');
		else {
			  e.html('<div id="'+h.id+'-ano" style="'+style+'"'+cls+'>'+txt+'</div>');
		     }
	   }
	else if (h.annotation.type == 'i')
	        {
			 if (h.annotation.image.length < 1) e.html('<img id="'+h.id+'-ano" src="'+glOprDir+'image.jpg" style="'+style+'"'+cls+'></img>');	
			 else e.html('<img id="'+h.id+'-ano" src="./assets/'+glId+h.annotation.image+'" style="'+style+'"'+cls+'></img>');
		    }
	else if (h.annotation.type == 'v')
	        {
			 if (h.annotation.video.length < 1) e.html('<img id="'+h.id+'-ano" src="'+glOprDir+'movie.jpg" style="'+style+'"'+cls+'></img>');	
			 else {
				   e.html('<video id="'+h.id+'-ano" src="./assets/'+glId+h.annotation.video+'" style="'+style+'" controls'+cls+'></video>');
				   glVideos[h.id] = {};
				   glVideos[h.id].vid  = document.getElementById(h.id+'-ano');
				   glVideos[h.id].ent  = e;
				   glVideos[h.id].opacity = e.css("opacity");
				   glVideos[h.id].stat = glVideos[h.id].vid.paused;
			      }
		    } 
						
}

function drawHotspotLine(hs)
{
	    var e = $("#"+hs.id);
		var t = e.html();
				
		var e2 =  $("#"+hs.id+"-ano");
		
		var o1 = e.offset();
		var w1 = e.width();
		var h1 = e.height();
		var o2 = e2.offset();
		var w2 = e2.width();
		var h2 = e2.height();
		
		var w = (o2.left+(w2/2)) - (o1.left+(w1/2));
		var h = (o2.top+(h2/2)) - (o1.top+(h1/2));
		
		var sx = 0;
		var sy = 0;
		
		if (w < 0) sx = -100;
        if (h < 0) sy = -100;
		
		var x1 = 0;
		var y1 = 0;
		var x2 = Math.abs(w)-w2/2;
		var y2 = Math.abs(h)-h2/2;
		
		if (w < 0) { x1 = Math.abs(w); x2 = 0; }
		if (h < 0) { y1 = Math.abs(h); y2 = 0; }
				
	    x1 = w1/2 || 1;
		y1 = h1/2 || 1;
	    x2 = o2.left+(w2/2)-o1.left;
		y2 = o2.top+(h2/2)-o1.top;
		
		var a = { x:x1, y:y1 };
		var b = { x:x2, y:y2 };
		var p = { x:0, y:0 };
		
		var r = getProjectedPointOnLine(p, a, b);
		if (r.t < 0)
		   {
		    p = { x:w1, y:h1 };
		    r = getProjectedPointOnLine(p, a, b);
           }
		x1 = r.x; y1 = r.y;   
		   
		p = { x:o2.left-o1.left, y:o2.top-o1.top };
		r = getProjectedPointOnLine(p, a, b);
        if (r.t > 1)
		   {
		    p = { x:o2.left-o1.left+w2, y:o2.top-o1.top+h2 };
		    r = getProjectedPointOnLine(p, a, b);
		   }
		x2 = r.x; y2 = r.y;
		
		if (h < 0) { y1 = Math.abs(h)-y1; y2 = Math.abs(h)+y2; } 
		if (w < 0) { x1 = Math.abs(w)-x1; x2 = Math.abs(w)+x2; } 
		
        t += '<svg height="'+Math.abs(h)+'" width="'+Math.abs(w)+'" style="pointer-events:none; transform: translate('+sx+'%, '+sy+'%);"><line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" style="stroke:'+hs.annotation.lineColor+';stroke-width:'+hs.annotation.lineStroke+'" /></svg>';
        e.html(t); 
}


function buildHotSpots(hs)
{
	glMV.innerHTML = "";
	
	glSlot = 1;
	for (var i = 0; i < hs.length; i++)
	    {
		 hs[i].active = true;
		 hs[i].slot   = glSlot++;
	     glMV.innerHTML += '<button onclick="doActionsHotspot('+i+');" id="'+hs[i].id+'" slot="hotspot-'+hs[i].slot+'"></button>';
		 setHotSpot(hs[i]);
        }
		
	setTimeout(function()
	{
	 for (var i = 0; i < hs.length; i++)
	     {
		  if (true == hs[i].annotation.line)  drawHotspotLine(hs[i]);
         }			 
	}, 200);
}

function setUi(ui)
{
    var e = $("#"+ui.id);
    if (e.length < 1) return;
	
	var cls = '';
	var style = 'pointer-events: auto; '+ui.style;
	if (ui.class !== undefined && ui.class.length > 0)
	   {
		 cls = ' class="'+ui.class+'"';
	   }
	if (ui.position !== undefined) style += buildPosition(ui.position)+'position:absolute;';
		 	
	if (ui.type == 't') 
	   {
		var txt = setParams(ui.text);
		if (txt < 1) e.html('<div style="'+style+'"'+cls+'><i>&lt;ui element&gt;</i></div>');
		else {
			  e.html('<div style="'+style+'"'+cls+'>'+txt+'</div>');
		     }
	   }
	else if (ui.type == 'i')
	        {
			 e.attr("style", "");
			 if (ui.image.length < 1) e.html('<img src="'+glOprDir+'image.jpg" style="'+style+'"'+cls+'></img>');	
			 else e.html('<img src="./assets/'+glId+ui.image+'" style="'+style+'"'+cls+'></img>');
		    }
	else if (ui.type == 'v')
	        {
			 if (ui.video.length < 1) e.html('<img src="'+glOprDir+'movie.jpg" style="'+style+'"'+cls+'></img>');	
			 else e.html('<video id="'+ui.id+'-vid" src="./assets'+glId+ui.video+'" controls style="'+style+'"'+cls+' pointer-events:auto;"></video>');
		    }
}

function setNavigation(nav, useAr)
{
	 var txt = "";
	 
	 if (true == nav.showArrows)
	    {
		 var p = "w3-display-"+nav.arrowsPosition;
		 p = p.replace("middle", "");
		 
		 if (glSlide > 0) txt += '<a href="javascript:glSlide--; ShowSlide();" class="'+p+'left w3-margin" style="pointer-events:auto;"><i class="w3-xlarge fa fa-angle-left w3-text-'+nav.color+'"></i></a>';
		 if (glSlide < (glPresentation.slides.length-1)) txt += '<a href="javascript:glSlide++; ShowSlide();" class="'+p+'right w3-margin" style="pointer-events:auto;"><i class="w3-xlarge fa fa-angle-right w3-text-'+nav.color+'"></i></a>';
		}
		
	 if (true == nav.showPagination)
	    {
		 var p = "w3-display-"+nav.paginationPosition;
		 p = p.replace("middle", "");
		 
		 var str = '<div class="w3-xlarge w3-text-'+nav.color+' w3-margin-bottom w3-margin-top '+p+'middle" >';
		 for (var i = 0; i < glPresentation.slides.length; i++)
		     {
		      if (i == glSlide) str += '<span class="w3-'+nav.paginationType+' ind w3-border w3-transparent w3-'+nav.color+' w3-border-'+nav.color+' w3-small" style="margin:2px; pointer-events:auto;">';
              else str += '<span class="w3-'+nav.paginationType+' ind w3-border w3-transparent w3-hover-'+nav.color+' w3-text-'+nav.color+' w3-border-'+nav.color+' w3-small" onclick="glSlide='+i+'; ShowSlide();" style="margin:2px; pointer-events:auto;">';
              if (false === nav.paginationNumbering) str += '&nbsp;'; else str += (i+1);
              str += '</span>';
		     }
		 str += '</div>';
		 txt += str;
		} 
		
	 if (true == useAr)
	    {
		 var ac = '<div class="w3-xlarge w3-text-'+nav.color+' w3-margin-top  w3-margin-bottom w3-display-bottomleft" style="transform:translateX(calc(+100% + 40px));">';	
		 ac += '<span id="ar" class="w3-'+nav.paginationType+' ind w3-border w3-transparent w3-hover-'+nav.color+' w3-text-'+nav.color+' w3-border-'+nav.color+' w3-small" onclick="glMV.activateAR();" style="margin:2px; pointer-events:auto; padding: 3 6">AR</span>';
         ac += '</div>';
	     txt += ac;
		}

     var ic = '<div class="w3-xlarge w3-text-'+nav.color+' w3-margin-top  w3-margin-bottom w3-display-bottomright" style="transform:translateX(calc(-100% - 40px));">';
	 if (true == nav.showFullScreen)
	    {
		 var fsi = '<i class="fa fa-expand"></i>';
		 if (true == glInFullScreen) fsi = '<i class="fa fa-compress"></i>';
		 ic += '<span id="fscr" class="w3-'+nav.paginationType+' ind w3-border w3-transparent w3-hover-'+nav.color+' w3-text-'+nav.color+' w3-border-'+nav.color+' w3-small" onclick="toggleFullscreen();" style="margin:2px; pointer-events:auto; padding: 3 6">'+fsi+'</span>';
		} 
	 ic += '</div>';
	 txt += ic;
		
	 txt += '<div class="w3-tiny w3-display-bottommiddle w3-text-'+nav.color+'" style="pointer-events:auto;"><a href="https://www.slide3d.com" target="_blank">Powered by Slide3D</a></div>';
	
     if (true == nav.showCredits)
  	    {
		 txt += '<div class="w3-tiny w3-display-topmiddle w3-text-'+nav.color+'" style="pointer-events:auto;"><a href="javascript:showCredits();">Ceredits</a></div>';
		} 
	 
	 $("#nav").html(txt);
}

function buildUis(uis)
{
	var str = "";
	for (var i = 0; i < uis.length; i++) str += '<div id="'+uis[i].id+'" onclick="doActionsUi('+i+');"  style="pointer-events: auto;"></div>';

	glUi.innerHTML = str;
	
	for (var u = 0; u < uis.length; u++) setUi(uis[u]);	
}

function setParams(str)
{
	var txt = str.replaceAll("{nl}", "\n")
	
	txt = txt.replaceAll('{assets}', './assets/'+glId);
	
	return txt;
}

function showPopup(id)
{
	var popups = glPresentation.slides[glSlide].popups;
	
	for (var i = 0; i < popups.length; i++)
	    {
		 if (popups[i].id == id)
		    {
			 var cls = '';
	         var style = popups[i].style;
	         if (popups[i].class !== undefined && popups[i].class.length > 0)
	            {
		         cls = ' class="'+popups[i].class+'"';
	            }
	         if (popups[i].position !== undefined) style += buildPosition(popups[i].position)+'position:absolute;';	
				
			 var e = $("#popup");
	
			 if (popups[i].type == 't') 
	            {
				 var txt = setParams(popups[i].text);
				 
		         if (txt.length < 1) e.html('<div id="popup-dlg" style="'+style+'"'+cls+'"><i>&lt;Popup&gt;</i></div>');
		         else e.html('<div id="popup-dlg" style="'+style+'"'+cls+'">'+txt+'</div>');
	            }
	         else if (popups[i].type == 'i')
	                 {
			          if (popups[i].image.length < 1) e.html('<img id="popup-dlg" src="'+glOprDir+'image.jpg" style="'+style+'"'+cls+'"></img>');	
			          else e.html('<img id="popup-dlg" src="./assets/'+glId+popups[i].image+'" style="'+style+'"'+cls+'"></img>');
		             }
	         else if (popups[i].type == 'v')
	                 {
			          if (popups[i].video.length < 1) e.html('<img id="popup-dlg" src="'+glOprDir+'movie.jpg" style="'+style+'"'+cls+'"></img>');	
			          else e.html('<video id="popup-dlg" src="./assets.php/'+glId+popups[i].video+'" controls style="'+style+'"'+cls+'"></video>');
		             }
	         else if (popups[i].type == 'h')
	                 {
			          if (popups[i].html.length < 1) e.html('<img id="popup-dlg" src="'+glOprDir+'html.jpg" style="'+style+'"'+cls+'"></img>');	
			          else {
						    e.html('<div id="popup-dlg" style="'+style+'"></div>');
							$.get('./assets./'+glId+popups[i].html, function(data, status)
	                             {
		                          $("#popup-dlg").html(data);
	                             });
					       }
		             }
			 e.show();
			 i = popups.length;
			 
			 setTimeout(function()
			 {
				  var d = $("#popup-dlg");
			      var p = d.offset();
				  var w = d.width();
				  var h = d.height();
				  if (p.left < 0) p.left = 5;
				  else if ((p.left+w) > window.innerWidth) p.left = window.innerWidth - 15 - w;
				  if (p.top < 0) p.top = 5;
				  else if ((p.top+h) > window.innerHeight) p.top = window.innerHeight - 15 - h;
				  
				  d.offset({top:p.top, left:p.left});
			 }, 250);

             $("#popup-dlg").click(function(e) { e.stopPropagation(); });			 
			} 
		}
}

function closePopup()
{
	var e = $("#popup");
	e.html("");
	e.hide();
}

function flyToView(id)
{
	var vs = glPresentation.slides[glSlide].views;
	
	for (i = 0; i < vs.length; i++)
	{
		if (vs[i].id == id)
		{
			var co = vs[i].yaw+'deg '+ vs[i].pitch+'deg '+vs[i].distance+'m';
			glMV.removeAttribute('camera-orbit');
			glMV.removeAttribute('camera-target');
			glMV.setAttribute('camera-orbit', co);
			
			glGoal = { phi:vs[i].pitch*Math.PI/180, theta:vs[i].yaw*Math.PI/180, radius:vs[i].distance, actions:vs[i].onSet };
			
			if (vs[i].cov != "none")
			   {
				var hs = glPresentation.slides[glSlide].hotspots;
				for (var h = 0; h < hs.length; h++)
				    {
					 if (hs[h].id == vs[i].cov) 
					    {
						 glMV.setAttribute('camera-target', hs[h].pos);
					    }
					}
			   }
			
			i = vs.length;
		}
	}
}

function doActions(as)
{
	for (var i = 0; i < as.length; i++)
	    {
		  var a = as[i].action;
			
		  if (a == "fly") flyToView(as[i].view);
		  else if (a == "show") showPopup(as[i].popup);
		  else if (a == "play") glMV.setAttribute('animation-name', as[i].animation);
		  else if (a == "open") 
		          {
			       var win = window.open(as[i].url, '_blank');
                   win.focus();
				  }
		 else if (a == "texture")
		 {
		  var m = glMV.model.materials[as[i].ind].pbrMetallicRoughness;
		  m.baseColorTexture.texture.source.setURI('./assets./'+glId+as[i].url); 
		 }
	    }
}

function setTexture(i, url)
{
	var m = glMV.model.materials[i].pbrMetallicRoughness;
    m.baseColorTexture.texture.source.setURI(url); 
}

function doActionsHotspot(i)
{
	doActions(glPresentation.slides[glSlide].hotspots[i].annotation.onClick);
}

function doActionsUi(i)
{
	doActions(glPresentation.slides[glSlide].uis[i].onClick);
}

function setMeterials()
{
	if (glPresentation.slides[glSlide].materials === undefined || null == glPresentation.slides[glSlide].materials) return;
	
	for (var i = 0; i < glPresentation.slides[glSlide].materials.length; i++)
	    {
		 var mat =  glPresentation.slides[glSlide].materials[i];
		 
		 if (false == mat.use || mat.ind >= glMV.model.materials.length) continue;
		 
		 var m = glMV.model.materials[mat.ind].pbrMetallicRoughness;
		 
		 if (true == mat.useColor) 
		    {  
		     var c = HexToColor(mat.color); 
			 var color = c.split(',').map(numberString => parseFloat(numberString));
             m.setBaseColorFactor(color);
            }			 
		
         if (true == mat.useMetal)   m.setMetallicFactor(mat.metal); 
		 if (true == mat.useRough)   m.setRoughnessFactor(mat.rough); 
		 if (true == mat.useTexture) m.baseColorTexture.texture.source.setURI('./assets./'+glId+mat.texture); 
		 if (true == mat.useMap)     m.metallicRoughnessTexture.texture.source.setURI('./assets./'+glId+mat.map);
	    }		
}

function activateAr()
{
}

function handlePanning()
{
   const tapDistance = 2;
   let   panning = false;
   let   panX, panY;
   let   startX, startY;
   let   lastX, lastY;
   let   metersPerPixel;

   const startPan = () => 
   {
    const orbit = glMV.getCameraOrbit();
    const {theta, phi, radius} = orbit;
    const psi = theta - glMV.turntableRotation;
    metersPerPixel = 0.75 * radius / glMV.getBoundingClientRect().height;
    panX = [-Math.cos(psi), 0, Math.sin(psi)];
    panY = [-Math.cos(phi) * Math.sin(psi), Math.sin(phi),-Math.cos(phi) * Math.cos(psi)];
    glMV.interactionPrompt = 'none';
  };

  const movePan = (thisX, thisY) => 
  {
    const dx = (thisX - lastX) * metersPerPixel;
    const dy = (thisY - lastY) * metersPerPixel;
    lastX = thisX;
    lastY = thisY;

    const target = glMV.getCameraTarget();
    target.x += dx * panX[0] + dy * panY[0];
    target.y += dx * panX[1] + dy * panY[1];
    target.z += dx * panX[2] + dy * panY[2];
    glMV.cameraTarget = `${target.x}m ${target.y}m ${target.z}m`;

    // This pauses turntable rotation
    glMV.dispatchEvent(new CustomEvent('camera-change', {detail: {source: 'user-interaction'}}));
  };

  const recenter = (pointer) => 
  {
    panning = false;
    if (Math.abs(pointer.clientX - startX) > tapDistance || Math.abs(pointer.clientY - startY) > tapDistance) return;
    const rect = glMV.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const hit = glMV.positionAndNormalFromPoint(x, y);
    glMV.cameraTarget = hit == null ? 'auto auto auto' : hit.position.toString();
  };

  const onPointerUp = (event) => 
  {
    const pointer = event.clientX ? event : event.changedTouches[0];
    if (Math.abs(pointer.clientX - startX) < tapDistance &&  Math.abs(pointer.clientY - startY) < tapDistance) { recenter(pointer); }
    panning = false;
  };

  glMV.addEventListener('mousedown', (event) => 
  {
    startX = event.clientX;
    startY = event.clientY;
    panning = event.button === 2 || event.ctrlKey || event.metaKey || event.shiftKey;
    if (!panning) return;

    lastX = startX;
    lastY = startY;
    startPan();
    event.stopPropagation();
  }, true);

  glMV.addEventListener('touchstart', (event) => 
  {
    startX = event.touches[0].clientX;
    startY = event.touches[0].clientY;
    panning = event.touches.length === 2;
    if (!panning) return;

    const {touches} = event;
    lastX = 0.5 * (touches[0].clientX + touches[1].clientX);
    lastY = 0.5 * (touches[0].clientY + touches[1].clientY);
    startPan();
  }, true);

  glMV.addEventListener('mousemove', (event) => 
  {  
    if (!panning) return;

    movePan(event.clientX, event.clientY);
    event.stopPropagation();
  }, true);

  glMV.addEventListener('touchmove', (event) => 
  {
    if (!panning || event.touches.length !== 2) return;

    const {touches} = event;
    const thisX = 0.5 * (touches[0].clientX + touches[1].clientX);
    const thisY = 0.5 * (touches[0].clientY + touches[1].clientY);
    movePan(thisX, thisY);
  }, true);

  self.addEventListener('mouseup', (event) => 
  {
    recenter(event);
  }, true);
  
  self.addEventListener('touchend', (event) => 
  {
    if (event.touches.length === 0) {
      recenter(event.changedTouches[0]);
    }
  }, true);
}
