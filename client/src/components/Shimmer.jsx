import PropTypes from "prop-types";

function Shimmer({
  count = 1,
  type = "card",
  className = "",
  placeholderStyles = [],
}) {
  // Default placeholder styles for different types
  const defaultStyles = {
    card: [
      { height: "h-8", width: "w-3/4", className: "mb-4" }, // Title
      { height: "h-4", width: "w-1/2", className: "mb-2" }, // Detail line 1
      { height: "h-4", width: "w-2/3", className: "mb-2" }, // Detail line 2
      { height: "h-4", width: "w-1/3", className: "mb-2" }, // Detail line 3
      { height: "h-4", width: "w-1/2", className: "mb-2" }, // Detail line 4
      { height: "h-4", width: "w-2/3", className: "mb-2" }, // Detail line 5
      { height: "h-6", width: "w-1/3", className: "mt-5 mb-3" }, // Section header
      { height: "h-36", width: "w-full", className: "" }, // Image placeholder 1
      { height: "h-36", width: "w-full", className: "" }, // Image placeholder 2
      { height: "h-10", width: "w-20", className: "mt-5 mr-3" }, // Button 1
      { height: "h-10", width: "w-20", className: "mt-5" }, // Button 2
    ],
    list: [
      { height: "h-6", width: "w-full", className: "mb-2" }, // List item
      { height: "h-6", width: "w-3/4", className: "mb-2" }, // List item
      { height: "h-6", width: "w-5/6", className: "mb-2" }, // List item
    ],
    circle: [
      {
        height: "h-6",
        width: "w-6",
        className:
          "rounded-full border-2 border-gray-300 border-t-transparent animate-spin",
      },
    ],
  };

  // Use custom placeholder styles if provided, otherwise use defaults based on type
  const placeholders =
    placeholderStyles.length > 0
      ? placeholderStyles
      : defaultStyles[type] || defaultStyles.card;

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`animate-pulse ${
            type === "card"
              ? "bg-white p-6 rounded-lg shadow-lg max-w-sm"
              : "p-4"
          } ${className}`}
        >
          {placeholders.map((style, idx) => (
            <div
              key={idx}
              className={`bg-gray-200 rounded shimmer-bg ${style.height} ${style.width} ${style.className}`}
            />
          ))}
        </div>
      ))}
    </>
  );
}

Shimmer.propTypes = {
  count: PropTypes.number, // Number of shimmer placeholders to render
  type: PropTypes.oneOf(["card", "list", "custom"]), // Type of shimmer layout
  className: PropTypes.string, // Additional classes for the container
  placeholderStyles: PropTypes.arrayOf(
    PropTypes.shape({
      height: PropTypes.string, // Tailwind height class (e.g., 'h-8')
      width: PropTypes.string, // Tailwind width class (e.g., 'w-3/4')
      className: PropTypes.string, // Additional Tailwind classes (e.g., 'mb-2')
    })
  ), // Custom placeholder styles
};

Shimmer.defaultProps = {
  count: 1,
  type: "card",
  className: "",
  placeholderStyles: [],
};

export default Shimmer;
