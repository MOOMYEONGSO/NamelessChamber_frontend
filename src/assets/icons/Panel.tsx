type Props = {
  size?: number;
  color?: string;
};

export default function Panel({ size = 26, color = "currentColor" }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-hidden="true"
    >
      <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
      <line x1="9" y1="4.5" x2="9" y2="19.5" />
    </svg>
  );
}
