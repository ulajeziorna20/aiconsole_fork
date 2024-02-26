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

import { useCallback, useEffect, useState } from 'react';
import { unstable_useBlocker as useBlocker, useNavigate, useParams } from 'react-router-dom';

import AlertDialog from '@/components/common/AlertDialog';
import { Button } from '@/components/common/Button';
import { Icon } from '@/components/common/icons/Icon';
import { useToastsStore } from '@/store/common/useToastsStore';
import { useAssetStore } from '@/store/editables/asset/useAssetStore';
import { Agent, Asset, AssetType, Material } from '@/types/editables/assetTypes';
import { cn } from '@/utils/common/cn';
import { localStorageTyped } from '@/utils/common/localStorage';
import { useAssets } from '@/utils/editables/useAssets';
import { useEditableObjectContextMenu } from '@/utils/editables/useContextMenuForEditable';
import { usePrevious } from '@mantine/hooks';
import { CheckCheck, Trash } from 'lucide-react';
import { EditablesAPI } from '../../../api/api/EditablesAPI';
import { useAssetChanged } from '../../../utils/editables/useAssetChanged';
import { ContextMenu } from '../../common/ContextMenu';
import { EditorHeader } from '../EditorHeader';
import { AgentForm } from './AgentForm';
import { AssetInfoBar } from './AssetInfoBar';
import { MaterialForm } from './MaterialForm';
import { ErrorObject, checkErrors } from './TextInput';
import { useAssetEditor } from './useAssetEditor';
import { getBaseURL } from '@/store/useAPIStore';

const { setItem } = localStorageTyped<boolean>('isAssetChanged');

enum SubmitButtonLabels {
  Overwrite = 'Overwrite',
  Create = 'Create',
  RenameAndSave = 'Rename and Save Changes',
  SaveChanges = 'Save Changes',
  Saved = 'Saved',
}

