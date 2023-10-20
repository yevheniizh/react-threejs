import React, { Component } from 'react';
// import * as THREE from 'https://cdn.skypack.dev/three@0.134';
// import SmokeBackground from '../assets/images/smoke-background.png';

class SmokeEffect extends Component {
  smokeRef = undefined;
  smoke = undefined;

  constructor(props) {
    super(props);
    this.smokeRef = React.createRef();
  }

  componentDidMount() {
    // this.smoke = new Smoke({
    //   container: this.smokeRef.current,
    // });
    // this.smoke.update();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.smoke.onResize);
  }

  render() {
    return (
      <div
        ref={this.smokeRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: -1,
          width: '100%',
          height: '100%',
        }}
      />
    );
  }
}

class Smoke {
  clock = undefined;
  renderer = undefined;
  scene = undefined;
  mesh = undefined;
  height = undefined;
  width = undefined;
  cubeSineDriver = undefined;
  container = undefined;
  smokeParticles = undefined;
  camera = undefined;

  constructor(options) {
    const defaults = {
      width: window.innerWidth,
      height: window.innerHeight,
      container: document.body,
    };

    Object.assign(this, options, defaults);
    this.onResize = this.onResize.bind(this);

    this.addEventListeners();
    this.init();
  }

  init() {
    const { width, height } = this;

    this.clock = new THREE.Clock();
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0x222222); // Set to a light gray color
    this.scene = new THREE.Scene();
    this.mesh = new THREE.Mesh(
      new THREE.BufferGeometry(200, 200, 200),
      new THREE.MeshLambertMaterial({
        color: 0xaa6666,
        wireframe: false,
      })
    );

    this.cubeSineDriver = 0;
    this.addCamera();
    this.addLights();
    this.addParticles();
    this.addBackground();
    this.container.appendChild(this.renderer.domElement);
  }

  evolveSmoke(delta) {
    const { smokeParticles } = this;
    let smokeParticlesLength = smokeParticles.length;
    while (smokeParticlesLength--) {
      smokeParticles[smokeParticlesLength].rotation.z += delta * 0.2;
    }
  }

  addLights() {
    const { scene } = this;
    const light = new THREE.DirectionalLight(0xffffff, 1); // Adjust intensity to 1
    light.position.set(-1, 0, 1);
    scene.add(light);
    const ambientLight = new THREE.AmbientLight(0x888888);
    scene.add(ambientLight);
  }

  addCamera() {
    const { scene } = this;
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.width / this.height,
      1,
      10000
    );
    this.camera.position.z = 1000;
    scene.add(this.camera);
  }

  addParticles() {
    const { scene } = this;
    const textureLoader = new THREE.TextureLoader();
    this.smokeParticles = [];
    textureLoader.load(
      'https://rawgit.com/marcobiedermann/playground/master/three.js/smoke-particles/dist/assets/images/clouds.png',
      (texture) => {
        const smokeMaterial = new THREE.MeshLambertMaterial({
          color: 0xdd8888,
          map: texture,
          transparent: true,
          wireframe: false,
        });
        smokeMaterial.map.minFilter = THREE.LinearFilter;
        const smokeGeometry = new THREE.PlaneBufferGeometry(300, 300);
        const smokeMeshes = [];
        let limit = 150;
        while (limit--) {
          smokeMeshes[limit] = new THREE.Mesh(smokeGeometry, smokeMaterial);
          smokeMeshes[limit].position.set(
            Math.random() * 500 - 250,
            Math.random() * 500 - 250,
            Math.random() * 1000 - 100
          );
          smokeMeshes[limit].rotation.z = Math.random() * 360;
          this.smokeParticles.push(smokeMeshes[limit]);
          scene.add(smokeMeshes[limit]);
        }
      }
    );
  }

  addBackground() {
    const { scene } = this;
    const textureLoader = new THREE.TextureLoader();
    const textGeometry = new THREE.PlaneBufferGeometry(600, 320);
    // textureLoader.load(SmokeBackground, (texture) => {
    //   const textMaterial = new THREE.MeshLambertMaterial({
    //     blending: THREE.AdditiveBlending,
    //     color: 0xffffff,
    //     map: texture,
    //     opacity: 1,
    //     transparent: true,
    //   });
    //   textMaterial.map.minFilter = THREE.LinearFilter;
    //   const text = new THREE.Mesh(textGeometry, textMaterial);
    //   text.position.z = 800;
    //   scene.add(text);
    // });
  }

  render() {
    const { mesh } = this;
    this.cubeSineDriver += 0.01;
    mesh.rotation.x += 0.005;
    mesh.rotation.y += 0.01;
    mesh.position.z = 100 + Math.sin(this.cubeSineDriver) * 500;
    this.renderer.render(this.scene, this.camera);
  }

  update() {
    this.evolveSmoke(this.clock.getDelta());
    this.render();
    requestAnimationFrame(this.update.bind(this));
  }

  onResize() {
    const { camera } = this;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    camera.aspect = windowWidth / windowHeight;
    camera.updateProjectionMatrix();
    this.renderer.setSize(windowWidth, windowHeight);
  }

  addEventListeners() {
    window.addEventListener('resize', this.onResize);
  }
}

export default SmokeEffect;
