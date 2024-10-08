<script setup lang="ts">
import { computed, ref, shallowRef, watch } from 'vue';
import { useDocumentFolder } from '../../entities/folder/useDocumentFolder';
import { MenuFolder } from '../../entities/folder';
import type { CFRDocument, DocumentFolder } from '../../shared/lib/cfrDocument';
import { CreateDocumentForm } from '../../features/documentCreat';
import { ModalCard } from '../../shared/ui/ModalCard';
import type { DocumentId } from '@automerge/automerge-repo';
import { DocumentRemoveForm } from '../../features/documentRemove';
import { WorkspaceFrame } from '../WorkspaceFrame';
import { SlidingPanel } from '../../shared/ui/SlidingPanel';
import { DocumentPanel } from '../DocumentPanel';
import { createDatabaseDocument } from '../../shared/lib/databaseDocument/createDatabaseDocument';
import { createLogger } from '../../shared/lib/logger';
import DirectoryPickForm from '../../features/directoryPick/DirectoryPickForm.vue';

const { debug } = createLogger('MainView');

const selectedDocumentFolder = ref<DocumentFolder>();

const openSelectDirectory = ref(false);

const onClickSelectDirectory = () => {
  openSelectDirectory.value = true;
};

const { content: contentFolderMap } = useDocumentFolder(selectedDocumentFolder);

const contentFolderSize = computed(() => contentFolderMap.value.size);

watch(contentFolderSize, (contentFolderSize) => {
  setTimeout(() => {
    isOpenPanel.value = !!contentFolderSize;
  }, 0);
});

const isDisplayedDocumentCreationForm = ref(false);

const onClickCreateDocument = () => {
  isDisplayedDocumentCreationForm.value = true;
};

const onCancelCreateDocument = () => {
  isDisplayedDocumentCreationForm.value = false;
  isOpenPanel.value = true;
};

const onCreatedDocument = onCancelCreateDocument;

const documentIdForRemove = ref<DocumentId>();

const onClickRemove = (documentId: DocumentId) => {
  documentIdForRemove.value = documentId;
};

const onCancelRemove = () => {
  documentIdForRemove.value = undefined;
};

const onRemoved = onCancelRemove;

const selectedCFRDocument = shallowRef<CFRDocument>();

const onClickFolder = (_documentId: DocumentId, cfrDocument: CFRDocument) => {
  const databaseDocument = createDatabaseDocument(cfrDocument);
  debug('onClickFolder', databaseDocument);
  selectedCFRDocument.value = cfrDocument;
  openBottomMenu.value = false;
  isOpenPanel.value = false;
};

const openBottomMenu = ref(true);

const isOpenPanel = ref(true);

const onSubmitDirectoryPick = (documentFolder: DocumentFolder) => {
  selectedDocumentFolder.value = documentFolder;
  openSelectDirectory.value = false;
};

const onCancelDirectoryPick = () => {
  openSelectDirectory.value = false;
};
</script>

<template>
  <div
    class="is-flex is-flex-direction-column is-flex-grow-1 is-justify-content-flex-end is-overflow-auto"
  >
    <WorkspaceFrame
      v-if="selectedCFRDocument"
      :cfr-document="selectedCFRDocument"
      class="is-flex-grow-1 is-flex-shrink-1"
    />

    <SlidingPanel v-model:open="isOpenPanel" class="bottom-panel">
      <div class="card">
        <button
          type="button"
          class="button is-transparent is-small is-fullwidth is-ghost"
          @click="isOpenPanel = !isOpenPanel"
        >
          <span class="icon">
            <i
              class="fa-solid fa-chevron-up"
              :class="{
                'fa-flip-vertical': isOpenPanel,
              }"
            />
          </span>
        </button>

        <DocumentPanel
          v-if="selectedCFRDocument"
          :cfr-document="selectedCFRDocument"
        />

        <div class="menu">
          <MenuFolder :documents-map="contentFolderMap" @click="onClickFolder">
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

          <ul class="menu-list">
            <li v-if="selectedDocumentFolder">
              <button
                type="button"
                class="button is-link"
                @click="onClickCreateDocument"
              >
                <span class="icon">
                  <i class="fa-solid fa-plus" />
                </span>

                <span> create document </span>
              </button>
            </li>

            <li>
              <button
                type="button"
                class="button is-link"
                @click="onClickSelectDirectory"
              >
                <span class="icon">
                  <i class="fa-solid fa-plug" />
                </span>

                <span> directory selection </span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </SlidingPanel>

    <ModalCard v-if="openSelectDirectory">
      <DirectoryPickForm
        @submit="onSubmitDirectoryPick"
        @cancel="onCancelDirectoryPick"
      />
    </ModalCard>

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
  </div>
</template>

<style lang="scss" scoped>
.bottom-panel {
  --sliding-panel-min-height: 71px;
}
</style>
