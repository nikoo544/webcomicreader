// hero.js – Simple Three.js space hero effect
// This script creates a starfield background for the hero section.

(() => {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.z = 1;

    // Create starfield geometry
    const stars = 5000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(stars * 3);

    for (let i = 0; i < stars; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({ color: 0xffffff, size: 1.5 });
    const starField = new THREE.Points(geometry, material);
    scene.add(starField);

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        starField.rotation.x += 0.0005;
        starField.rotation.y += 0.0005;
        renderer.render(scene, camera);
    }

    animate();

    // Handle resize
    window.addEventListener('resize', () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    });
})();
