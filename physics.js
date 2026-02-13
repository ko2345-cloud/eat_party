/**
 * Physics Engine v0.5.1
 * Handles gravity, parabolic motion, and fruit-to-fruit collision
 */

class PhysicsEngine {
    static GRAVITY = 0.5; // Gravity acceleration (pixels per frame squared)
    static COLLISION_PUSH_STRENGTH = 0.4; // How strongly fruits push each other apart
    static OFFSET_DAMPING = 0.92; // How quickly collision offset decays (0-1, higher = slower decay)
    static MIN_OFFSET = 0.5; // Below this threshold, snap offset to zero

    /**
     * Apply physics to a fruit object
     * @param {Object} fruit - The fruit object with position and velocity
     * @param {Number} deltaTime - Time multiplier (default 1)
     */
    static applyPhysics(fruit, deltaTime = 1) {
        // Update velocity (gravity effect)
        fruit.velocityY += this.GRAVITY * deltaTime;

        // Update position
        fruit.x += fruit.velocityX * deltaTime;
        fruit.y += fruit.velocityY * deltaTime;

        // Update rotation
        fruit.rotation += fruit.rotationSpeed * deltaTime;
    }

    /**
     * Resolve collisions between all active fruits
     * Detects overlapping fruits and pushes them apart along the connecting line.
     * Uses offset-based displacement so fruits gradually return to their paths.
     * @param {Array} fruits - Array of Fruit objects
     */
    static resolveCollisions(fruits) {
        for (let i = 0; i < fruits.length; i++) {
            for (let j = i + 1; j < fruits.length; j++) {
                const a = fruits[i];
                const b = fruits[j];

                // Skip finished or being-removed fruits
                if (a.shouldRemove || b.shouldRemove) continue;

                // Use actual display position (path position + current offset)
                const ax = a.x;
                const ay = a.y;
                const bx = b.x;
                const by = b.y;

                const dx = bx - ax;
                const dy = by - ay;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const minDist = a.collisionRadius + b.collisionRadius;

                if (dist < minDist && dist > 0.01) {
                    // Overlap detected — calculate push direction and magnitude
                    const overlap = minDist - dist;

                    // Normalize direction vector (a → b)
                    const nx = dx / dist;
                    const ny = dy / dist;

                    const aBounce = a.path && a.path.type === 'bounce';
                    const bBounce = b.path && b.path.type === 'bounce';

                    if (aBounce || bBounce) {
                        // === 反彈模式碰撞：反射速度 ===
                        // Separate overlapping fruits first
                        const halfOverlap = overlap * 0.5;
                        if (aBounce) {
                            a.x -= nx * halfOverlap;
                            a.y -= ny * halfOverlap;
                        } else {
                            a.offsetX -= nx * halfOverlap;
                            a.offsetY -= ny * halfOverlap;
                        }
                        if (bBounce) {
                            b.x += nx * halfOverlap;
                            b.y += ny * halfOverlap;
                        } else {
                            b.offsetX += nx * halfOverlap;
                            b.offsetY += ny * halfOverlap;
                        }

                        // Reflect velocity along collision normal
                        if (aBounce) {
                            const dotA = a.vx * nx + a.vy * ny;
                            if (dotA > 0) { // Only reflect if moving towards b
                                a.vx -= 2 * dotA * nx;
                                a.vy -= 2 * dotA * ny;
                            }
                        }
                        if (bBounce) {
                            const dotB = b.vx * nx + b.vy * ny;
                            if (dotB < 0) { // Only reflect if moving towards a
                                b.vx -= 2 * dotB * nx;
                                b.vy -= 2 * dotB * ny;
                            }
                        }
                    } else {
                        // === 軌跡模式碰撞：offset-based push (原有邏輯) ===
                        const pushForce = overlap * this.COLLISION_PUSH_STRENGTH;
                        const halfPush = pushForce * 0.5;
                        a.offsetX -= nx * halfPush;
                        a.offsetY -= ny * halfPush;
                        b.offsetX += nx * halfPush;
                        b.offsetY += ny * halfPush;
                    }
                }
            }
        }

        // Apply damping to all offsets so fruits gradually return to path
        for (let i = 0; i < fruits.length; i++) {
            const f = fruits[i];
            f.offsetX *= this.OFFSET_DAMPING;
            f.offsetY *= this.OFFSET_DAMPING;

            // Snap to zero when offset is negligible
            if (Math.abs(f.offsetX) < this.MIN_OFFSET) f.offsetX = 0;
            if (Math.abs(f.offsetY) < this.MIN_OFFSET) f.offsetY = 0;
        }
    }

    /**
     * Check if fruit is out of screen bounds
     * @param {Object} fruit - The fruit object
     * @param {Number} canvasWidth - Canvas width
     * @param {Number} canvasHeight - Canvas height
     * @returns {Boolean} True if out of bounds
     */
    static isOutOfBounds(fruit, canvasWidth, canvasHeight) {
        const margin = 400; // Buffer zone beyond screen edges (increased for farther spawns)
        return (
            fruit.x < -margin ||
            fruit.x > canvasWidth + margin ||
            fruit.y > canvasHeight + margin
        );
    }
}
