import { Button } from '@/components/common/Button';
import { Icon } from '@/components/common/icons/Icon';
import { Asset, AssetType } from '@/types/editables/assetTypes';
import { cn } from '@/utils/common/cn';
import { IterationCcw, X } from 'lucide-react';
import { useState } from 'react';

interface AssetInfoBarProps {
  asset: Asset;
  hasCore: boolean;
  assetType: AssetType;
  lastSavedAsset: Asset | undefined;
  onRevert: () => void;
}

export const RestoreButton = ({ onRevert }: { onRevert: () => void }) => (
  <Button variant="tertiary" onClick={onRevert} small classNames="p-0">
    <Icon icon={IterationCcw} /> Restore original
  </Button>
);

export const AssetInfoBar = ({ asset, hasCore, assetType, lastSavedAsset, onRevert }: AssetInfoBarProps) => {
  const [visible, setVisible] = useState(true);

  const hide = () => setVisible(false);

  return hasCore && visible ? (
    <div
      className={cn(
        'bg-gray-800 flex items-center justify-center gap-[20px] leading-[18px] text-white text-center text-[14px] px-[20px] py-[16px] absolute right-0 left-0',
        {
          'bg-grayPurple-800': asset.defined_in === 'project',
        },
      )}
    >
      {asset.defined_in === 'aiconsole' && <span>This is a system {assetType} start editing to overwrite it.</span>}
      {asset.defined_in === 'project' && (
        <>
          <span>
            This {assetType} {lastSavedAsset !== undefined ? 'is overwriting' : 'will overwrite'} a default system{' '}
            {assetType}.
          </span>
          <RestoreButton onRevert={onRevert} />
        </>
      )}
      <Icon icon={X} className="absolute right-[30px] cursor-pointer" onClick={hide} />
    </div>
  ) : null;
};
