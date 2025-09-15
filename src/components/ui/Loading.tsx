const HouseIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 9l-4.5-1.636M2.25 9.003l7.5 4.118 7.5-4.118M2.25 9.003V21m11.25-6.75a.75.75 0 00-1.5 0v2.25a.75.75 0 001.5 0v-2.25z"
    />
  </svg>
);

interface LoadingProps {
  text?: string;
}

export default function Loading({ text = 'Abriendo las puertas del barrio...' }: Readonly<LoadingProps>) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
      <HouseIcon className="text-primary h-12 w-12 animate-pulse" />
      <p className="text-lg font-semibold text-neutral-500">{text}</p>
    </div>
  );
}
