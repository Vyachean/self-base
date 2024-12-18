<script setup lang="ts">
import { ref } from 'vue';
import { MenuFolder } from '@entity/folder';
import { CreateDocumentForm } from '@feature/documentCreate';
import { ModalCard } from '@shared/ui/ModalCard';
import { DocumentRemoveForm } from '@feature/documentRemove';
import { WorkspaceFrame } from '../WorkspaceFrame';
import { GDriveDirectoryPickerForm } from '@feature/gDriveDirectoryPicker';
import WelcomeMessage from './WelcomeMessage.vue';
import { ViewWithPanelLayout } from '@shared/ui/ViewWithPanelLayout';
import { UIButton } from '@shared/ui/Button';
import { setupDocumentCreate } from './setupDocumentCreate';
import { setupGoogleDirectoryChoice } from './setupGoogleDirectoryChoice';
import { setupFolderChoice } from './setupFolderChoice';
import { setupDocumentRemove } from './setupDocumentRemove';
import { setupDocumentChoice } from './setupDocumentChoice';
import { setupDatabaseDocument } from '@widget/MainView/setupDatabaseDocument';
import { useCFRDocument } from '@entity/document';
import { ViewList } from '@entity/documentView';
import { DatabaseViewAddForm } from '@feature/databaseViewAdd';
import { DbPropertyCreateForm } from '@feature/databasePropertyCreate';
import { DbPropertyRemoveForm } from '@feature/databasePropertyRemove';
import { DbItemAdd } from '@feature/databaseItemAdd';
import { StingPropertyField } from '@feature/stringPropertyEdit';
import { PROPERTY_TYPE_STRING } from '@entity/stringProperty';
import { NumberPropertyField } from '@feature/numberPropertyEdit';
import { PROPERTY_TYPE_NUMBER } from '@entity/numberProperty';
import { BooleanPropertyField } from '@feature/booleanPropertyEdit';
import { PROPERTY_TYPE_BOOLEAN } from '@entity/booleanProperty';
import { DatePropertyField } from '@feature/datePropertyEdit';
import { PROPERTY_TYPE_DATE } from '@entity/dateProperty';

const isOpenPanel = ref(true);

const {
  contentFolderMap,
  isSupportLocalDirectory,
  onClickSelectDirectory,
  selectedDocumentFolder,
} = setupFolderChoice(isOpenPanel);

const {
  onCancelSelectGDirectory,
  onClickSelectGDirectory,
  onSelectGDirectory,
  openSelectGDirectory,
} = setupGoogleDirectoryChoice(selectedDocumentFolder);

const {
  isDisplayedDocumentCreationForm,
  onCancelCreateDocument,
  onClickCreateDocument,
  onCreatedDocument,
} = setupDocumentCreate(isOpenPanel);

const { documentIdForRemove, onCancelRemove, onClickRemove, onRemoved } =
  setupDocumentRemove();

const { onClickFolderDocument, selectedCFRDocument } =
  setupDocumentChoice(isOpenPanel);

const { doc } = useCFRDocument(selectedCFRDocument);

const {
  databaseProperties,
  databaseViews,
  hasAddProperty,
  hasRemoveProperty,
  isShowPropertyCreate,
  isShowPropertyRemove,
  isShowItemAdd,
  hasItemAdd,
  onAddItem,
  onCancelAddItem,
  stateNewItem,
  isShowViewAdd,
  isShowViewList,
  onSubmitViewAdd,
  selectedView,
  selectedViewId,
} = setupDatabaseDocument(selectedCFRDocument, doc);
</script>

