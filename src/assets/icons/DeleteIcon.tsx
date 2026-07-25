type Props = {
  size?: number;
  color?: string;
};

export default function DeleteIcon({
  size = 40,
  color = "currentColor",
}: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      width={size}
      height={size}
      fill="none"
      role="img"
      aria-hidden="true"
    >
      <rect width="40" height="40" rx="8" fill="#D9D9D9" fillOpacity="0.04" />
      <rect
        x="0.25"
        y="0.25"
        width="39.5"
        height="39.5"
        rx="7.75"
        stroke="#D9D9D9"
        strokeOpacity="0.08"
        strokeWidth="0.5"
      />
      <path
        d="M25.5 16.5V26C25.5 26.8284 24.8284 27.5 24 27.5H16C15.1716 27.5 14.5 26.8284 14.5 26V16.5H25.5Z"
        stroke={color}
      />
      <path
        d="M26.5 16.5V15C26.5 14.1716 25.8284 13.5 25 13.5H15C14.1716 13.5 13.5 14.1716 13.5 15V16.5H26.5Z"
        stroke={color}
      />
      <path
        d="M21.5 13.5V13C21.5 12.1716 20.8284 11.5 20 11.5C19.1716 11.5 18.5 12.1716 18.5 13V13.5H21.5Z"
        stroke={color}
      />
    </svg>
  );
}
