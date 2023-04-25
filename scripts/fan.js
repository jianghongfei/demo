var pausing = false;
var times = 1;
var mouse, INTERSECTED;
var tachometer, tooltip;

var components = [];
var camera, scene, renderer, control, orbit, raycaster;
var fan;

init();
animate();

function speedUp() {
  if (times < 10) {
    times += 1;

    updateTachometer();
  }
}

function speedDown() {
  if (times > 1) {
    times -= 1;

    updateTachometer();
  }
}

function updateTachometer() {
  if (!tachometer) {
    return;
  }
  if (times < 5) {
    var style = {
      color: "rgba(0, 0, 0, 1.0)",
      border: "rgba(0, 0, 0, 1.0)"
    };
  } else {
    var style = {
      color: "rgba(255, 0, 0, 1.0)",
      border: "rgba(255, 0, 0, 1.0)"
    };
  }
  tachometer.text(`转速：${times}x`, style);
}

function loadModels(scene, control) {
  var loader = new THREE.GLTFLoader().setPath("models/box/");
  loader.load(
    "scene.gltf",
    function(gltf) {
      gltf.scene.traverse(function(child) {
        if (child.isMesh) {
          // child.material.envMap = background;
          child.scale.set(10, 10, 10);
        }
      });

      let component = gltf.scene.children[0];
      component.name = "电机";
      scene.add(component);
      components.push(component);
      if (control) {
        control.attach(gltf.scene);
      }
    },
    undefined,
    function(e) {
      console.error(e);
    }
  );

  loader.load(
    "fan.gltf",
    function(gltf) {
      gltf.scene.traverse(function(child) {
        if (child.isMesh) {
          // child.material.envMap = background;
          child.scale.set(10, 10, 10);
          child.position.set(0, 16, 0);
        }
      });

      let component = gltf.scene.children[0];
      component.name = "叶片";
      scene.add(component);
      components.push(component);

      fan = component;
      if (control) {
        control.attach(gltf.scene);
      }
    },
    undefined,
    function(e) {
      console.error(e);
    }
  );
}

function initControl() {
  control = new THREE.TransformControls(camera, renderer.domElement);
  control.addEventListener("change", render);

  control.addEventListener("dragging-changed", function(event) {
    orbit.enabled = !event.value;
  });
  scene.add(control);

  window.addEventListener("resize", onWindowResize, false);

  window.addEventListener("keydown", function(event) {
    switch (event.keyCode) {
      case 81: // Q
        control.setSpace(control.space === "local" ? "world" : "local");
        break;

      case 17: // Ctrl
        control.setTranslationSnap(100);
        control.setRotationSnap(THREE.Math.degToRad(15));
        break;

      case 87: // W
        control.setMode("translate");
        break;

      case 69: // E
        control.setMode("rotate");
        break;

      case 82: // R
        control.setMode("scale");
        break;

      case 187:
      case 107: // +, =, num+
        control.setSize(control.size + 0.1);
        break;

      case 189:
      case 109: // -, _, num-
        control.setSize(Math.max(control.size - 0.1, 0.1));
        break;

      case 88: // X
        control.showX = !control.showX;
        break;

      case 89: // Y
        control.showY = !control.showY;
        break;

      case 90: // Z
        control.showZ = !control.showZ;
        break;

      case 32: // Spacebar
        control.enabled = !control.enabled;
        break;
    }
  });

  window.addEventListener("keyup", function(event) {
    switch (event.keyCode) {
      case 17: // Ctrl
        control.setTranslationSnap(null);
        control.setRotationSnap(null);
        break;
    }
  });
}

function init() {
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  //

  camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    1,
    1440
  );
  camera.position.set(100, 100, 100);
  camera.lookAt(0, 0, 0);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xa0a0a0);
  //scene.fog = new THREE.Fog(0xa0a0a0, 200, 1000);

  // ground
  var mesh = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(200, 200),
    new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;
  scene.add(mesh);

  var grid = new THREE.GridHelper(200, 20, 0x000000, 0x000000);
  grid.material.opacity = 0.2;
  grid.material.transparent = true;
  scene.add(grid);

  var light = new THREE.DirectionalLight(0xffffff, 2);
  light.position.set(1, 1, 1);
  scene.add(light);

  orbit = new THREE.OrbitControls(camera, renderer.domElement);
  orbit.update();
  orbit.addEventListener("change", render);

  // initControl();

  loadModels(scene, control);

  initIndicators();
  initTooltips();
}

function initTooltips() {
  raycaster = new THREE.Raycaster();
  // when the mouse moves, call the given function
  document.addEventListener("mousemove", onDocumentMouseMove, false);

  this.tooltip = new Indicator("");
  scene.add(this.tooltip.sprite);
}

function initIndicators() {
  tachometer = new Indicator(`转速：${times}x`);
  tachometer.sprite.position.set(0, 20, 0);
  scene.add(tachometer.sprite);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseMove(event) {
  // the following line would stop any other event handler from firing
  // (such as the mouse's TrackballControls)
  // event.preventDefault();

  // update sprite position
  // tooltip.sprite.position.set(event.clientX, event.clientY - 20, 0);

  // update the mouse variable
  mouse = {
    x: (event.clientX / window.innerWidth) * 2 - 1,
    y: -(event.clientY / window.innerHeight) * 2 + 1
  };
}

function render() {
  // find intersections

  onIntersect();

  if (fan && !pausing) {
    fan.rotation.set(0, fan.rotation.y + 0.1 * times, 0);
  }

  renderer.render(scene, camera);
}

function onIntersect() {
  if (!mouse) {
    return;
  }

  raycaster.setFromCamera(mouse, camera);
  var intersects = raycaster.intersectObjects(components);

  if (intersects.length > 0) {
    if (INTERSECTED != intersects[0].object) {
      if (
        INTERSECTED &&
        INTERSECTED.material &&
        INTERSECTED.material.emissive
      ) {
        INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
      }

      INTERSECTED = intersects[0].object;
      if (
        INTERSECTED &&
        INTERSECTED.material &&
        INTERSECTED.material.emissive
      ) {
        INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
        INTERSECTED.material.emissive.setHex(0xff0000);
      }

      this.tooltip.text(INTERSECTED.name);
    }
  } else {
    if (INTERSECTED && INTERSECTED.material && INTERSECTED.material.emissive) {
      INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
    }
    INTERSECTED = null;
    this.tooltip.text();
  }
}

function animate() {
  requestAnimationFrame(animate);
  render();
}
