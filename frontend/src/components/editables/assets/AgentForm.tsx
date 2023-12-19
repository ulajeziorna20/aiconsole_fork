/* eslint-disable @typescript-eslint/no-unused-vars */
import { FormGroup } from '@/components/common/FormGroup';
import { CodeInput } from './CodeInput';
import { TextInput } from './TextInput';
import { Agent } from '@/types/editables/assetTypes';
import { useAssetStore } from '@/store/editables/asset/useAssetStore';
import { Select } from '@/components/common/Select';
import { useState } from 'react';
import { HelperLabel } from './HelperLabel';
import ImageUploader from '@/components/common/ImageUploader';

const executionModes = [
  {
    value: 'aiconsole.core.execution_modes.normal:execution_mode_normal',
    label: 'Normal',
  },
  {
    value: 'custom',
    label: 'Custom',
  },
];

interface AgentFormProps {
  agent: Agent;
}

// TODO: all commented lines are ready UI - integrate it with backend when ready
export const AgentForm = ({ agent }: AgentFormProps) => {
  const [executionMode, setExecutionMode] = useState('');
  const setSelectedAsset = useAssetStore((state) => state.setSelectedAsset);
  const handleChange = (value: string) => setSelectedAsset({ ...agent, usage: value });

  const handleSetExecutionMode = (value: string) => {
    setExecutionMode(value);
  };

  const setAsset = (value: string) =>
    setSelectedAsset({
      ...agent,
      system: value,
    } as Agent);

  const isCustomMode = executionMode !== 'custom';

  return (
    <>
      <div className="flex gap-[20px]">
        {/* <ImageUploader /> */}
        <FormGroup horizontal>
          <TextInput
            label="Usage"
            name="usage"
            fullWidth
            placeholder="Write text here"
            value={agent.usage}
            className="w-full"
            onChange={handleChange}
            helperText="Usage is used to help identify when this agent should be used. "
            resize
          />
        </FormGroup>
      </div>
      <FormGroup className="w-full h-full flex overflow-clip">
        <div className="flex-1">
          {/* <TextInput
            label="Execution mode"
            name="executionMode"
            placeholder="Write text here"
            value={executionMode}
            onChange={handleChange}
            className="mb-[20px]"
            helperText="Choose the right execution mode for your agent."
            hidden={isCustomMode}
            labelChildren={
              <Select options={executionModes} placeholder="Choose execution mode" onChange={handleSetExecutionMode} />
            }
          /> */}
          <CodeInput
            label="System prompt"
            labelContent={<HelperLabel helperText="Add your system prompt if needed." className="py-[13px]" />}
            value={agent.system}
            codeLanguage="markdown"
            // maxHeight={isCustomMode ? 'calc(100% - 120px)' : 'calc(100% - 200px)'}
            onChange={setAsset}
          />
        </div>
      </FormGroup>
    </>
  );
};
