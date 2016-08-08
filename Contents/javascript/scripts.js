var orbit;
var points;
var renderer;
var alphas;
var dotGeometry;
var scene;
var camera;
var material;
var uniforms;
	
	
function updateProbMap(dotGeometry){
	var colors = [];
	for( var i = 0; i < dotGeometry.vertices.length; i++ ) {
	    // random color
	    colors[i] = new THREE.Color();
	    colors[i].setHSL( Math.random(), 1.0, 0.5 );
	}
	//new TWEEN.Tween( points.material ).to( { opacity: 0 }, 1000 ).start();
	
	dotGeometry.colors = colors;
	dotGeometry.colorsNeedUpdate = true;
		
}



$(window).load(function() {
		// Animate loader off screen
	$('#loading').fadeOut("slow");
	$('#slider').value = 10;
	
	
	var gui = new dat.GUI();9
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 35, window.innerWidth/window.innerHeight, 0.1, 4000 );
	camera.position.z = 10;

	renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.getElementById("bg1").appendChild( renderer.domElement );

	orbit = new THREE.OrbitControls( camera, renderer.domElement );
	orbit.enableZoom = false;
	orbit.minDistance = 10;
	orbit.maxDistance = 170;

	// Create a sphere geometry
	
	dotGeometry = new THREE.SphereBufferGeometry( 80, 30, 30 );
	dotGeometry.dynamic = true;
	
	var vertexCount = dotGeometry.attributes.position.count;
	
	var alphas = new Float32Array( vertexCount);
	
	
	for( var i = 0; i < vertexCount; i++ ) {
		alphas[ i ] = Math.random();
	}
	
	dotGeometry.addAttribute( 'alpha', new THREE.BufferAttribute( alphas, 1 ) );

	uniforms = {
	    color: { type: "c", value: new THREE.Color( Math.random() * 0xffffff ) },
	};
		
 	// point cloud material
    material = new THREE.ShaderMaterial( {
        vertexShader:   document.getElementById( 'vertexshader' ).textContent,
        fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
		scale: { type: 'f', value: window.innerHeight / 2 },
        transparent:    true,
		uniforms:       uniforms

    });
		
	points = new THREE.Points( dotGeometry, material );
	scene.add(points);
	
	
	//setInterval(function() {updateProbMap(dotGeometry)}, 4000);
	
	animate();
	
	window.addEventListener( 'resize', function () {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, window.innerHeight );
	}, false );
	
});

function animate() {
    requestAnimationFrame( animate );
    render();
}

var resetColorCount = 0;
var resetColorThresh = 120;
function render() {
    var alphas = points.geometry.attributes.alpha;
	
    var count = alphas.count;
	resetColorCount++;
    
    for( var i = 0; i < count; i ++ ) {
        // dynamically change alphas
        alphas.array[ i ] *= 0.98;
        
        if ( alphas.array[ i ] < 0.01 ) {  // Reset the alpha and give it a new color
            alphas.array[ i ] = 1.0;
        }
    }
	
	if(resetColorCount > resetColorThresh){ // new random color for all the points
		uniforms.color.value = new THREE.Color( Math.random() * 0xffffff );
		uniforms.color.needsUpdate = true;
		resetColorCount = 0;
	}
	
    points.rotation.x += 0.0015;
    points.rotation.y += 0.0015;
	   
    alphas.needsUpdate = true; 
	//dotGeometry.attributes.color.needsUpdate = true;

    renderer.render( scene, camera );


}



var oldZoom = 10;
function changeZoom(newZoom){
	var zoomDelta = newZoom - oldZoom;
	orbit.zoomFunc(zoomDelta);
	oldZoom = newZoom;
}


