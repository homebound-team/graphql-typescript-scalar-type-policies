import { dateArrayTypePolicy, dateTypePolicy } from "src/dates";

export const scalarTypePolicies = {
  Author: {
    fields: {
      birthday: dateTypePolicy,
      deathday: dateTypePolicy,
      importantDates: dateArrayTypePolicy,
      requiredImportantDates: dateArrayTypePolicy,
    },
  },
  CalendarInterval: { fields: { endDate: dateTypePolicy, startDate: dateTypePolicy } },
};
