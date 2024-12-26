import Image from "next/image";

interface AvatarProps {
  url: string | null;
  username: string;
  size?: number;
  className?: string;
}

export function Avatar({ url, username, size = 50, className = "" }: AvatarProps) {
  const containerStyle = {
    width: size,
    height: size,
    minWidth: size,
    minHeight: size
  };

  // Check if URL is valid (starts with http/https)
  const isValidUrl = url && (
    url.startsWith('http://') || 
    url.startsWith('https://') || 
    url.startsWith('/') || // Allow relative URLs
    url.startsWith('data:') // Allow data URLs
  );

  if (!isValidUrl) {
    return (
      <div 
        style={containerStyle}
        className={`relative flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-full ${className}`}
      >
        <svg
          className="w-3/4 h-3/4 text-gray-400 dark:text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div 
      style={containerStyle}
      className={`relative overflow-hidden rounded-full ${className}`}
    >
      <Image
        src={url}
        alt={`${username}'s avatar`}
        fill
        className="object-cover"
        sizes={`${size}px`}
      />
    </div>
  );
}
