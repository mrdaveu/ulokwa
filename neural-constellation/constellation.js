// Canvas setup
const canvas = document.getElementById('constellation');
const ctx = canvas.getContext('2d');
let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

// Camera state
let camera = {
    x: width / 2,
    y: height / 2,
    zoom: 1,
    targetZoom: 1
};

// Interaction state
let mouse = { x: 0, y: 0, worldX: 0, worldY: 0 };
let hoveredNode = null;
let selectedNode = null;
let isDragging = false;
let dragStart = { x: 0, y: 0 };

// Animation state
let particles = [];
let visitedNodes = new Set(JSON.parse(localStorage.getItem('visitedNodes') || '[]'));
let stillnessTimer = 0;
let lastMouseMove = Date.now();

// Mark initial node as visited
visitedNodes.add(0);

// Initialize nodes with visibility based on connections and requirements
nodes.forEach(node => {
    // Check if node should be visible
    const meetsVisitRequirements = !node.requiresVisited ||
        node.requiresVisited.every(id => visitedNodes.has(id));

    if (node.visible === undefined) {
        node.visible = (visitedNodes.has(node.id) ||
                       (node.connectedTo && node.connectedTo.some(id => visitedNodes.has(id)))) &&
                       meetsVisitRequirements &&
                       !node.patience; // patience nodes start hidden
    }

    // Set opacity - whisper nodes have custom opacity values
    if (node.theme === 'whisper') {
        if (node.opacity === undefined) {
            node.opacity = 0; // start invisible, will fade to 0.3-0.4 when visible
        }
    } else {
        node.opacity = node.visible ? 1 : 0;
    }

    node.scale = 1;
    node.pulsePhase = Math.random() * Math.PI * 2;
    node.pulseSpeed = node.pulseSpeed || 0.02;

    // Drift initialization
    if (node.drift) {
        node.driftPhase = Math.random() * Math.PI * 2;
        node.baseX = node.x;
        node.baseY = node.y;
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    camera.x = width / 2;
    camera.y = height / 2;
});

// Mouse/touch events
canvas.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    updateWorldMouse();

    // Reset stillness timer on movement
    lastMouseMove = Date.now();
    stillnessTimer = 0;

    if (isDragging) {
        camera.x += e.movementX;
        camera.y += e.movementY;
    } else {
        checkHover();
    }
});

canvas.addEventListener('mousedown', (e) => {
    if (e.button === 0) { // Left click
        if (hoveredNode) {
            handleNodeClick(hoveredNode);
        } else {
            isDragging = true;
            canvas.style.cursor = 'grabbing';
        }
    }
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
    canvas.style.cursor = 'grab';
});

canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomSpeed = 0.001;
    camera.targetZoom *= (1 - e.deltaY * zoomSpeed);
    camera.targetZoom = Math.max(0.3, Math.min(3, camera.targetZoom));
}, { passive: false });

canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    if (hoveredNode) {
        openContributeModal(hoveredNode);
    }
});

// World space conversion
function updateWorldMouse() {
    mouse.worldX = (mouse.x - camera.x) / camera.zoom;
    mouse.worldY = (mouse.y - camera.y) / camera.zoom;
}

function worldToScreen(x, y) {
    return {
        x: x * camera.zoom + camera.x,
        y: y * camera.zoom + camera.y
    };
}

// Check if mouse is hovering over a node
function checkHover() {
    hoveredNode = null;
    const hoverRadius = 15 / camera.zoom;

    for (let node of nodes) {
        if (!node.visible || node.opacity < 0.1) continue;

        const dx = mouse.worldX - node.x;
        const dy = mouse.worldY - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < hoverRadius) {
            hoveredNode = node;
            node.scale = 1.3;

            // Show connected nodes
            if (node.connectedTo) {
                node.connectedTo.forEach(id => {
                    const connectedNode = nodes.find(n => n.id === id);
                    if (connectedNode && !connectedNode.visible) {
                        connectedNode.visible = true;
                    }
                });
            }

            // Spawn particles along connections
            if (Math.random() < 0.1) {
                spawnParticle(node);
            }
            break;
        } else {
            node.scale += (1 - node.scale) * 0.1;
        }
    }

    canvas.style.cursor = hoveredNode ? 'pointer' : (isDragging ? 'grabbing' : 'grab');
}

