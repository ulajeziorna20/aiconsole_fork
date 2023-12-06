import { LucideIcon, LucideProps } from 'lucide-react';

interface IconProps extends LucideProps {
  className?: string;
  icon: LucideIcon | ((props: React.SVGProps<SVGSVGElement>) => JSX.Element);
}

export const Icon = ({
  strokeWidth = '1.25',
  width = 16,
  height = 16,
  icon: Icon,
  ...props
}: IconProps): React.ReactElement => <Icon {...props} strokeWidth={strokeWidth} width={width} height={height} />;
