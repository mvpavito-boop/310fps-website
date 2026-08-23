'use client';

import type React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

type GradientBackgroundProps = React.ComponentProps<'div'> & {
    gradients?: string[];
    animationDuration?: number;
    animationDelay?: number;
    enableCenterContent?: boolean;
    overlay?: boolean;
    overlayOpacity?: number;
};

const Default_Gradients = [
    'linear-gradient(135deg, #050507 0%, #121217 58%, #2a0d05 100%)',
    'linear-gradient(135deg, #050507 0%, #10131a 54%, #321004 100%)',
    'linear-gradient(135deg, #030304 0%, #141215 56%, #230707 100%)',
    'linear-gradient(135deg, #050507 0%, #0b0d12 52%, #301105 100%)',
    'linear-gradient(135deg, #050507 0%, #121217 58%, #2a0d05 100%)',
];

export function GradientBackground({
    children,
    className = '',
    gradients = Default_Gradients,
    animationDuration = 8,
    animationDelay = 0.5,
    enableCenterContent = true,
    overlay = false,
    overlayOpacity = 0.3,
}: GradientBackgroundProps) {
    const shouldReduceMotion = useReducedMotion();

    return (
        <div className={cn('w-full relative min-h-screen overflow-hidden', className)}>
            <motion.div
                className="absolute inset-0"
                style={{ background: gradients[0], willChange: 'background' }}
                animate={shouldReduceMotion ? { background: gradients[0] } : { background: gradients }}
                transition={{
                    delay: animationDelay,
                    duration: animationDuration,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: 'easeInOut',
                }}
            />

            {overlay && (
                <div
                    className="absolute inset-0 bg-black"
                    style={{ opacity: overlayOpacity }}
                />
            )}

            {children && (
                <div
                    className={cn(
                        'relative z-10',
                        enableCenterContent && 'flex min-h-screen items-center justify-center',
                    )}
                >
                    {children}
                </div>
            )}
        </div>
    );
}
