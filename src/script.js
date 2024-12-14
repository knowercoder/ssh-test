import * as THREE from 'three';
import { StorylineShader } from './StorylineShader.js';
import { initializeRaycastControls } from './MouseControls.js';
import { createTextTexture } from './TextureUtils.js';

// Canvas
const canvas = document.querySelector('canvas.webgl');

const ControlProperties = {
    isCameraAnimating: false, // do not modify this
    imageAspectRatio: 1.0,
    videoAspectRatio: 1.77,
    ZoomDist: 1.5
};

//images
const textureLoader = new THREE.TextureLoader();

const HomeImage = textureLoader.load(new URL('./assets/img/home.jpeg', import.meta.url).toString());

const image1 = textureLoader.load(new URL('./assets/img/bathrobe.jpg', import.meta.url).toString());
const image2 = textureLoader.load(new URL('./assets/img/Screenshot1.jpg', import.meta.url).toString());
const image3 = textureLoader.load(new URL('./assets/img/Screenshot2.jpg', import.meta.url).toString());
const image4 = textureLoader.load(new URL('./assets/img/Screenshot3.jpg', import.meta.url).toString());
const image5 = textureLoader.load(new URL('./assets/img/Render1a.jpg', import.meta.url).toString());
const image6 = textureLoader.load(new URL('./assets/img/STL_Cap_Final_Cool_HI_res.jpg', import.meta.url).toString());
const image7 = textureLoader.load(new URL('./assets/img/STL_FACE_final_sj_new.jpg', import.meta.url).toString());
const image8 = textureLoader.load(new URL('./assets/img/STL_chilll_blue_final.jpg', import.meta.url).toString());
const image9 = textureLoader.load(new URL('./assets/img/STL_hero_logo_Embroidery.jpg', import.meta.url).toString());
const RoundedSqMask = textureLoader.load(new URL('./assets/img/RoundedSquare.png', import.meta.url).toString());

//videos
const videoURLs = [
    new URL('./assets/Videos/video1.mp4', import.meta.url).toString(),
    new URL('./assets/Videos/video2.mp4', import.meta.url).toString(),
    new URL('./assets/Videos/video3.mp4', import.meta.url).toString()
];

const videoElements = [];
const videoTextures = [];

for (let i = 0; i < videoURLs.length; i++) {
    const videoElement = document.createElement('video');
    videoElement.autoplay = false;
    videoElement.src = videoURLs[i];
    videoElement.crossOrigin = 'anonymous';
    videoElement.loop = true;
    videoElement.muted = true; // Set to true if autoplay policies block unmuted playback

    const videoTexture = new THREE.VideoTexture(videoElement);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.format = THREE.RGBAFormat;

    videoElements.push(videoElement);
    videoTextures.push(videoTexture);
}

//#region Initialize Scene

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const sizes = {
    width: canvas.clientWidth,
    height: canvas.clientHeight
};

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0, 0, 8.0);
scene.add(camera);

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;

//#endregion

//#region Multiple image/video Planes Setup

const mainTextures = [image1, image2, image3, image4, image5, image6, image7, image8, image9];

const planes = [];
const planeGeometry = new THREE.PlaneGeometry(5, 5, 30, 30);

for (let i = 0; i < mainTextures.length; i++) {
    const shaderUniforms = {
        _mainTex: { value: mainTextures[i] },
        _maskTex: { value: RoundedSqMask },
        _objPos: { value: new THREE.Vector3() },
        _curvatureStrength: { value: 0.1 },
        _imageSlideSterngth: { value: 0.01 },
        _isScroll: { value: false},
        _aspectRatio: { value: ControlProperties.imageAspectRatio },
    };

    const planeMaterial = new THREE.ShaderMaterial({
        vertexShader: StorylineShader.vertexShader,
        fragmentShader: StorylineShader.fragmentShader,
        uniforms: shaderUniforms,
        transparent: true
    });

    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.originalTexture = mainTextures[i];
    if(i%3 == 0){
        plane.videoTexture = videoTextures[i/3];
        plane.videoElement = videoElements[i/3];
    }

    scene.add(plane);
    planes.push(plane);
}

planes[0].position.set(-10.0, 6.5, 0.0);
planes[1].position.set(-11.0, 3.0, 0.0);
planes[1].scale.set(0.45, 0.45, 0.0);
planes[2].position.set(-9.0, 3.0, 0.0);
planes[2].scale.set(0.45, 0.45, 0.0);

planes[3].position.set(10.0, 0.0, 0.0);
planes[4].position.set(6.5, 1.0, 0.0);
planes[4].scale.set(0.45, 0.45, 0.0);
planes[5].position.set(6.5, -1.0, 0.0);
planes[5].scale.set(0.45, 0.45, 0.0);

