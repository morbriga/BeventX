export function Button({ className, ...props }) {
    return <button className={`p-2 rounded ${className}`} {...props} />;
  }