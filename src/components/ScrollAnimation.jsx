import { useEffect, useRef, useState, useCallback } from "react";

const TOTAL_FRAMES = 128;
const LERP_FACTOR = 0.12;

const getFramePath = (index) =>
    `/ani/frame_${String(index).padStart(3, "0")}.gif`;

/**
 * ScrollAnimation
 *
 * Renders a fixed <canvas> that draws image-sequence frames
 * driven by the parent container's scroll position.
 *
 * Usage: Place inside a tall container (e.g. 300vh).
 * Pass a ref to the scroll container via ⁠ containerRef ⁠.
 */
const ScrollAnimation = ({ containerRef }) => {
    const canvasRef = useRef(null);
    const framesRef = useRef([]);
    const currentFrameRef = useRef(0);
    const targetFrameRef = useRef(0);
    const rafRef = useRef(null);
    const [loaded, setLoaded] = useState(false);

    // ─── Preload all frames ───
    useEffect(() => {
        let cancelled = false;
        let count = 0;
        const images = new Array(TOTAL_FRAMES);

        for (let i = 0; i < TOTAL_FRAMES; i++) {
            const img = new Image();
            img.src = getFramePath(i);
            img.onload = () => {
                if (cancelled) return;
                count++;
                if (count === TOTAL_FRAMES) {
                    framesRef.current = images;
                    setLoaded(true);
                }
            };
            img.onerror = () => {
                if (cancelled) return;
                count++;
                if (count === TOTAL_FRAMES) {
                    framesRef.current = images;
                    setLoaded(true);
                }
            };
            images[i] = img;
        }

        return () => {
            cancelled = true;
        };
    }, []);

    // ─── Draw a frame to the canvas (cover-fit) ───
    const drawFrame = useCallback((frameIndex) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        const img = framesRef.current[frameIndex];
        if (!img || !img.complete || img.naturalWidth === 0) return;

        const { width, height } = canvas;
        const imgRatio = img.naturalWidth / img.naturalHeight;
        const canvasRatio = width / height;
        let drawW, drawH, drawX, drawY;

        if (canvasRatio > imgRatio) {
            drawW = width;
            drawH = width / imgRatio;
            drawX = 0;
            drawY = (height - drawH) / 2;
        } else {
            drawH = height;
            drawW = height * imgRatio;
            drawX = (width - drawW) / 2;
            drawY = 0;
        }

        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, drawX, drawY, drawW, drawH);
    }, []);

    // ─── Resize canvas to viewport ───
    const handleResize = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        drawFrame(Math.round(currentFrameRef.current));
    }, [drawFrame]);

    // ─── Scroll → target frame mapping ───
    const handleScroll = useCallback(() => {
        const container = containerRef?.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const scrollStart = -rect.top;
        const scrollRange = container.offsetHeight - window.innerHeight;

        if (scrollRange <= 0) return;

        const progress = Math.max(0, Math.min(1, scrollStart / scrollRange));
        targetFrameRef.current = progress * (TOTAL_FRAMES - 1);
    }, [containerRef]);

    // ─── Animation loop with lerp easing ───
    useEffect(() => {
        if (!loaded) return;

        handleResize();
        drawFrame(0);

        const animate = () => {
            const target = targetFrameRef.current;
            const current = currentFrameRef.current;
            const diff = target - current;

            if (Math.abs(diff) > 0.1) {
                currentFrameRef.current += diff * LERP_FACTOR;
                drawFrame(Math.round(currentFrameRef.current));
            }

            rafRef.current = requestAnimationFrame(animate);
        };

        rafRef.current = requestAnimationFrame(animate);

        window.addEventListener("scroll", handleScroll, { passive: true });
        window.addEventListener("resize", handleResize);

        return () => {
            cancelAnimationFrame(rafRef.current);
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleResize);
        };
    }, [loaded, handleScroll, handleResize, drawFrame]);

    return (
        <>
            {/* Fixed canvas background */}
            <canvas
                ref={canvasRef}
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    zIndex: 0,
                    pointerEvents: "none",
                }}
            />

            {/* Dark gradient overlay for text readability */}
            <div
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    background:
                        "linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.65) 100%)",
                    zIndex: 1,
                    pointerEvents: "none",
                }}
            />
        </>
    );
};

export default ScrollAnimation;