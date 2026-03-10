export interface BusinessRuleDto {
  id: number;
  name: string;
  description: string;
  priority: number;
  stopProcessing: boolean;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  conditions: BusinessRuleConditionInput[];
  actions: BusinessRuleActionInput[];
}

export type RuleOperator = number;
export type RuleActionType = number;

export interface RuleOptionItem {
  value: number;
  label: string;
}

export interface RuleTextOptionItem {
  value: string;
  label: string;
  description?: string;
}

export const RULE_OPERATOR_OPTIONS: RuleOptionItem[] = [
  { value: 1, label: "GreaterThan (>)" },
  { value: 2, label: "GreaterThanOrEqual (>=)" },
  { value: 3, label: "Equal (=)" },
  { value: 4, label: "Contains (IN)" },
];

export const RULE_ACTION_TYPE_OPTIONS: RuleOptionItem[] = [
  { value: 1, label: "SetShippingFee" },
  { value: 2, label: "DiscountPercentage" },
  { value: 3, label: "DiscountAmount" },
  { value: 4, label: "FreeGift" },
];

export const RULE_CONDITION_KEY_OPTIONS: RuleTextOptionItem[] = [
  { value: "subTotal", label: "Tổng đơn hàng", description: "So sánh theo tổng tiền giỏ hàng" },
  { value: "province", label: "Tỉnh/Thành phố", description: "So sánh theo tỉnh/thành người dùng chọn" },
  { value: "ward", label: "Phường/Xã", description: "So sánh theo phường/xã người dùng chọn" },
];

export interface BusinessRuleConditionInput {
  conditionKey: string;
  operator: RuleOperator;
  conditionValue: string;
}

export interface BusinessRuleActionInput {
  actionType: RuleActionType;
  actionValue: number;
}

export interface PagedList<T> {
  items: T[];
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface BusinessRuleSpecParams {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
}

export interface CreateBusinessRuleCommand {
  name: string;
  description: string;
  priority: number;
  stopProcessing: boolean;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  conditions: BusinessRuleConditionInput[];
  actions: BusinessRuleActionInput[];
}

export interface UpdateBusinessRuleCommand extends CreateBusinessRuleCommand {
  id: number;
}

export interface ToggleBusinessRuleStatusCommand {
  id?: number;
  isActive: boolean;
}
