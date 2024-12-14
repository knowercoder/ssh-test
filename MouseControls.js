import * as THREE from 'three';

/**
 * Initializes raycasting and click handling for the planes.
 * @param {THREE.Scene} scene - The Three.js scene.
 * @param {THREE.Camera} camera - The Three.js camera.
 * @param {HTMLCanvasElement} canvas - The canvas element.
 * @param {Array} planes - Array of plane meshes.
 */
export function initializeRaycastControls(scene, camera, canvas, planes, sharedState, targetPosition) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let currentlyPlayingPlane = null;

    const originalCameraPosition = targetPosition;// camera.position.clone();
    let isCameraAnimating = false;

    let isDragging = false;
    let clickStartPos = { x: 0, y: 0 };

    // Track mouse down event
    canvas.addEventListener('mousedown', (event) => {
        isDragging = false;
        clickStartPos = { x: event.clientX, y: event.clientY };
    });

    // Track mouse move event to detect dragging
    canvas.addEventListener('mousemove', (event) => {
        const moveThreshold = 5; // Pixels to determine if it's a drag
        if (
            Math.abs(event.clientX - clickStartPos.x) > moveThreshold ||
            Math.abs(event.clientY - clickStartPos.y) > moveThreshold
        ) {
            isDragging = true;
        }
    });

    canvas.addEventListener('click', (event) => {
        if (isDragging) return; 
        // Calculate mouse position in normalized device coordinates (-1 to +1)
        mouse.x = (event.clientX / canvas.clientWidth) * 2 - 1;
        mouse.y = -(event.clientY / canvas.clientHeight) * 2 + 1;

        // Update the raycaster
        raycaster.setFromCamera(mouse, camera);

        // Check for intersections with planes
        const intersects = raycaster.intersectObjects(planes);

        if (intersects.length > 0) {
            const clickedPlane = intersects[0].object;

            // Toggle video playback
            if (currentlyPlayingPlane === clickedPlane) {
                // Stop the video and revert to the original image texture
                clickedPlane.videoElement.pause();
                clickedPlane.material.uniforms._mainTex.value = clickedPlane.originalTexture;
                currentlyPlayingPlane = null;

                sharedState.isCameraAnimating = false;
                animateCamera(camera, originalCameraPosition, clickedPlane, 0.1, sharedState.imageAspectRatio, () => {
                    
                });
            } else {
                // If another plane is playing, stop that one first
                if (currentlyPlayingPlane) {
                    currentlyPlayingPlane.videoElement.pause();
                    currentlyPlayingPlane.material.uniforms._mainTex.value = currentlyPlayingPlane.originalTexture;
                }

                // Play video on the clicked plane
                clickedPlane.videoElement.play();
                clickedPlane.videoElement.muted = false;
                clickedPlane.material.uniforms._mainTex.value = clickedPlane.videoTexture;
                currentlyPlayingPlane = clickedPlane;

                const targetPosition = clickedPlane.position.clone().add(new THREE.Vector3(0, 0,sharedState.ZoomDist));
                sharedState.isCameraAnimating = true; 
                animateCamera(camera, targetPosition, clickedPlane, 0.0, sharedState.videoAspectRatio, () => {
                    
                });
            }
        }
    });


    function animateCamera(camera, targetPosition, plane, targetCurvatureStrength, targetAspectRatio, onComplete) {
       
        const duration = 1.0; // Animation duration in seconds
        let elapsed = 0;

        const startPosition = camera.position.clone();
        const startCurvature = plane ? plane.material.uniforms._curvatureStrength.value : 0.0;
        const startAspect = plane ? plane.material.uniforms._aspectRatio.value : 0.0;


        function updateCamera(deltaTime) {
            elapsed += deltaTime;
            const t = Math.min(elapsed / duration, 1); // Clamp t between 0 and 1

            camera.position.lerpVectors(startPosition, targetPosition, t);
            if (plane) {
                plane.material.uniforms._curvatureStrength.value = THREE.MathUtils.lerp(
                    startCurvature,
                    targetCurvatureStrength,
                    t
                );
                plane.material.uniforms._aspectRatio.value = THREE.MathUtils.lerp(
                    startAspect,
                    targetAspectRatio,
                    t
                );
            }

            if (t < 1) {
                requestAnimationFrame(() => updateCamera(0.016));
            } else if (onComplete) {                
                onComplete();
            }
        }

        requestAnimationFrame(() => updateCamera(0.016));
    }
}
