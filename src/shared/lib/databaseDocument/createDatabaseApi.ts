import type { PartialDeep } from 'type-fest';
import { putObject } from '../changeObject';
import type { DocumentApi, CRDocument } from '../documentApi';
import { parseSelf } from '../validateZodScheme';
import { generateItemId, type ItemId } from './item';
import {
  type AnyProperty,
  type PropertyId,
  generatePropertyId,
} from './property';
import {
  type DatabaseApi,
  type Item,
  type DatabaseDocument,
  zodDatabaseDocument,
  zodDatabaseExtentionDocument,
} from './types';
import { migrationsMap } from './migrations';
import { createLogModule } from '../logger';
import { cloneDeep, isNumber, isObject, keys, toInteger } from 'lodash-es';

const { debug } = createLogModule('createDatabaseApi');

const documentUpdate = (doc: CRDocument): DatabaseDocument => {
  debug('documentUpdate', cloneDeep(doc));
  const dbDocument = parseSelf(doc, zodDatabaseExtentionDocument);

  const currentVersion: number =
    'body' in dbDocument
      ? isObject(dbDocument.body)
        ? 'version' in dbDocument.body
          ? isNumber(dbDocument.body.version)
            ? dbDocument.body.version
            : 0
          : 0
        : 0
      : 0;

  if (currentVersion in migrationsMap) {
    migrationsMap[currentVersion](doc);
    return documentUpdate(doc);
  }
  return parseSelf(doc, zodDatabaseDocument);
};

export const createDatabaseApi = (documentApi: DocumentApi): DatabaseApi => {
  const migrate = async <D>(doc: D): Promise<DatabaseDocument> => {
    debug('migrate', doc);
    const dbDocument = parseSelf(doc, zodDatabaseExtentionDocument);

    const currentVersion: number =
      'body' in dbDocument
        ? isObject(dbDocument.body)
          ? 'version' in dbDocument.body
            ? isNumber(dbDocument.body.version)
              ? dbDocument.body.version
              : 0
            : 0
          : 0
        : 0;

    const latestVersion = Math.max(...keys(migrationsMap).map(toInteger));

    debug('migrate', currentVersion, latestVersion);

    if (latestVersion >= currentVersion) {
      documentApi.change((doc) => {
        documentUpdate(doc);
      });
      return parseSelf(await documentApi.doc(), zodDatabaseDocument);
    }
    return parseSelf(doc, zodDatabaseDocument);
  };

  const addProperty = (column: AnyProperty): PropertyId => {
    const columnId = generatePropertyId();

    documentApi.change((doc) => {
      const { body } = documentUpdate(doc);

      body.properties[columnId] = column;
    });

    return columnId;
  };

  const updateProperty = (
    columnId: PropertyId,
    column: PartialDeep<AnyProperty>,
  ) => {
    documentApi.change((doc) => {
      const { body } = documentUpdate(doc);

      putObject(body.properties, { [columnId]: column });
    });
  };

  const removeProperty = (propertyId: PropertyId) => {
    documentApi.change((doc) => {
      const { body } = documentUpdate(doc);
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- delete any property
      delete body.properties[propertyId];

      // todo: добавить параметр очистки data от значений
    });
  };

  const addItem = (item: Item) => {
    const itemId = generateItemId();

    documentApi.change((doc) => {
      const { body } = documentUpdate(doc);

      putObject(body.data, { [itemId]: item });
    });

    return itemId;
  };

  const updateItem = (itemId: ItemId, partialItem: PartialDeep<Item>) => {
    documentApi.change((doc) => {
      const { body } = documentUpdate(doc);

      putObject(body.data, { [itemId]: partialItem });
    });
  };

  const removeItem = (itemId: ItemId) => {
    documentApi.change((doc) => {
      const { body } = documentUpdate(doc);

      putObject(body.data, { [itemId]: undefined });
    });
  };

  const read = async (): Promise<DatabaseDocument> => {
    debug('read');
    const doc = await documentApi.doc();

    debug('read', doc);
    return await migrate(doc);
  };

  const onChange = (fn: (doc: DatabaseDocument) => unknown) => {
    const insideFn = ({ doc }: { doc: CRDocument }) =>
      fn(parseSelf(doc, zodDatabaseDocument));

    documentApi.on('change', insideFn);

    const off = () => {
      documentApi.off('change', insideFn);
    };

    return off;
  };

  const api: DatabaseApi = {
    addProperty,
    updateProperty,
    removeProperty,

    addItem,
    updateItem,
    removeItem,

    read,
    onChange,
  };

  return api;
};
