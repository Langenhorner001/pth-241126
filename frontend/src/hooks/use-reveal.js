import { useInView } from "react-intersection-observer";
import { useReducedMotion } from "framer-motion";

export const useReveal = (options = {}) => {
    const reduced = useReducedMotion();
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.15,
        rootMargin: "-40px 0px",
        ...options
    });
    return {
        ref,
        inView,
        initial: { opacity: 0, y: reduced ? 0 : 18 },
        animate: inView ? { opacity: 1, y: 0 } : { opacity: 0, y: reduced ? 0 : 18 },
        transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] }
    };
};
