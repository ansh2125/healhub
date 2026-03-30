import { motion } from "framer-motion";

const GlowButton = ({ children, onClick }) => {
    return (
        <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            onClick={onClick}
            className="px-4 py-2 rounded-xl bg-indigo-500 text-white shadow-lg hover:shadow-indigo-500/50 transition"
        >
            {children}
        </motion.button>
    );
};

export default GlowButton;