import { literal, object, record, type TypeOf } from 'zod';
import { zodUnknownPropertiesMap } from './property';
import { zodViewId, zodView } from './view';
import { zodDatabaseData } from './item';

const zodDatabaseStateV1 = object({
  version: literal(1),
  data: zodDatabaseData,
  properties: zodUnknownPropertiesMap,
});

export type DataBaseStateV1 = TypeOf<typeof zodDatabaseStateV1>;

export const initialDatabaseStateV1 = (): DataBaseStateV1 => ({
  version: 1,
  properties: {},
  data: {},
});

const zodDatabaseStateV2 = zodDatabaseStateV1.extend({
  version: literal(2),
  views: record(zodViewId, zodView).optional(),
});

export type DataBaseStateV2 = TypeOf<typeof zodDatabaseStateV2>;

export const initialDatabaseStateV2 = (): DataBaseStateV2 => ({
  version: 2,
  properties: {},
  data: {},
});

export const initialDatabaseStateLatest = initialDatabaseStateV2;

export const zodDataBaseStateLatest = zodDatabaseStateV2;
