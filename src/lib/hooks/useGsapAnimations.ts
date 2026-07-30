"use client";

import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

interface AnimationOptions {
    duration?: number;
    delay?: number;
    ease?: string;
    start?: string;
    stagger?: number;
    y?: number;
    x?: number;
    scale?: number;
}

const DEFAULTS = {
    duration: 0.8,
    ease: "power3.out",
    start: "top 85%",
    stagger: 0.15,
    y: 40,
};

/**
 * Reusable GSAP ScrollTrigger animation hook for Clinq public pages.
 * Returns helper functions that animate elements when they scroll into view.
 * All animations are cleaned up on unmount.
 */
export function useGsapAnimations() {
    const contextRef = useRef<gsap.Context | null>(null);

    // Clean up all GSAP contexts on unmount
    useEffect(() => {
        return () => {
            contextRef.current?.revert();
        };
    }, []);

    /**
     * Fade-up animation: elements translate from below and fade in.
     */
    const fadeUp = useCallback(
        (selector: string | Element | Element[], options?: AnimationOptions) => {
            const ctx = gsap.context(() => {
                gsap.fromTo(
                    selector,
                    {
                        opacity: 0,
                        y: options?.y ?? DEFAULTS.y,
                    },
                    {
                        opacity: 1,
                        y: 0,
                        duration: options?.duration ?? DEFAULTS.duration,
                        delay: options?.delay ?? 0,
                        ease: options?.ease ?? DEFAULTS.ease,
                        scrollTrigger: {
                            trigger:
                                typeof selector === "string"
                                    ? selector
                                    : Array.isArray(selector)
                                        ? selector[0]
                                        : selector,
                            start: options?.start ?? DEFAULTS.start,
                            toggleActions: "play none none none",
                        },
                    }
                );
            });
            contextRef.current = ctx;
        },
        []
    );

    /**
     * Stagger-up animation: children animate in sequence.
     */
    const staggerUp = useCallback(
        (
            parentSelector: string,
            childSelector: string,
            options?: AnimationOptions
        ) => {
            const ctx = gsap.context(() => {
                gsap.fromTo(
                    `${parentSelector} ${childSelector}`,
                    {
                        opacity: 0,
                        y: options?.y ?? DEFAULTS.y,
                    },
                    {
                        opacity: 1,
                        y: 0,
                        duration: options?.duration ?? DEFAULTS.duration,
                        delay: options?.delay ?? 0,
                        ease: options?.ease ?? DEFAULTS.ease,
                        stagger: options?.stagger ?? DEFAULTS.stagger,
                        scrollTrigger: {
                            trigger: parentSelector,
                            start: options?.start ?? DEFAULTS.start,
                            toggleActions: "play none none none",
                        },
                    }
                );
            });
            contextRef.current = ctx;
        },
        []
    );

    /**
     * Slide-in animation: element slides from left or right.
     */
    const slideIn = useCallback(
        (
            selector: string,
            direction: "left" | "right" = "left",
            options?: AnimationOptions
        ) => {
            const xVal = direction === "left" ? -(options?.x ?? 60) : (options?.x ?? 60);
            const ctx = gsap.context(() => {
                gsap.fromTo(
                    selector,
                    {
                        opacity: 0,
                        x: xVal,
                    },
                    {
                        opacity: 1,
                        x: 0,
                        duration: options?.duration ?? DEFAULTS.duration,
                        delay: options?.delay ?? 0,
                        ease: options?.ease ?? DEFAULTS.ease,
                        stagger: options?.stagger ?? 0,
                        scrollTrigger: {
                            trigger: selector,
                            start: options?.start ?? DEFAULTS.start,
                            toggleActions: "play none none none",
                        },
                    }
                );
            });
            contextRef.current = ctx;
        },
        []
    );

    /**
     * Scale-in animation: element scales from smaller and fades in.
     */
    const scaleIn = useCallback(
        (selector: string, options?: AnimationOptions) => {
            const ctx = gsap.context(() => {
                gsap.fromTo(
                    selector,
                    {
                        opacity: 0,
                        scale: options?.scale ?? 0.85,
                    },
                    {
                        opacity: 1,
                        scale: 1,
                        duration: options?.duration ?? DEFAULTS.duration,
                        delay: options?.delay ?? 0,
                        ease: options?.ease ?? "back.out(1.4)",
                        stagger: options?.stagger ?? DEFAULTS.stagger,
                        scrollTrigger: {
                            trigger: selector,
                            start: options?.start ?? DEFAULTS.start,
                            toggleActions: "play none none none",
                        },
                    }
                );
            });
            contextRef.current = ctx;
        },
        []
    );

    /**
     * Split reveal: two elements (left & right) animate in simultaneously
     * from opposite directions.
     */
    const splitReveal = useCallback(
        (
            triggerSelector: string,
            leftSelector: string,
            rightSelector: string,
            options?: AnimationOptions
        ) => {
            const ctx = gsap.context(() => {
                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: triggerSelector,
                        start: options?.start ?? DEFAULTS.start,
                        toggleActions: "play none none none",
                    },
                });

                tl.fromTo(
                    leftSelector,
                    { opacity: 0, x: -(options?.x ?? 50) },
                    {
                        opacity: 1,
                        x: 0,
                        duration: options?.duration ?? DEFAULTS.duration,
                        ease: options?.ease ?? DEFAULTS.ease,
                    }
                ).fromTo(
                    rightSelector,
                    { opacity: 0, x: options?.x ?? 50 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: options?.duration ?? DEFAULTS.duration,
                        ease: options?.ease ?? DEFAULTS.ease,
                    },
                    "<0.15"
                );
            });
            contextRef.current = ctx;
        },
        []
    );

    return { fadeUp, staggerUp, slideIn, scaleIn, splitReveal };
}