<template>
  <ViewWithPanelLayout v-model:open-panel="isOpenPanel">
    <WorkspaceFrame
      v-if="selectedCFRDocument"
      :cfr-document="selectedCFRDocument"
      class="is-flex-grow-1"
      :selected-view-id
    />

    <WelcomeMessage v-else class="is-flex-grow-1" />

    <template #panel>
      <div class="p-1 block-spacing is-flex is-flex-direction-column">
        <div v-if="selectedCFRDocument" class="document-panel">
          <div class="button-grid">
            <div class="buttons has-addons">
              <UIButton class="is-flex-grow-1" :label="selectedView.name">
                <template #icon>
                  <i class="fa-solid fa-sliders" />
                </template>
              </UIButton>

              <UIButton
                :active="isShowViewList"
                @click="isShowViewList = !isShowViewList"
              >
                <template #icon>
                  <i class="fa-solid fa-caret-down" />
                </template>
              </UIButton>
            </div>

            <ViewList
              v-if="isShowViewList && databaseViews"
              class="card is-fullwidth is-shadowless is-overflow-x-auto"
              :views="databaseViews"
            >
              <template #default="{ id, view }">
                <UIButton
                  :label="view.name"
                  :active="selectedViewId === id"
                  @click="selectedViewId = id"
                >
                  <template #icon>
                    <i class="fa-solid fa-table" />
                  </template>
                </UIButton>
              </template>

              <template #after>
                <li>
                  <UIButton label="Add view" @click="isShowViewAdd = true">
                    <template #icon>
                      <i class="fa-solid fa-plus" />
                    </template>
                  </UIButton>
                </li>
              </template>
            </ViewList>

            <UIButton
              v-if="hasItemAdd"
              label="Add Item"
              @click="isShowItemAdd = true"
            >
              <template #icon><i class="fas fa-plus" /></template>
            </UIButton>

            <UIButton
              v-if="hasAddProperty"
              label="Add Property"
              @click="isShowPropertyCreate = true"
            >
              <template #icon><i class="fas fa-square-plus" /></template>
            </UIButton>

            <UIButton
              v-if="hasRemoveProperty"
              label="Remove Property"
              @click="isShowPropertyRemove = true"
            >
              <template #icon><i class="fas fa-trash" /></template>
            </UIButton>
          </div>

          <ModalCard v-if="isShowViewAdd">
            <DatabaseViewAddForm
              @submit="onSubmitViewAdd"
              @cancel="isShowViewAdd = false"
            />
          </ModalCard>

          <ModalCard v-if="isShowPropertyCreate">
            <DbPropertyCreateForm
              :cfr-document="selectedCFRDocument"
              @canceled="isShowPropertyCreate = false"
              @created="isShowPropertyCreate = false"
            />
          </ModalCard>

          <ModalCard v-if="isShowPropertyRemove">
            <DbPropertyRemoveForm
              :cfr-document="selectedCFRDocument"
              @canceled="isShowPropertyRemove = false"
              @removed="isShowPropertyRemove = false"
            />
          </ModalCard>

          <ModalCard v-if="isShowItemAdd && databaseProperties">
            <DbItemAdd
              :properties="databaseProperties"
              @submit="onAddItem"
              @cancel="onCancelAddItem"
            >
              <template #property="{ property, propertyId }">
                <StingPropertyField
                  v-if="property.type === PROPERTY_TYPE_STRING"
                  v-model:value="stateNewItem[propertyId]"
                  :label="property.name"
                />

                <NumberPropertyField
                  v-else-if="property.type === PROPERTY_TYPE_NUMBER"
                  v-model:value="stateNewItem[propertyId]"
                  :label="property.name"
                />

                <BooleanPropertyField
                  v-else-if="property.type === PROPERTY_TYPE_BOOLEAN"
                  v-model:value="stateNewItem[propertyId]"
                  :label="property.name"
                />

                <DatePropertyField
                  v-else-if="property.type === PROPERTY_TYPE_DATE"
                  v-model:value="stateNewItem[propertyId]"
                  :label="property.name"
                />
              </template>
            </DbItemAdd>
          </ModalCard>
        </div>

        <div class="menu card is-shadowless is-overflow-x-auto">
          <MenuFolder
            :documents-map="contentFolderMap"
            @click="onClickFolderDocument"
          >
            <template #contextMenu="{ documentId, documentName }">
              <span class="dropdown-item">
                {{ documentName }}
              </span>

              <hr class="dropdown-divider" />

              <button
                type="button"
                class="dropdown-item"
                title="create new directory"
                @click="onClickRemove(documentId)"
              >
                <span class="icon is-small">
                  <i class="fa-solid fa-trash" />
                </span>

                <span class="ml-2">remove</span>
              </button>
            </template>
          </MenuFolder>
        </div>

        <div class="button-grid">
          <UIButton
            v-if="selectedDocumentFolder"
            label="create document"
            @click="onClickCreateDocument"
          >
            <template #icon>
              <i class="fa-solid fa-plus" />
            </template>
          </UIButton>

          <UIButton
            v-if="isSupportLocalDirectory"
            label="select local directory"
            @click="onClickSelectDirectory"
          >
            <template #icon>
              <i class="fa-solid fa-plug" />
            </template>
          </UIButton>

          <UIButton
            label="select google drive directory"
            @click="onClickSelectGDirectory"
          >
            <template #icon>
              <i class="fa-brands fa-google-drive" />
            </template>
          </UIButton>
        </div>
      </div>
    </template>

    <ModalCard v-if="selectedDocumentFolder && isDisplayedDocumentCreationForm">
      <CreateDocumentForm
        :document-folder="selectedDocumentFolder"
        @cancel="onCancelCreateDocument"
        @created="onCreatedDocument"
      />
    </ModalCard>

    <ModalCard v-if="selectedDocumentFolder && documentIdForRemove">
      <DocumentRemoveForm
        :document-folder="selectedDocumentFolder"
        :document-id="documentIdForRemove"
        @cancel="onCancelRemove"
        @removed="onRemoved"
      />
    </ModalCard>

    <ModalCard v-if="openSelectGDirectory">
      <GDriveDirectoryPickerForm
        @submit="onSelectGDirectory"
        @cancel="onCancelSelectGDirectory"
      />
    </ModalCard>
  </ViewWithPanelLayout>
</template>
