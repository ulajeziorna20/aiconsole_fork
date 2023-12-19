import { AssetType, EditableObject } from '@/types/editables/assetTypes';
import { getEditableObjectIcon } from '@/utils/editables/getEditableObjectIcon';
import { useState } from 'react';
import InlineEditableObjectName from './InlineEditableObjectName';
import { cn } from '@/utils/common/cn';
import { getEditableObjectType } from '@/utils/editables/getEditableObjectType';

interface EditorHeaderProps {
  editable?: EditableObject;
  onRename: (newName: string) => void;
  children?: React.ReactNode;
  isChanged?: boolean;
  editableObjectType: AssetType;
}

export function EditorHeader({ editable, onRename, children, isChanged, editableObjectType }: EditorHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);

  const Icon = getEditableObjectIcon(editable);
  const editableType = getEditableObjectType(editable);

  if (!editable) {
    return <div className="flex flex-col w-full h-full items-center justify-center"></div>;
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className="w-full flex-none flex flex-row gap-[10px] cursor-pointer px-[20px] py-[13px] border-b border-gray-600 bg-gray-90 shadow-md items-center overflow-clip relative"
    >
      <Icon
        className={cn(
          'flex-none',
          editableType === 'chat' && 'text-chat',
          editableType === 'agent' && 'text-agent',
          editableType === 'material' && 'text-material',
        )}
      />
      <div
        className={cn(
          'absolute bottom-[-20px] left-[15px] opacity-[0.3] blur-[10px]  h-[34px] w-[34px] group-hover:block',
          editableObjectType === 'agent' && 'fill-agent bg-agent',
          editableObjectType === 'material' && 'fill-material bg-material',
        )}
      />
      <InlineEditableObjectName
        editableObject={editable}
        onRename={onRename}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        className={'flex-grow truncate ' + (isChanged ? ' italic font-bold ' : '')}
      />
      <div className="self-end text-gray-400 text-[15px] min-w-fit">{children}</div>
    </div>
  );
}
