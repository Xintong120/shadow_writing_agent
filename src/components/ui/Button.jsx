function Button({
    children,
    variant = "primary",
    size = "medium",
    className = "",
    onClick,
    ...props
}) {
    const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed has-[>svg]:gap-2"
    
    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-700",
        secondary: "bg-gray-600 text-white hover:bg-gray-700",
        outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50",
        ghost: "hover:bg-gray-100 text-gray-700",
        link: "text-blue-600 underline-offset-4 hover:underline",
        destructive: "bg-red-600 text-white hover:bg-red-700",
    }

    const sizes = {
        small: "px-3 py-1.5 text-sm",
        medium: "px-4 py-2 text-base",
        large: "px-6 py-3 text-lg"
    }

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    )
}

export default Button