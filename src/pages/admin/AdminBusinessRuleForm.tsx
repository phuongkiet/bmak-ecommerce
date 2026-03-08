import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import { useStore } from "@/store";
import type {
  BusinessRuleActionInput,
  BusinessRuleConditionInput,
  CreateBusinessRuleCommand,
  UpdateBusinessRuleCommand,
} from "@/models/BusinessRule";

import {
  RULE_ACTION_TYPE_OPTIONS as ruleActionTypeOptions,
  RULE_OPERATOR_OPTIONS as ruleOperatorOptions,
} from "@/models/BusinessRule";

const createEmptyCondition = (): BusinessRuleConditionInput => ({
  conditionKey: "",
  operator: 3,
  conditionValue: "",
});

const createEmptyAction = (): BusinessRuleActionInput => ({
  actionType: 1,
  actionValue: 0,
});

const toLocalDateTimeInputValue = (date?: string) => {
  if (!date) return "";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  const local = new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

const toIsoStringOrThrow = (value: string, fieldName: string): string => {
  if (!value.trim()) {
    throw new Error(`${fieldName} là bắt buộc`);
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`${fieldName} không hợp lệ`);
  }

  return parsed.toISOString();
};

const toIsoStringOrUndefined = (value: string): string | undefined => {
  if (!value.trim()) return undefined;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Ngày kết thúc không hợp lệ");
  }

  return parsed.toISOString();
};

