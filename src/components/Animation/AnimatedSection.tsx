import { useEffect, useRef, useState, type ReactNode } from 'react';

interface AnimatedSectionProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    direction?: 'up' | 'down' | 'left' | 'right' | 'none';
}

export function AnimatedSection({
    children,
    className = '',
    delay = 0,
    direction = 'up'
}: AnimatedSectionProps) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, []);

    const getTransform = () => {
        if (direction === 'none') return 'translate(0, 0)';
        const transforms = {
            up: 'translateY(40px)',
            down: 'translateY(-40px)',
            left: 'translateX(40px)',
            right: 'translateX(-40px)',
        };
        return transforms[direction];
    };

    return (
        <div
            ref={ref}
            className={className}
            style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translate(0, 0)' : getTransform(),
                transition: `opacity 0.6s ease-out ${delay}ms, transform 0.6s ease-out ${delay}ms`,
            }}
        >
            {children}
        </div>
    );
}

// Staggered children animation wrapper
interface StaggeredContainerProps {
    children: ReactNode;
    className?: string;
    staggerDelay?: number;
}

export function StaggeredContainer({
    children,
    className = '',
    staggerDelay = 100
}: StaggeredContainerProps) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            { threshold: 0.1 }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div ref={ref} className={className}>
            {Array.isArray(children)
                ? children.map((child, index) => (
                    <div
                        key={index}
                        style={{
                            opacity: isVisible ? 1 : 0,
                            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                            transition: `opacity 0.5s ease-out ${index * staggerDelay}ms, transform 0.5s ease-out ${index * staggerDelay}ms`,
                        }}
                    >
                        {child}
                    </div>
                ))
                : children
            }
        </div>
    );
}

// Counter animation hook
export function useCountUp(end: number, duration: number = 2000, isVisible: boolean = false) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!isVisible) return;

        let startTime: number;
        let animationFrame: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);

            // Easing function for smooth animation
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(easeOut * end));

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [end, duration, isVisible]);

    return count;
}