export function AssetEditor({ assetType }: { assetType: AssetType }) {
  const params = useParams();
  const id = params.id || '';
  const editableObjectType = assetType;
  const isNew = id === 'new';

  const [newPath, setNewPath] = useState<string>('');
  const [hasCore, setHasCore] = useState(false);
  const [errors, setErrors] = useState<ErrorObject>({
    executionMode: '',
  });

  const [avatarUrl, setAvatarUrl] = useState<string>('');

  const [avatarData, setAvatarData] = useState<File | null>(null);
  const [isAvatarOverwritten, setIsAvatarOverwritten] = useState(false);
  const [isVisibleInfoBar, setIsVisibleInfoBar] = useState(true);
  const [avatarIsSaved, setAvatarIsSaved] = useState<Boolean>(false);
  const asset = useAssetStore((state) => state.selectedAsset);
  const lastSavedAsset = useAssetStore((state) => state.lastSavedSelectedAsset);
  const setLastSavedSelectedAsset = useAssetStore((state) => state.setLastSavedSelectedAsset);
  const setSelectedAsset = useAssetStore((state) => state.setSelectedAsset);
  const showToast = useToastsStore((state) => state.showToast);

  const navigate = useNavigate();
  const isAssetChanged = useAssetChanged(isAvatarOverwritten);
  const blocker = useBlocker(isAssetChanged);
  const isPrevAssetChanged = usePrevious(isAssetChanged);
  const { updateStatusIfNecessary, isAssetStatusChanged, renameAsset } = useAssets(assetType);
  const { handleRevert, getInitialAsset, handleRename, handleDeleteWithInteraction } =
    useAssetEditor(editableObjectType);
  const menuItems = useEditableObjectContextMenu({
    editable: asset,
    editableObjectType: assetType,
  });
  const isSystemAsset = asset?.defined_in === 'aiconsole';
  const isProjectAsset = asset?.defined_in === 'project';
  const wasAssetChangedInitially = !isPrevAssetChanged && isAssetChanged;
  const wasAssetUpdate = isPrevAssetChanged && !isAssetChanged;

  const { reset, proceed, state: blockerState } = blocker || {};

  useEffect(() => {
    if (wasAssetUpdate && newPath) {
      navigate(newPath);
      setNewPath('');
    }
  }, [newPath, isAssetChanged, wasAssetUpdate, navigate]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent | CloseEvent) => {
      if (isAssetChanged) {
        e.preventDefault();
      }
    };

    if (window.electron) {
      window.electron.registerBeforeUnloadListener(isAssetChanged);
    } else {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      if (window.electron) {
        window.electron.disposeBeforeUnloadListener();
      } else {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      }
    };
  }, [isAssetChanged]);

  useEffect(() => {
    setItem(isAssetChanged);
  }, [isAssetChanged]);

  // Acquire the initial object
  useEffect(() => {
    getInitialAsset();

    return () => {
      setSelectedAsset(undefined);
      // setLastSavedSelectedAsset(undefined);
    };
  }, [getInitialAsset, setLastSavedSelectedAsset, setSelectedAsset]);

  useEffect(() => {
    if (!assetType || !asset?.id) {
      setHasCore(false);
      return;
    }

    if (
      !wasAssetChangedInitially &&
      Boolean(asset) &&
      ((isProjectAsset && asset.override) || (isSystemAsset && !asset.override))
    ) {
      setHasCore(true);
      return;
    }

    if (asset && isSystemAsset && wasAssetChangedInitially) {
      EditablesAPI.doesEdibleExist(assetType, asset?.id, 'aiconsole').then((exists) => {
        setHasCore(exists);
        // setSelectedAsset({ ...asset, defined_in: 'project', override: exists } as Asset);
        // setLastSavedSelectedAsset(undefined);
      });
    }
  }, [
    asset,
    setSelectedAsset,
    wasAssetChangedInitially,
    setLastSavedSelectedAsset,
    assetType,
    isSystemAsset,
    isProjectAsset,
  ]);

  const handleSaveClick = useCallback(async () => {
    if (asset === undefined) {
      return;
    }

    const userAgentAvatarUrl = `${getBaseURL()}/api/agents/${asset.id}/image?version=${asset?.version}`;
    setAvatarUrl(userAgentAvatarUrl);

    if (lastSavedAsset === undefined) {
      if (!asset.override && isNew) {
        await EditablesAPI.saveNewEditableObject(editableObjectType, asset.id, asset);
        await updateStatusIfNecessary();

        showToast({
          title: 'Saved',
          message: `The ${assetType} has been successfully saved.`,
          variant: 'success',
        });
      } else {
        await EditablesAPI.updateEditableObject(editableObjectType, asset);
        showToast({
          title: 'Overwritten',
          message: `The ${assetType} has been overwritten.`,
          variant: 'success',
        });
      }
    } else if (lastSavedAsset && lastSavedAsset.id !== asset.id) {
      await renameAsset(lastSavedAsset.id, asset);
      lastSavedAsset.status = 'disabled';
      await EditablesAPI.setAssetStatus(assetType, lastSavedAsset.id, lastSavedAsset.status);
      showToast({
        title: 'Overwritten',
        message: `The ${assetType} has been overwritten.`,
        variant: 'success',
      });
    } else {
      if (isAssetChanged) {
        await EditablesAPI.updateEditableObject(editableObjectType, asset);

        showToast({
          title: 'Saved',
          message: `The ${assetType} has been successfully saved.`,
          variant: 'success',
        });
      }
      await updateStatusIfNecessary();
    }

    if (lastSavedAsset?.id !== asset.id) {
      useAssetStore.setState({ lastSavedSelectedAsset: asset });
      setNewPath(`/${editableObjectType}s/${asset.id}`);
    } else {
      // Reload the asset from server
      const newAsset = await EditablesAPI.fetchEditableObject<Material>({
        editableObjectType,
        id: asset.id,
      });
      setSelectedAsset(newAsset);
      useAssetStore.setState({ lastSavedSelectedAsset: newAsset });
      setAvatarIsSaved(true);
    }

    let avatarFormData: FormData | null = null;

    if (isAvatarOverwritten && avatarData) {
      avatarFormData = new FormData();
      avatarFormData.append('avatar', avatarData);
      await EditablesAPI.setAgentAvatar(asset.id, avatarFormData);
      setIsAvatarOverwritten(false);
    }
  }, [
    asset,
    lastSavedAsset,
    isAvatarOverwritten,
    avatarData,
    editableObjectType,
    updateStatusIfNecessary,
    showToast,
    assetType,
    renameAsset,
    isAssetChanged,
    setSelectedAsset,
    isNew,
  ]);

  useEffect(() => {
    if (asset) {
      const userAgentAvatarUrl = `${getBaseURL()}/api/agents/${asset.id}/image?version=${asset?.version}`;
      setAvatarUrl(userAgentAvatarUrl);
    }
  }, [asset?.version]);

  const getSubmitButtonLabel = useCallback((): SubmitButtonLabels => {
    if (lastSavedAsset === undefined) {
      return hasCore ? SubmitButtonLabels.Overwrite : SubmitButtonLabels.Create;
    } else if (lastSavedAsset && lastSavedAsset.id !== asset?.id) {
      return isAssetChanged ? SubmitButtonLabels.RenameAndSave : SubmitButtonLabels.Saved;
    } else {
      return isAssetChanged ? SubmitButtonLabels.SaveChanges : SubmitButtonLabels.Saved;
    }
  }, [asset?.id, hasCore, isAssetChanged, lastSavedAsset]);

  const submitButtonLabel = getSubmitButtonLabel();
  const isSavedButtonLabel = submitButtonLabel === SubmitButtonLabels.Saved;
  const hasNameAndId = asset?.id && asset?.name;
  const enableSubmitRule = (isAssetChanged || isAssetStatusChanged) && hasNameAndId;

  const enableSubmit = () => {
    if (isNew) {
      return hasNameAndId;
    }

    return enableSubmitRule;
  };

  const isSubmitEnabled = enableSubmit();
  const disableSubmit = (!isSubmitEnabled && !isSavedButtonLabel) || checkErrors(errors);

  const confirmPageEscape = () => {
    getInitialAsset();
    setItem(false);
    proceed?.();
  };

  const discardChanges = () => {
    getInitialAsset();
    reset?.();
  };

  const assetSourceLabel = useCallback(() => {
    switch (asset?.defined_in) {
      case 'aiconsole':
        return `System ${assetType}`;
      case 'project':
        return `Custom ${assetType}`;
    }
  }, [asset?.defined_in, assetType]);

  const revertAsset = () => handleRevert(asset?.id);

  const hideInfoBar = () => setIsVisibleInfoBar(false);

  return (
    <div className="flex flex-col w-full h-full max-h-full overflow-hidden">
      <ContextMenu options={menuItems}>
        <EditorHeader
          editable={asset}
          editableObjectType={editableObjectType}
          onRename={handleRename}
          isChanged={isAssetChanged}
        >
          <div className="flex gap-[20px] items-center">
            <p className={cn('text-[15px]', { 'font-bold': isSystemAsset })}>
              {assetSourceLabel()} {hasCore ? <span className="text-gray-300">(overwritten)</span> : null}
            </p>
            {/* {isProjectAsset ? <RestoreButton onRevert={revertAsset} /> : null} */}
          </div>
        </EditorHeader>
      </ContextMenu>

      <div className="flex-grow overflow-hidden">
        <div className="flex w-full h-full flex-col justify-between">
          <div className="w-full h-full overflow-hidden relative">
            {asset && (
              <AssetInfoBar
                asset={asset}
                hasCore={hasCore}
                assetType={assetType}
                lastSavedAsset={lastSavedAsset}
                onRevert={revertAsset}
                isVisible={isVisibleInfoBar}
                hideBar={hideInfoBar}
              />
            )}
            {asset && (
              <div
                className={cn('flex-grow flex flex-col overflow-auto px-[60px] py-10 gap-5 h-full', {
                  'h-[calc(100%-50px)]': isVisibleInfoBar,
                })}
              >
                {assetType === 'material' ? (
                  <MaterialForm material={asset as Material} />
                ) : (
                  <AgentForm
                    avatarUrl={avatarUrl}
                    setAvatarUrl={setAvatarUrl}
                    agent={asset as Agent}
                    setErrors={setErrors}
                    avatarIsSaved={avatarIsSaved}
                    errors={errors}
                    avatarData={avatarData}
                    setAvatarData={setAvatarData}
                    isAvatarOverwritten={isAvatarOverwritten}
                    setIsAvatarOverwritten={setIsAvatarOverwritten}
                    onRevert={revertAsset}
                  />
                )}
                <div className="flex items-center justify-between w-full gap-[10px]">
                  {isProjectAsset && lastSavedAsset ? (
                    <AlertDialog
                      title={`Are you sure you want to delete this ${editableObjectType}?`}
                      confirmationButtonText="Okay"
                      onConfirm={() => handleDeleteWithInteraction(asset.id)}
                      openModalButton={
                        <Button variant="tertiary">
                          <Icon icon={Trash} /> Delete {assetType}
                        </Button>
                      }
                    >
                      This process is irreversible.
                    </AlertDialog>
                  ) : null}
                  <Button
                    disabled={disableSubmit}
                    onClick={handleSaveClick}
                    active={isSavedButtonLabel}
                    classNames="ml-auto"
                  >
                    {submitButtonLabel} {isSavedButtonLabel ? <Icon icon={CheckCheck} /> : null}
                  </Button>
                </div>
              </div>
            )}
            <AlertDialog
              title={`Do you want to leave the ${assetType} settings?`}
              isOpen={blockerState === 'blocked'}
              onClose={discardChanges}
              onConfirm={confirmPageEscape}
              confirmationButtonText="Leave"
              cancelButtonText="Cancel"
            >
              Changes that you made may not be saved.
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
}
