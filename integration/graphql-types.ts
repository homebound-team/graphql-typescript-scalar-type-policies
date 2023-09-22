import { dateTypePolicy } from "src/dates";

export const scalarTypePolicies = {
  Author: { fields: { birthday: dateTypePolicy, deathday: dateTypePolicy } },
  CalendarInterval: { fields: { endDate: dateTypePolicy, startDate: dateTypePolicy } },
};
