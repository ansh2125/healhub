import { motion } from "framer-motion";

const GlassCard = ({ children, className = "" }) => {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className={`p-4 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-lg ${className}`}
        >
            {children}
        </motion.div>
    );
};

export default GlassCard;