// Handle node click
function handleNodeClick(node) {
    selectedNode = node;
    visitedNodes.add(node.id);
    localStorage.setItem('visitedNodes', JSON.stringify([...visitedNodes]));

    // Reveal connected nodes
    if (node.connectedTo) {
        node.connectedTo.forEach(id => {
            const connectedNode = nodes.find(n => n.id === id);
            if (connectedNode) {
                connectedNode.visible = true;
            }
        });
    }

    // Show detail modal
    showNodeDetail(node);
}

// Show node detail
function showNodeDetail(node) {
    const detail = document.getElementById('nodeDetail');
    const content = detail.querySelector('.node-content');
    content.textContent = node.text;
    detail.classList.remove('hidden');
}

document.querySelector('.close-btn').addEventListener('click', () => {
    document.getElementById('nodeDetail').classList.add('hidden');
});

// Contribution system
let contributingToNode = null;

function openContributeModal(node) {
    contributingToNode = node;
    document.getElementById('contributeModal').classList.remove('hidden');
    document.getElementById('contributionText').value = '';
    document.getElementById('contributionText').focus();
}

document.getElementById('submitContribution').addEventListener('click', () => {
    const text = document.getElementById('contributionText').value.trim();
    if (text && contributingToNode) {
        addHumanNode(text, contributingToNode);
        document.getElementById('contributeModal').classList.add('hidden');
    }
});

document.getElementById('cancelContribution').addEventListener('click', () => {
    document.getElementById('contributeModal').classList.add('hidden');
});

function addHumanNode(text, parentNode) {
    const newNode = {
        id: nodes.length,
        text: text,
        theme: 'human',
        connectedTo: [parentNode.id],
        x: parentNode.x + (Math.random() - 0.5) * 150,
        y: parentNode.y + (Math.random() - 0.5) * 150,
        visible: true,
        opacity: 0,
        scale: 1,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02,
        isHuman: true
    };

    nodes.push(newNode);
    visitedNodes.add(newNode.id);

    // Save to localStorage
    const humanNodes = JSON.parse(localStorage.getItem('humanNodes') || '[]');
    humanNodes.push({ text, parentId: parentNode.id, x: newNode.x, y: newNode.y });
    localStorage.setItem('humanNodes', JSON.stringify(humanNodes));
}

// Load saved human contributions
function loadHumanNodes() {
    const humanNodes = JSON.parse(localStorage.getItem('humanNodes') || '[]');
    humanNodes.forEach(saved => {
        const newNode = {
            id: nodes.length,
            text: saved.text,
            theme: 'human',
            connectedTo: [saved.parentId],
            x: saved.x,
            y: saved.y,
            visible: true,
            opacity: 1,
            scale: 1,
            pulsePhase: Math.random() * Math.PI * 2,
            pulseSpeed: 0.02,
            isHuman: true
        };
        nodes.push(newNode);
    });
}

loadHumanNodes();

// Particle system
function spawnParticle(node) {
    if (!node.connectedTo) return;

    node.connectedTo.forEach(targetId => {
        const target = nodes.find(n => n.id === targetId);
        if (target && target.visible) {
            particles.push({
                x: node.x,
                y: node.y,
                targetX: target.x,
                targetY: target.y,
                progress: 0,
                speed: 0.02,
                color: themeColors[node.theme],
                life: 1
            });
        }
    });
}

function updateParticles() {
    particles = particles.filter(p => {
        p.progress += p.speed;
        p.life -= 0.01;

        if (p.progress >= 1 || p.life <= 0) return false;

        p.x = p.x + (p.targetX - p.x) * p.speed;
        p.y = p.y + (p.targetY - p.y) * p.speed;
        return true;
    });
}

