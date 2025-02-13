import { motion } from "framer-motion";

export const Loading = ({ className }) => {
	const slideAnimation = {
		initial: { x: "170%" },
		animate: {
			x: ["-170%", "170%"],
			transition: {
				duration: 1.5,
				ease: "easeInOut",
				repeat: Infinity,
				repeatType: "reverse",
			},
		},
	};

	return (
		<motion.div
			className={`flex flex-col items-center justify-center h-full ${className}`}
		>
			<motion.div className="flex items-center justify-center w-52 h-2.5 gap-2 overflow-hidden bg-gray-300 rounded-full">
				<motion.span
					variants={slideAnimation}
					initial="initial"
					animate="animate"
					className="w-20 h-full bg-gray-400 rounded-full"
				/>
			</motion.div>

			<h3 className="mt-2 font-medium text-md">Loading please wait...</h3>
		</motion.div>
	);
};
