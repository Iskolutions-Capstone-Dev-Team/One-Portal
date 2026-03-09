import { motion } from "framer-motion";

export default function MotionWrapper({ children, keyId }) {
    return (
        <motion.div
            key={keyId}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0}}
            exit={{ opacity:0, y: 20 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
        >
            {children}
        </motion.div>
    );
}