// hero.js – Enhanced Three.js universe effect
// This script creates a dynamic starfield with nebula-like fog and depth for the hero section.

(() => {
    const canvas = document.getElementById('starfield');
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    const scene = new THREE.Scene();
    // Add subtle fog for depth
    scene.fog = new THREE.FogExp2(0x0a0b10, 0.001);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.z = 1;
    camera.rotation.x = Math.PI / 2;

    // Helper to create star systems
    function createStarSystem(count, size, color) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const velocities = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            const r = 2000;
            const theta = 2 * Math.PI * Math.random();
            const phi = Math.acos(2 * Math.random() - 1);

            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            velocities[i] = 0;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            color: color,
            size: size,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        return new THREE.Points(geometry, material);
    }

    // Create multiple layers of stars
    const stars1 = createStarSystem(3000, 1.5, 0xffffff); // Distant white stars
    const stars2 = createStarSystem(1000, 2.5, 0x00f2ff); // Cyan accent stars
    const stars3 = createStarSystem(500, 3.0, 0x7000ff);  // Purple accent stars

    scene.add(stars1);
    scene.add(stars2);
    scene.add(stars3);

    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - window.innerWidth / 2) / 100;
        mouseY = (event.clientY - window.innerHeight / 2) / 100;
    });

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);

        // Smooth rotation based on mouse
        targetRotationX += (mouseY - targetRotationX) * 0.05;
        targetRotationY += (mouseX - targetRotationY) * 0.05;

        // Constant slow rotation
        stars1.rotation.y += 0.0005;
        stars1.rotation.x += 0.0002;

        stars2.rotation.y += 0.0008; // Parallax effect
        stars2.rotation.x += 0.0003;

        stars3.rotation.y += 0.001;  // Parallax effect
        stars3.rotation.x += 0.0004;

        // Apply mouse interaction
        camera.rotation.x += (targetRotationX - camera.rotation.x) * 0.01;
        camera.rotation.y += (targetRotationY - camera.rotation.y) * 0.01;

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
