import React, { useRef, useEffect } from 'react';

const Background = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        let stars = [];

        const createStars = (count) => {
            stars = [];
            for (let i = 0; i < count; i++) {
                stars.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    radius: Math.random() * 1.2,
                    alpha: Math.random() * 0.5 + 0.5,
                    velocity: {
                        x: (Math.random() - 0.5) * 0.1,
                        y: (Math.random() - 0.5) * 0.1,
                    },
                });
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            stars.forEach(star => {
                // Update position
                star.x += star.velocity.x;
                star.y += star.velocity.y;

                // Boundary check
                if (star.x < 0 || star.x > width) star.velocity.x *= -1;
                if (star.y < 0 || star.y > height) star.velocity.y *= -1;

                // Draw star
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
                ctx.fill();
            });

            requestAnimationFrame(animate);
        };

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
            createStars(Math.floor((width * height) / 8000));
        };

        window.addEventListener('resize', handleResize);

        // Initial setup
        createStars(Math.floor((width * height) / 8000));
        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10 bg-slate-900 pointer-events-none" />;
};

export default Background;
