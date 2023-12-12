import { Icon } from '@/components/common/icons/Icon';
import { cn } from '@/utils/common/cn';
import { MATERIAL_CONTENT_TYPE_ICONS, getEditableObjectIcon } from '@/utils/editables/getEditableObjectIcon';
import { Menu } from '@mantine/core';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

const ChatIcon = getEditableObjectIcon('chat');
const MaterialNoteIcon = MATERIAL_CONTENT_TYPE_ICONS['static_text'];
const MaterialDynamicNoteIcon = MATERIAL_CONTENT_TYPE_ICONS['dynamic_text'];
const MaterialPythonAPIIcon = MATERIAL_CONTENT_TYPE_ICONS['api'];
const AgentIcon = getEditableObjectIcon('agent');

const getDropdownItems = () => [
  {
    key: 'chat',
    icon: <Icon icon={ChatIcon} className="w-6 h-6 !text-chat" />,
    title: 'New chat',
    path: `/chats/${uuidv4()}`,
    withDivider: true,
  },
  {
    key: 'agent',
    icon: <Icon icon={AgentIcon} className="w-6 h-6 !text-agent" />,
    title: 'New agent',
    path: `/agents/new`,
    withDivider: true,
  },
  {
    key: 'materials',
    title: 'Materials:',
    disabled: true,
  },
  {
    key: 'note',
    icon: <Icon icon={MaterialNoteIcon} className="w-6 h-6 !text-material" />,
    title: 'New note',
    path: `/materials/new?type=static_text`,
  },
  {
    key: 'dynamic_note',
    icon: <Icon icon={MaterialDynamicNoteIcon} className="w-6 h-6 !text-material" />,
    title: 'New dynamic note',
    path: `/materials/new?type=dynamic_text`,
  },
  {
    key: 'python_api',
    icon: <Icon icon={MaterialPythonAPIIcon} className="w-6 h-6 !text-material" />,
    title: 'New python API',
    path: `/materials/new?type=api`,
  },
];

export const AddAssetDropdown = () => {
  const [opened, setOpened] = useState(false);
  const navigate = useNavigate();

  const handleClick = (path?: string) => () => {
    if (path) {
      console.log(path);
      navigate(path);
    }
  };

  const dropdownItems = getDropdownItems();

  return (
    <Menu
      opened={opened}
      onChange={setOpened}
      width="target"
      offset={0}
      classNames={{
        dropdown: cn('bg-gray-700 border-t-0 border-gray-800 p-0', {
          'rounded-t-none ': opened,
        }),
      }}
    >
      <Menu.Target>
        <button
          className={cn(
            'group flex justify-center align-center gap-[12px] rounded-[8px] border border-gray-500 px-[16px] py-[10px] text-gray-300 text-[16px] font-semibold w-[200px] leading-[23px] hover:border-gray-300 transition duration-200 hover:text-gray-300',
            {
              'rounded-b-none bg-gray-700 border-gray-800 text-gray-500': opened,
            },
          )}
        >
          <Icon icon={Plus} width={24} height={24} />
          Add new
          <Icon
            icon={opened ? ChevronUp : ChevronDown}
            width={24}
            height={24}
            className="text-gray-500 ml-auto group-hover:text-gray-300 transition duration-200 w-[24px] h-[24px]"
          />
        </button>
      </Menu.Target>

      <Menu.Dropdown>
        {dropdownItems.map(({ icon, title, path, key, disabled, withDivider }) => (
          <Menu.Item
            key={key}
            onClick={handleClick(path)}
            className={cn('group flex p-0 rounded-none hover:bg-gray-600', {
              'pointer-events-none': disabled,
            })}
          >
            <div
              className={cn(
                'flex items-center gap-[12px] px-[16px] py-[10px] text-[14px] text-gray-300 group-hover:text-white',
                {
                  'text-gray-500 pb-0 ': disabled,
                  'border-b border-gray-800': withDivider,
                },
              )}
            >
              {icon}
              <p>{title}</p>
            </div>
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
};