const AdminBusinessRuleForm = observer(() => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { businessRuleStore, commonStore } = useStore();

  const ruleId = Number(id);
  const isEditMode = Number.isFinite(ruleId) && ruleId > 0;

  const [isInitialLoading, setIsInitialLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("0");
  const [stopProcessing, setStopProcessing] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [conditions, setConditions] = useState<BusinessRuleConditionInput[]>([createEmptyCondition()]);
  const [actions, setActions] = useState<BusinessRuleActionInput[]>([createEmptyAction()]);

  useEffect(() => {
    const loadBusinessRule = async () => {
      if (!isEditMode) return;

      setIsInitialLoading(true);
      try {
        await businessRuleStore.fetchBusinessRuleById(ruleId);
        const data = businessRuleStore.selectedBusinessRule;

        if (!data) {
          commonStore.showError("Không tìm thấy business rule");
          navigate("/admin/business-rules");
          return;
        }

        setName(data.name || "");
        setDescription(data.description || "");
        setPriority(String(data.priority ?? 0));
        setStopProcessing(Boolean(data.stopProcessing));
        setStartDate(toLocalDateTimeInputValue(data.startDate));
        setEndDate(toLocalDateTimeInputValue(data.endDate));
        setIsActive(Boolean(data.isActive));

        setConditions(data.conditions?.length ? data.conditions : [createEmptyCondition()]);
        setActions(data.actions?.length ? data.actions : [createEmptyAction()]);
      } finally {
        setIsInitialLoading(false);
      }
    };

    void loadBusinessRule();
  }, [isEditMode, ruleId, businessRuleStore, commonStore, navigate]);

  const payload = useMemo<CreateBusinessRuleCommand>(() => {
    const parsedPriority = Number(priority);

    return {
      name: name.trim(),
      description: description.trim(),
      priority: Number.isFinite(parsedPriority) ? parsedPriority : 0,
      stopProcessing,
      startDate: startDate,
      endDate: endDate || undefined,
      isActive,
      conditions: conditions.map((c) => ({
        conditionKey: c.conditionKey.trim(),
        operator: Number(c.operator),
        conditionValue: c.conditionValue.trim(),
      })),
      actions: actions.map((a) => ({
        actionType: Number(a.actionType),
        actionValue: Number(a.actionValue),
      })),
    };
  }, [name, description, priority, stopProcessing, startDate, endDate, isActive, conditions, actions]);

  const validatePayload = (data: CreateBusinessRuleCommand): void => {
    if (!data.name) {
      throw new Error("Tên rule là bắt buộc");
    }

    if (data.conditions.length === 0) {
      throw new Error("Cần ít nhất 1 điều kiện");
    }

    if (data.actions.length === 0) {
      throw new Error("Cần ít nhất 1 hành động");
    }

    data.conditions.forEach((condition, index) => {
      if (!condition.conditionKey) {
        throw new Error(`Condition #${index + 1}: thiếu ConditionKey`);
      }
      if (!condition.conditionValue) {
        throw new Error(`Condition #${index + 1}: thiếu ConditionValue`);
      }
      if (!Number.isFinite(condition.operator)) {
        throw new Error(`Condition #${index + 1}: Operator không hợp lệ`);
      }
    });

    data.actions.forEach((action, index) => {
      if (!Number.isFinite(action.actionType)) {
        throw new Error(`Action #${index + 1}: ActionType không hợp lệ`);
      }
      if (!Number.isFinite(action.actionValue)) {
        throw new Error(`Action #${index + 1}: ActionValue không hợp lệ`);
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    try {
      const finalPayload: CreateBusinessRuleCommand = {
        ...payload,
        startDate: toIsoStringOrThrow(payload.startDate, "Ngày bắt đầu"),
        endDate: toIsoStringOrUndefined(payload.endDate || ""),
      };

      validatePayload(finalPayload);

      if (isEditMode) {
        const updatePayload: UpdateBusinessRuleCommand = {
          ...finalPayload,
          id: ruleId,
        };

        await businessRuleStore.updateBusinessRule(ruleId, updatePayload);
        commonStore.showSuccess("Cập nhật business rule thành công");
      } else {
        await businessRuleStore.createBusinessRule(finalPayload);
        commonStore.showSuccess("Tạo business rule thành công");
      }

      navigate("/admin/business-rules");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Lưu business rule thất bại";
      commonStore.showError(message || businessRuleStore.error || "Lưu business rule thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditMode) return;

    const confirmed = window.confirm("Bạn có chắc muốn xóa business rule này?");
    if (!confirmed) return;

    setIsSubmitting(true);
    try {
      await businessRuleStore.deleteBusinessRule(ruleId);
      commonStore.showSuccess("Xóa business rule thành công");
      navigate("/admin/business-rules");
    } catch {
      commonStore.showError(businessRuleStore.error || "Xóa business rule thất bại");
      setIsSubmitting(false);
    }
  };

  const updateCondition = (index: number, patch: Partial<BusinessRuleConditionInput>) => {
    setConditions((prev) => prev.map((item, idx) => (idx === index ? { ...item, ...patch } : item)));
  };

  const removeCondition = (index: number) => {
    setConditions((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== index) : prev));
  };

  const updateAction = (index: number, patch: Partial<BusinessRuleActionInput>) => {
    setActions((prev) => prev.map((item, idx) => (idx === index ? { ...item, ...patch } : item)));
  };

  const removeAction = (index: number) => {
    setActions((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== index) : prev));
  };

  if (isInitialLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-600">Đang tải dữ liệu business rule...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/admin/business-rules")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-3xl font-bold">
            {isEditMode ? "Chỉnh sửa business rule" : "Thêm business rule mới"}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {isEditMode && (
            <button
              type="button"
              onClick={() => void handleDelete()}
              disabled={isSubmitting}
              className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Trash2 size={18} />
              Xóa
            </button>
          )}
          <button
            type="submit"
            form="business-rule-form"
            disabled={isSubmitting}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save size={18} />
            {isSubmitting ? "Đang lưu..." : "Lưu rule"}
          </button>
        </div>
      </div>

      <form id="business-rule-form" onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Thông tin cơ bản</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên rule <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Rule giảm giá theo giỏ hàng"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ưu tiên</label>
              <input
                type="number"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày bắt đầu <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc</label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="md:col-span-2 flex flex-wrap items-center gap-6 mt-1">
              <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={stopProcessing}
                  onChange={(e) => setStopProcessing(e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                Stop processing khi rule match
              </label>

              <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                Kích hoạt rule
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Điều kiện</h2>
            <button
              type="button"
              onClick={() => setConditions((prev) => [...prev, createEmptyCondition()])}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              Thêm điều kiện
            </button>
          </div>

          <div className="space-y-3">
            {conditions.map((condition, index) => (
              <div key={`condition-${index}`} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end border border-gray-200 rounded-lg p-3">
                <div className="md:col-span-4">
                  <label className="block text-xs font-medium text-gray-600 mb-1">ConditionKey</label>
                  <input
                    type="text"
                    value={condition.conditionKey}
                    onChange={(e) => updateCondition(index, { conditionKey: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Operator (enum number)</label>
                  <select
                    value={condition.operator}
                    onChange={(e) => updateCondition(index, { operator: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {ruleOperatorOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.value} - {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-4">
                  <label className="block text-xs font-medium text-gray-600 mb-1">ConditionValue</label>
                  <input
                    type="text"
                    value={condition.conditionValue}
                    onChange={(e) => updateCondition(index, { conditionValue: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="md:col-span-1">
                  <button
                    type="button"
                    onClick={() => removeCondition(index)}
                    className="w-full px-2 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    title="Xóa điều kiện"
                  >
                    <Trash2 size={16} className="mx-auto" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Hành động</h2>
            <button
              type="button"
              onClick={() => setActions((prev) => [...prev, createEmptyAction()])}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              Thêm hành động
            </button>
          </div>

          <div className="space-y-3">
            {actions.map((action, index) => (
              <div key={`action-${index}`} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end border border-gray-200 rounded-lg p-3">
                <div className="md:col-span-5">
                  <label className="block text-xs font-medium text-gray-600 mb-1">ActionType (enum number)</label>
                  <select
                    value={action.actionType}
                    onChange={(e) => updateAction(index, { actionType: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {ruleActionTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.value} - {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-6">
                  <label className="block text-xs font-medium text-gray-600 mb-1">ActionValue</label>
                  <input
                    type="number"
                    step="0.01"
                    value={action.actionValue}
                    onChange={(e) => updateAction(index, { actionValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="md:col-span-1">
                  <button
                    type="button"
                    onClick={() => removeAction(index)}
                    className="w-full px-2 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    title="Xóa hành động"
                  >
                    <Trash2 size={16} className="mx-auto" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
});

export default AdminBusinessRuleForm;