planes[6].position.set(10.0, 6.5, 0.0);
planes[7].position.set(6.5, 6.5, 0.0);
planes[7].scale.set(0.45, 0.45, 0.0);
planes[8].position.set(10.0, 10.0, 0.0);
planes[8].scale.set(0.45, 0.45, 0.0);

//#endregion

//#region home and text planes

const homePlaneMaterial = new THREE.ShaderMaterial({
    vertexShader: StorylineShader.vertexShader,
    fragmentShader: StorylineShader.fragmentShader,
    uniforms: {
        _mainTex: { value: HomeImage },
        _maskTex: { value: RoundedSqMask },
        _objPos: { value: new THREE.Vector3() },
        _curvatureStrength: { value: 0.1 },
        _imageSlideSterngth: { value: 0.0 },
        _isScroll: { value: false},
        _scrollSpeed: { value: 0.0 },
        _time: { value: 0.0},
        _aspectRatio: { value: 1.0 },
    },
    transparent: true
});
const homePlane = new THREE.Mesh(planeGeometry, homePlaneMaterial);
homePlane.position.set(0.0, -1.0, 0.0);
homePlane.scale.set(2.5, 2.0, 0.0);
scene.add(homePlane);

const text = "Hi there!... This is a sample running text!...  ";
const textOptions = {
    width: 1024,
    height: 256,
    backgroundColor: 'white', // You can set this to any color or keep it transparent
    textColor: '#000000', // Red text
    font: '42px Arial', // Larger font size
    textAlign: 'center',
    textBaseline: 'middle'
};

const textTexture = createTextTexture(text, textOptions);

const textPlaneMaterial = homePlaneMaterial.clone();
const textPlane = new THREE.Mesh(planeGeometry, textPlaneMaterial);
textPlane.material.uniforms._mainTex.value = textTexture;
textPlane.material.uniforms._mainTex.needsUpdate = true;
textPlane.material.uniforms._isScroll.value = true;
textPlane.material.uniforms._scrollSpeed.value = 0.2;
textPlane.position.set(0.0, 4.2, 0.0);
textPlane.scale.set(2.5, 0.4, 0.0);
scene.add(textPlane)


//#endregion

// Handle window resize
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(window.devicePixelRatio);
});

// Target position for camera panning
const targetPosition = new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z);

// Parameters for smoothing
const dampingFactor = 0.03; // Adjust for smoothing speed
const panMultiplier = 0.05; // Adjust to control how fast the camera pans per pixel movement

// Mouse dragging variables
let isDragging = false;
const lastMouse = new THREE.Vector2();

renderer.domElement.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastMouse.set(e.clientX, e.clientY);
});

window.addEventListener('mouseup', () => {
    isDragging = false;
});

window.addEventListener('mousemove', (e) => {
    if (isDragging) {
        const deltaX = e.clientX - lastMouse.x;
        const deltaY = e.clientY - lastMouse.y;
        
        // Adjust targetPosition based on mouse delta, invert directions as needed
        targetPosition.x -= deltaX * panMultiplier;
        targetPosition.y += deltaY * panMultiplier;

        lastMouse.set(e.clientX, e.clientY);
    }
});

// Touch dragging variables
let isTouching = false;
const lastTouch = new THREE.Vector2();

// Touch Start
renderer.domElement.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) { // Single touch only
        isTouching = true;
        lastTouch.set(e.touches[0].clientX, e.touches[0].clientY);
    }
}, { passive: false });

// Touch Move
renderer.domElement.addEventListener('touchmove', (e) => {
    if (isTouching && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - lastTouch.x;
        const deltaY = e.touches[0].clientY - lastTouch.y;

        // Adjust targetPosition based on touch delta
        targetPosition.x -= deltaX * panMultiplier;
        targetPosition.y += deltaY * panMultiplier;

        lastTouch.set(e.touches[0].clientX, e.touches[0].clientY);
    }
    // Prevent default to avoid scrolling when interacting with the canvas
    e.preventDefault();
}, { passive: false });

// Touch End
renderer.domElement.addEventListener('touchend', () => {
    isTouching = false;
});


initializeRaycastControls(scene, camera, canvas, planes, ControlProperties, targetPosition);

let startTime = Date.now();
function animate() {
    requestAnimationFrame(animate);    

    const elapsedMilliseconds = Date.now() - startTime;
    const elapsedSeconds = elapsedMilliseconds / 1000;

    if (!ControlProperties.isCameraAnimating){
        camera.position.lerp(targetPosition, dampingFactor);
    }

    
    for (let i = 0; i < planes.length; i++) {
        const plane = planes[i];       
        plane.material.uniforms._objPos.value.copy(plane.position);
    }
    homePlane.material.uniforms._objPos.value.copy(homePlane.position);
    textPlane.material.uniforms._objPos.value.copy(textPlane.position);
    textPlane.material.uniforms._time.value = elapsedSeconds;

    renderer.render(scene, camera);
}

animate();
