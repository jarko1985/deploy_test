"use client";
import React, { useRef, useEffect, useState } from "react";

interface Node {
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  type: "icon" | "image";
  iconSrc?: string;
  imageSrc?: string;
  imageLoaded?: boolean;
  imageElement?: HTMLImageElement;
  iconLoaded?: boolean;
  iconElement?: HTMLImageElement;
  targetX?: number;
  targetY?: number;
  pulsePhase: number;
  glowPhase: number;
}

const cryptoIconNames = ["btc", "eth", "ltc", "xrp", "sol", "ada"];
const numRandomImages = 8;
const randomImageUrls = Array.from(
  { length: numRandomImages },
  (_, i) => `/images/person_${i + 1}.jpg`
);

const HeroSection: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesInitialized = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  // Get responsive size based on screen width
  const getResponsiveSize = (isImage: boolean) => {
    if (windowSize.width >= 1536) {
      // 2xl screens
      return isImage ? 50 + 100 : Math.random() * 40 + 60;
    } else if (windowSize.width >= 1280) {
      // xl screens
      return isImage ? Math.random() * 45 + 65 : Math.random() * 35 + 55;
    } else if (windowSize.width >= 1024) {
      // lg screens
      return isImage ? Math.random() * 40 + 60 : Math.random() * 30 + 50;
    } else if (windowSize.width >= 768) {
      // md screens
      return isImage ? Math.random() * 35 + 50 : Math.random() * 25 + 40;
    } else {
      // sm screens
      return isImage ? Math.random() * 30 + 40 : Math.random() * 20 + 30;
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const setCanvasSize = () => {
      if (!containerRef.current) return;

      const height = window.innerHeight;
      containerRef.current.style.height = `${height}px`;

      canvas.width = containerRef.current.offsetWidth;
      canvas.height = containerRef.current.offsetHeight;
    };

    const nodes: Node[] = [];
    const numNodes = 50;

    const initializeNodes = () => {
      if (nodesInitialized.current || !canvas.width || !canvas.height) return;

      for (let i = 0; i < numNodes; i++) {
        const type = Math.random() < 0.5 ? "icon" : "image";
        let node: Node = {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: getResponsiveSize(type === "image"), // Use responsive sizing
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          type: type,
          iconLoaded: false,
          imageLoaded: false,
          pulsePhase: Math.random() * Math.PI * 2,
          glowPhase: Math.random() * Math.PI * 2,
          targetX: Math.random() * canvas.width,
          targetY: Math.random() * canvas.height,
        };

        if (type === "icon") {
          const iconName =
            cryptoIconNames[Math.floor(Math.random() * cryptoIconNames.length)];
          node.iconSrc = `/crypto-icons/color/${iconName}.svg`;
          node.iconElement = new Image();
          node.iconElement.onload = () => {
            node.iconLoaded = true;
          };
          node.iconElement.src = node.iconSrc;
        } else {
          node.imageSrc =
            randomImageUrls[Math.floor(Math.random() * randomImageUrls.length)];
          node.imageElement = new Image();
          node.imageElement.onload = () => {
            node.imageLoaded = true;
          };
          node.imageElement.src = node.imageSrc;
        }
        nodes.push(node);
      }

      nodesInitialized.current = true;
    };

    const drawNodes = () => {
      const sortedNodes = [...nodes].sort((a, b) => a.y - b.y);

      sortedNodes.forEach((node) => {
        ctx.save();

        const pulseScale = 1 + Math.sin(node.pulsePhase) * 0.05;
        const currentSize = node.size * pulseScale;
        const glowIntensity = Math.sin(node.glowPhase) * 0.3 + 0.7;

        if (
          node.type === "icon" &&
          node.iconSrc &&
          node.iconLoaded &&
          node.iconElement
        ) {
          // Draw circular crypto icons
          ctx.shadowColor = `rgba(100, 150, 255, ${glowIntensity * 0.4})`;
          ctx.shadowBlur = currentSize * 0.8;

          ctx.drawImage(
            node.iconElement,
            node.x - currentSize / 2,
            node.y - currentSize / 2,
            currentSize,
            currentSize
          );

          ctx.shadowBlur = 0;

          // Add circular highlight
          ctx.beginPath();
          ctx.arc(node.x, node.y, currentSize * 0.3, 0, Math.PI * 2);
          const gradient = ctx.createRadialGradient(
            node.x,
            node.y,
            0,
            node.x,
            node.y,
            currentSize * 0.3
          );
          gradient.addColorStop(
            0,
            `rgba(255, 255, 255, ${glowIntensity * 0.3})`
          );
          gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
          ctx.fillStyle = gradient;
          ctx.fill();
        } else if (
          node.type === "image" &&
          node.imageSrc &&
          node.imageLoaded &&
          node.imageElement
        ) {
          // Draw rounded square user images
          const img = node.imageElement;
          const size = currentSize;
          const cornerRadius = 8; // Adjust for more/less rounding

          // Create rounded rectangle path
          ctx.beginPath();
          ctx.roundRect(
            node.x - size / 2,
            node.y - size / 2,
            size,
            size,
            cornerRadius
          );
          ctx.closePath();
          ctx.save();
          ctx.clip();

          // Draw image
          ctx.drawImage(img, node.x - size / 2, node.y - size / 2, size, size);

          ctx.restore();

          // Add rounded square border
          ctx.shadowColor = `rgba(100, 200, 255, ${glowIntensity * 0.3})`;
          ctx.shadowBlur = currentSize * 0.6;
          ctx.beginPath();
          ctx.roundRect(
            node.x - size / 2,
            node.y - size / 2,
            size,
            size,
            cornerRadius
          );
          ctx.strokeStyle = `rgba(255, 255, 255, ${glowIntensity * 0.6})`;
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Inner rounded square highlight
          ctx.beginPath();
          ctx.roundRect(
            node.x - size / 2 + 2,
            node.y - size / 2 + 2,
            size - 4,
            size - 4,
            cornerRadius - 1
          );
          ctx.strokeStyle = `rgba(255, 255, 255, ${glowIntensity * 0.3})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        ctx.restore();
      });
    };
    const drawConnections = () => {
      const connectionGroups: { nodes: [number, number]; distance: number }[] =
        [];

      // First collect all connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 200) {
            connectionGroups.push({
              nodes: [i, j],
              distance,
            });
          }
        }
      }

      // Sort by distance (draw closer connections last)
      connectionGroups.sort((a, b) => a.distance - b.distance);

      // Draw connections with varying styles
      connectionGroups.forEach(({ nodes: [i, j], distance }) => {
        const node1 = nodes[i];
        const node2 = nodes[j];

        // Connection intensity based on distance
        const intensity = 1 - distance / 400;

        // Create gradient for connection line
        const gradient = ctx.createLinearGradient(
          node1.x,
          node1.y,
          node2.x,
          node2.y
        );

        gradient.addColorStop(0, `rgba(100, 150, 255, ${intensity * 0.5})`);
        gradient.addColorStop(0.5, `rgba(150, 200, 255, ${intensity * 0.7})`);
        gradient.addColorStop(1, `rgba(100, 150, 255, ${intensity * 0.5})`);

        // Main connection line
        ctx.beginPath();
        ctx.moveTo(node1.x, node1.y);
        ctx.lineTo(node2.x, node2.y);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = intensity * 2 + 0.5;
        ctx.stroke();

        // Glow effect
        ctx.shadowColor = `rgba(100, 150, 255, ${intensity * 0.3})`;
        ctx.shadowBlur = intensity * 10;
        ctx.beginPath();
        ctx.moveTo(node1.x, node1.y);
        ctx.lineTo(node2.x, node2.y);
        ctx.strokeStyle = `rgba(255, 255, 255, ${intensity * 0.1})`;
        ctx.lineWidth = intensity * 4;
        ctx.stroke();
        ctx.shadowBlur = 0;
      });
    };

    const updatePhysics = () => {
      // Update target positions occasionally
      if (Math.random() < 0.005 && nodes.length > 0) {
        const randomNode = Math.floor(Math.random() * nodes.length);
        if (nodes[randomNode]) {
          nodes[randomNode].targetX = Math.random() * canvas.width;
          nodes[randomNode].targetY = Math.random() * canvas.height;
        }
      }

      nodes.forEach((node, index) => {
        // Organic movement with occasional target seeking
        if (node.targetX !== undefined && node.targetY !== undefined) {
          const dx = node.targetX - node.x;
          const dy = node.targetY - node.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance > 10) {
            node.vx += dx * 0.0005;
            node.vy += dy * 0.0005;
          } else {
            // Reached target, clear it
            node.targetX = undefined;
            node.targetY = undefined;
          }
        }

        // Node repulsion to prevent clustering
        nodes.forEach((otherNode, otherIndex) => {
          if (index !== otherIndex) {
            const dx = node.x - otherNode.x;
            const dy = node.y - otherNode.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 60) {
              const repulseForce = (1 - distance / 60) * 0.1;
              node.vx += (dx / distance) * repulseForce;
              node.vy += (dy / distance) * repulseForce;
            }
          }
        });

        // Velocity damping
        node.vx *= 0.98;
        node.vy *= 0.98;

        // Update position
        node.x += node.vx;
        node.y += node.vy;

        // Boundary checks with padding
        const padding = node.size / 2 + 10;
        if (node.x > canvas.width - padding) {
          node.x = canvas.width - padding;
          node.vx *= -0.8;
        } else if (node.x < padding) {
          node.x = padding;
          node.vx *= -0.8;
        }

        if (node.y > canvas.height - padding) {
          node.y = canvas.height - padding;
          node.vy *= -0.8;
        } else if (node.y < padding) {
          node.y = padding;
          node.vy *= -0.8;
        }

        // Update animation phases
        node.pulsePhase += 0.02;
        node.glowPhase += 0.01;
      });
    };

    const animate = () => {
      setCanvasSize();

      if (!nodesInitialized.current && canvas.width > 0 && canvas.height > 0) {
        initializeNodes();
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      updatePhysics();
      drawConnections();
      drawNodes();

      animationFrameId = requestAnimationFrame(animate);
    };

    // Initial setup
    setCanvasSize();
    animate();

    const handleResize = () => {
      setCanvasSize();
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleResize);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [windowSize.width]); // Re-run effect when window width changes

  return (
    <div
      ref={containerRef}
      className={`w-full bg-[#07153B] flex items-center`}
      style={{ minHeight: "100vh" }}
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="text-center md:text-left text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              The Community for McCoiners
            </h1>
            <p className="text-xl mb-8 opacity-80">
              Connect, learn, and grow with fellow McCoin enthusiasts.
            </p>
            <button className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-indigo-500/30 text-lg">
              Join the Community
            </button>
          </div>
          <div className="relative w-full h-[70vh] md:h-[80vh]">
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full rounded-xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
