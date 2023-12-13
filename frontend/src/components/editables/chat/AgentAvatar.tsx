import { useAssetStore } from '@/store/editables/asset/useAssetStore';
import { useAPIStore } from '@/store/useAPIStore';
import { cn } from '@/utils/common/cn';

interface AgentAvatarProps {
  agentId: string;
  title?: string;
  type: 'large' | 'small';
  className?: string;
}

export function AgentAvatar({ agentId, title, type, className }: AgentAvatarProps) {
  const agent = useAssetStore((state) => state.getAsset('agent', agentId));
  const getBaseURL = useAPIStore((state) => state.getBaseURL);

  return (
    <img
      title={title}
      src={`${getBaseURL()}/profile/${agentId}.jpg`}
      className={cn(className, 'rounded-full mb-[10px]  border shadow-md border-slate-800', {
        'w-20 h-20 ': type === 'large',
        'w-16 h-16': type === 'small',
        'border border-agent shadow-agent': agent?.status === 'forced',
      })}
    />
  );
}
