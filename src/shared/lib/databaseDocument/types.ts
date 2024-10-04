import type { PartialDeep } from 'type-fest';
import type { AnyProperty, PropertyId } from './property';
import { zodItemId, type ItemId } from './item';
import type { TypeOf } from 'zod';
import { intersection, literal, object, record, unknown } from 'zod';
import { zodPropertiesMap } from './property/property';
import { zodPropertyId } from './property/general';
import { zodDocumentContent } from '../cfrDocument';

const zodValue = unknown();

const zodItem = record(zodPropertyId, zodValue);

export type Item = TypeOf<typeof zodItem>;

const zodDatabaseData = record(zodItemId, zodItem);

export type DatabaseData = TypeOf<typeof zodDatabaseData>;

const zodDatabaseStateV1 = object({
  version: literal(1),
  data: zodDatabaseData,
  properties: zodPropertiesMap,
});

export type DataBaseStateV1 = TypeOf<typeof zodDatabaseStateV1>;

export const zodDataBaseStateLatest = zodDatabaseStateV1;

export type DataBaseStateLatest = TypeOf<typeof zodDataBaseStateLatest>;

export const DATABASE_DOCUMENT_TYPE = 'database';

export const zodDatabaseType = object({
  type: literal(DATABASE_DOCUMENT_TYPE),
});

export const zodDatabaseExtentionBodyDocument = object({
  body: zodDataBaseStateLatest,
});

export const zodDatabaseTypeDocument = intersection(
  zodDocumentContent,
  zodDatabaseType,
);

export type DatabaseTypeDocument = TypeOf<typeof zodDatabaseTypeDocument>;

export const zodDatabaseDocumentContent = intersection(
  zodDatabaseTypeDocument,
  zodDatabaseExtentionBodyDocument,
);

export type DatabaseDocumentContent = TypeOf<typeof zodDatabaseDocumentContent>;

export interface DatabaseDocument {
  addProperty: (property: AnyProperty) => PropertyId;
  removeProperty: (propertyId: PropertyId) => void;
  updateProperty: (
    propertyId: PropertyId,
    partialProperty: PartialDeep<AnyProperty>,
  ) => void;

  addItem: (item: Item) => ItemId;
  removeItem: (itemId: ItemId) => void;
  updateItem: (itemId: ItemId, partialItem: PartialDeep<Item>) => void;

  read: () => Promise<DatabaseDocumentContent>;

  onChange: (fn: (doc: DatabaseDocumentContent) => unknown) => () => void;

  // addView(): void;
  // removeView(): void;
  // updateView(): void;
}