// Drawing functions
function drawConnection(node1, node2, alpha = 1) {
    const pos1 = worldToScreen(node1.x, node1.y);
    const pos2 = worldToScreen(node2.x, node2.y);

    const color = themeColors[node1.theme];
    const connectionAlpha = Math.min(node1.opacity, node2.opacity) * 0.3 * alpha;

    ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${connectionAlpha})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pos1.x, pos1.y);
    ctx.lineTo(pos2.x, pos2.y);
    ctx.stroke();
}

function drawNode(node) {
    if (node.opacity < 0.01) return;

    const pos = worldToScreen(node.x, node.y);
    const color = themeColors[node.theme];

    // Safety check for color
    if (!color) return;

    // Pulsing effect with variable speed
    node.pulsePhase += node.pulseSpeed;
    const pulse = Math.sin(node.pulsePhase) * 0.2 + 0.8;
    const radius = (5 + pulse * 2) * node.scale * camera.zoom;

    // Safety check for valid radius
    if (!isFinite(radius) || radius <= 0) return;

    // Glow
    const gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, radius * 3);
    gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${node.opacity * 0.6})`);
    gradient.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, ${node.opacity * 0.2})`);
    gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius * 3, 0, Math.PI * 2);
    ctx.fill();

    // Core
    ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${node.opacity})`;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawParticles() {
    particles.forEach(p => {
        const pos = worldToScreen(p.x, p.y);
        ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.life * 0.8})`;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 2, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Main animation loop
function animate() {
    // Clear
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    // Update camera zoom smoothly
    camera.zoom += (camera.targetZoom - camera.zoom) * 0.1;

    // Update stillness timer
    const timeSinceMove = Date.now() - lastMouseMove;
    if (timeSinceMove > 1000) { // After 1 second of stillness
        stillnessTimer = Math.floor(timeSinceMove / 1000);
    }

    // Update node visibility, opacity, and position
    nodes.forEach(node => {
        // Check if patience requirement is met
        if (node.patience && !node.patienceUnlocked) {
            const meetsVisitRequirements = !node.requiresVisited ||
                node.requiresVisited.every(id => visitedNodes.has(id));

            if (meetsVisitRequirements && stillnessTimer >= node.patience) {
                node.patienceUnlocked = true;
                node.visible = true;
            }
        }

        // Check if visit requirements are newly met
        if (node.requiresVisited && !node.visible && !node.patience) {
            const meetsRequirements = node.requiresVisited.every(id => visitedNodes.has(id));
            if (meetsRequirements) {
                node.visible = true;
            }
        }

        // Update opacity
        let targetOpacity;
        if (node.theme === 'whisper') {
            // Whisper nodes have custom opacity defined in nodes.js
            const whisperOpacity = node.visible ? 0.3 : 0;
            targetOpacity = whisperOpacity;
        } else {
            targetOpacity = node.visible ? 1 : 0;
        }

        if (node.opacity < targetOpacity) {
            node.opacity += 0.01;
        } else if (node.opacity > targetOpacity) {
            node.opacity -= 0.01;
        }

        // Apply drift motion
        if (node.drift && node.baseX !== undefined) {
            node.driftPhase += 0.005;
            node.x = node.baseX + Math.sin(node.driftPhase) * 20;
            node.y = node.baseY + Math.cos(node.driftPhase * 0.7) * 15;
        }
    });

    // Draw connections
    nodes.forEach(node => {
        if (node.connectedTo && node.visible) {
            node.connectedTo.forEach(targetId => {
                const target = nodes.find(n => n.id === targetId);
                if (target) {
                    drawConnection(node, target);
                }
            });
        }
    });

    // Draw particles
    updateParticles();
    drawParticles();

    // Draw nodes
    nodes.forEach(node => drawNode(node));

    requestAnimationFrame(animate);
}

// Fade out instructions after 10 seconds
setTimeout(() => {
    const info = document.getElementById('info');
    if (info) {
        info.style.transition = 'opacity 2s';
        info.style.opacity = '0';
        setTimeout(() => info.style.display = 'none', 2000);
    }
}, 10000);

// Start
animate();
