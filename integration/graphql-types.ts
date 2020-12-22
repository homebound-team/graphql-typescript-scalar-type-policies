import { dateTypePolicy } from "src/dates";

export const scalarTypePolicies = {
  Author: { fields: { date: dateTypePolicy } },
};
