

function lineBetween(e1, e2, ln)
{
	var x1 = e1.offset().left;
	var y1 = e1.offset().top;
	var w1 = e1.offset().width/2;
	var h1 = e1.offset().height/2;

	var x2 = e2.offset().left;
	var y2 = e2.offset().top;
	var w2 = e2.offset().width/2;
	var h2 = e2.offset().height/2;
	
	x1 += w1;
	y1 += h1;
	x2 += w2;
	y2 += h2;
	
	var vx = x2 - x1;
	var vy = y2 - y1;
	
	
	  var a2 = $("#id2").offset();
	  var ln = $("#l1");
	  
	  var o = $("#id1").css("opacity");
	  var t = $("#id2").css("opacity");
	  
	  if (t < o) o = t;
	  		  
	  ln.attr("x1", a1.left);
	  ln.attr("y1", a1.top);
	  ln.attr("x2", a2.left);
	  ln.attr("y2", a2.top);
	  
	  ln.css("opacity", o);
}
/*
var elem = document.documentElement;

function openFullscreen() 
{
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.mozRequestFullScreen) { 
    elem.mozRequestFullScreen();
  } else if (elem.webkitRequestFullscreen) { 
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { 
    elem.msRequestFullscreen();
  }
}
*/
function closeFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
}

function showMessage(wide, header, msg)
{
	$("#popupHeader").html(header);
	$("#popupContent").html(msg);
	$("#popupContainer").width(wide); 
	$("#popupMessage").show();
}


function pointOnLine(x1, y1, x2, y2, x, y) 
{

  if (x1 == x2 && y1 == y2) x1 -= 0.00001;

  var Unumer = ((x - x1) * (x2 - x1)) + ((y - y1) * (y2 - y1));
  var Udenom = Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2);
  var U = Unumer / Udenom;

  var px = x1 + (U * (x2 - x1));
  var py = y1 + (U * (y2 - y1));
  
  var res = { x:px, y:py, r:U };

  return res;
}

function project( p, a, b ) 
{    
    var atob = { x: b.x - a.x, y: b.y - a.y };
    var atop = { x: p.x - a.x, y: p.y - a.y };
    var len = atob.x * atob.x + atob.y * atob.y;
    var dot = atop.x * atob.x + atop.y * atob.y;
    var t = dot / len ;

    dot = ( b.x - a.x ) * ( p.y - a.y ) - ( b.y - a.y ) * ( p.x - a.x );
    
    return {
        point: {
            x: a.x + atob.x * t,
            y: a.y + atob.y * t
        },
        left: dot < 1,
        dot: dot,
        t: t
    };
}

function getProjectedPointOnLine(p, v1, v2)
{
  // get dot product of e1, e2
  var e1 = { x: v2.x-v1.x, y: v2.y-v1.y };
  var e2 = { x: p.x-v1.x, y: p.y-v1.y };
  
  var valDp = e1.x * e2.x + e1.y * e2.y; //dotProduct(e1, e2);
  // get length of vectors
  var lenLineE1 = Math.sqrt(e1.x * e1.x + e1.y * e1.y);
  var lenLineE2 = Math.sqrt(e2.x * e2.x + e2.y * e2.y);
  var cos = valDp / (lenLineE1 * lenLineE2);
  // length of v1P'
  var  projLenOfLine = cos * lenLineE2;
  var  t = projLenOfLine/lenLineE1;
  var p = { x: v1.x + t * e1.x,  y: v1.y + t * e1.y,  t:t  };
  return p;
}

function buildPosition(pos)
{
	var str = "";
	
	if (true == pos.left.use)      str += 'left:'+pos.left.val+pos.left.unit+';';
	if (true == pos.right.use)     str += 'right:'+pos.right.val+pos.right.unit+';';
	if (true == pos.top.use)       str += 'top:'+pos.top.val+pos.top.unit+';';
	if (true == pos.bottom.use)    str += 'bottom:'+pos.bottom.val+pos.bottom.unit+';';
	if (true == pos.width.use)     str += 'width:'+pos.width.val+pos.width.unit+';';
	if (true == pos.height.use)    str += 'height:'+pos.height.val+pos.height.unit+';';
	if (true == pos.minWidth.use)  str += 'min-width:'+pos.minWidth.val+pos.minWidth.unit+';';
	if (true == pos.maxWidth.use)  str += 'max-width:'+pos.maxWidth.val+pos.maxWidth.unit+';';
	if (true == pos.minHeight.use) str += 'min-height:'+pos.minHeight.val+pos.minHeight.unit+';';
	if (true == pos.maxHeight.use) str += 'max-height:'+pos.maxHeight.val+pos.maxHeight.unit+';';
	if (true == pos.transform.use) str += 'transform:'+pos.transform.val+';';
	
	return str;
}

function HexToColor(h)
{
  let r = 0, g = 0, b = 0;

  if (h.length == 4) 
     {
      r = "0x" + h[1] + h[1];
      g = "0x" + h[2] + h[2];
      b = "0x" + h[3] + h[3];
     } 
  else if (h.length == 7) 
          {
           r = "0x" + h[1] + h[2];
           g = "0x" + h[3] + h[4];
           b = "0x" + h[5] + h[6];
          }
  r = +(r / 255).toFixed(3);
  g = +(g / 255).toFixed(3);
  b = +(b / 255).toFixed(3);

  return r + "," + g + "," + b ;
}

var docElem = document.documentElement;

function openFullscreen() 
{
   if (docElem.requestFullscreen)            docElem.requestFullscreen();
   else if (docElem.webkitRequestFullscreen) docElem.webkitRequestFullscreen();
   else if (docElem.msRequestFullscreen)     docElem.msRequestFullscreen();
}

function closeFullscreen() 
{
   if (document.exitFullscreen)            document.exitFullscreen();
   else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
   else if (document.msExitFullscreen)     document.msExitFullscreen();
}

function toggleFullscreen()
{
	if (true == glInFullScreen) closeFullscreen();
	else openFullscreen()
}

document.addEventListener("fullscreenchange", function (event) 
{
    if (document.fullscreenElement) 
	   {
		glInFullScreen = true;
		$("#fscr").html('<i class="fa fa-compress"></i>');
	   }
	else {
		  glInFullScreen = false;
		  $("#fscr").html('<i class="fa fa-expand"></i>');
	     }
});

function showCredits()
{
	showMessage('30%', 'Credits', glPresentation.navigation.credits);
}

function defaultControl()
{
	var con = { allow:true, 
			    zoom:     { allow:true, min:'25deg', max:'auto' },
			    azimuth:  { min:'-Infinity', max:'Infinity' },
			    polar:    { min:'22.5deg', max:'157.5deg'},
			    distance: { min:'auto', max:'auto'}};
	
	return con;
}




