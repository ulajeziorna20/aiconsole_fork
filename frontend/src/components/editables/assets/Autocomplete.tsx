// The AIConsole Project
//
// Copyright 2023 10Clouds
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { ChangeEvent, useRef, useState } from 'react';

import { Icon } from '@/components/common/icons/Icon';
import { useChatStore } from '@/store/editables/chat/useChatStore';
import { cn } from '@/utils/common/cn';
import { useClickOutside } from '@/utils/common/useClickOutside';
import { getEditableObjectIcon } from '@/utils/editables/getEditableObjectIcon';
import { Agent, Material } from '@/types/editables/assetTypes';
import { AgentAvatar } from '../chat/AgentAvatar';
import { Pin, Plus } from 'lucide-react';

type AutocompleteProps = {
  materialOptions: Material[];
  agentOptions: Agent[];
  onMaterialSelect: (option: Material) => void;
  className?: string;
};

const ChatOption = ({
  option,
  selectOption,
  disabled,
}: {
  option: Material;
  selectOption: (id: string) => void;
  disabled: boolean;
}) => {
  const OptionIcon = getEditableObjectIcon(option);

  return (
    <div className="flex justify-between items-center max-w-full w-max gap-3 hover:bg-gray-600 px-2.5 py-2 rounded-[8px] max-h-[32px]">
      <Icon icon={OptionIcon} className="w-6 h-6 min-h-6 min-w-6 text-material" />
      <p className="flex-1 truncate font-normal text-sm">{option.name}</p>
      <button onClick={() => selectOption(option.id)} disabled={disabled}>
        <Icon icon={Plus} />
      </button>
    </div>
  );
};

const Autocomplete = ({ materialOptions, agentOptions, onMaterialSelect, className }: AutocompleteProps) => {
  const [inputValue, setInputValue] = useState('');
  const [filteredMaterialOptions, setFilteredMaterialOptions] = useState<Material[]>(materialOptions);
  const [filteredAgentsOptions, setFilteredAgentsOptions] = useState<Agent[]>(agentOptions);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isChatLoading = useChatStore((state) => state.isChatLoading);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setInputValue(inputValue);

    const regex = new RegExp(`^${inputValue}`, 'i');
    const filteredMaterialOptions = materialOptions.filter((item) => regex.test(item.name));
    const filteredAgentOptions = agentOptions.filter((item) => regex.test(item.name));
    setFilteredAgentsOptions(filteredAgentOptions);
    setFilteredMaterialOptions(filteredMaterialOptions);
  };

  const handleMaterialSelect = (selectedOption: Material) => {
    onMaterialSelect(selectedOption);
    setInputValue('');
    setFilteredMaterialOptions([]);
  };

  const handleClickOutside = () => {
    setInputValue('');
    setFilteredMaterialOptions([]);
  };

  useClickOutside(wrapperRef, handleClickOutside);

  return (
    <div className={cn('relative flex flex-col gap-2', className)} ref={wrapperRef}>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder="Search for an agent or material"
        className="bg-transparent p-2 focus:outline-none border-gray-400 text-white w-full placeholder:text-gray-400 placeholder:text-[15px]"
        disabled={isChatLoading}
      />
      <ul className="max-h-[176px] overflow-y-auto border-b border-gray-600">
        {filteredAgentsOptions.length === 0 ? (
          <p className="text-sm p-2">There is no agent with this name.</p>
        ) : (
          filteredAgentsOptions.map((option) => {
            return (
              <li
                key={option.id}
                className={cn(
                  'w-full overflow-hidden p-2 flex items-center cursor-pointer hover:bg-gray-600 rounded-[8px] max-h-[44px] gap-2',
                )}
              >
                <AgentAvatar agentId={option.id} title={option.name} type="extraSmall" className="mb-0 mt-0" />
                <h4 className="text-white ml-[4px]">{option.name}</h4>
                <span className="text-sm truncate">{option.usage}</span>
                <Icon icon={Pin} className="w-4 h-4 min-h-4 min-w-4 max-h-4 max-w-4" width={16} height={16} />
              </li>
            );
          })
        )}
      </ul>
      <div className="max-h-[108px] overflow-y-auto flex gap-2 w-full flex-wrap">
        {filteredMaterialOptions.length === 0 ? (
          <p className="text-sm p-2">There is no material with this name.</p>
        ) : (
          filteredMaterialOptions.map((option) => (
            <ChatOption
              option={option}
              selectOption={() => console.log('test')}
              key={option.id}
              disabled={isChatLoading}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Autocomplete;
