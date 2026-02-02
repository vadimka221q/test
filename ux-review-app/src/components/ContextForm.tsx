'use client';

interface ContextData {
  productType: string;
  targetUsers: string;
  primaryGoal: string;
  platform: string;
  constraints: string;
}

interface ContextFormProps {
  context: ContextData;
  onContextChange: (context: ContextData) => void;
  disabled?: boolean;
}

export default function ContextForm({
  context,
  onContextChange,
  disabled = false,
}: ContextFormProps) {
  const handleChange = (field: keyof ContextData, value: string) => {
    onContextChange({ ...context, [field]: value });
  };

  const inputClasses = `
    w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900
    focus:ring-2 focus:ring-gray-900 focus:border-gray-900
    disabled:bg-gray-100 disabled:cursor-not-allowed
    placeholder:text-gray-400
  `;

  const labelClasses = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="productType" className={labelClasses}>
          Product Type <span className="text-gray-400">(required)</span>
        </label>
        <input
          id="productType"
          type="text"
          value={context.productType}
          onChange={(e) => handleChange('productType', e.target.value)}
          placeholder="e.g., SaaS dashboard, E-commerce app, Fintech mobile app"
          className={inputClasses}
          disabled={disabled}
        />
      </div>

      <div>
        <label htmlFor="targetUsers" className={labelClasses}>
          Target Users <span className="text-gray-400">(required)</span>
        </label>
        <input
          id="targetUsers"
          type="text"
          value={context.targetUsers}
          onChange={(e) => handleChange('targetUsers', e.target.value)}
          placeholder="e.g., Small business owners, First-time investors, Design agencies"
          className={inputClasses}
          disabled={disabled}
        />
      </div>

      <div>
        <label htmlFor="primaryGoal" className={labelClasses}>
          Primary Goal of Screen/Flow <span className="text-gray-400">(required)</span>
        </label>
        <input
          id="primaryGoal"
          type="text"
          value={context.primaryGoal}
          onChange={(e) => handleChange('primaryGoal', e.target.value)}
          placeholder="e.g., User signup, Feature discovery, Purchase completion"
          className={inputClasses}
          disabled={disabled}
        />
      </div>

      <div>
        <label htmlFor="platform" className={labelClasses}>
          Platform
        </label>
        <select
          id="platform"
          value={context.platform}
          onChange={(e) => handleChange('platform', e.target.value)}
          className={inputClasses}
          disabled={disabled}
        >
          <option value="">Select platform...</option>
          <option value="Web (Desktop)">Web (Desktop)</option>
          <option value="Web (Mobile)">Web (Mobile)</option>
          <option value="Web (Responsive)">Web (Responsive)</option>
          <option value="iOS">iOS</option>
          <option value="Android">Android</option>
          <option value="iOS & Android">iOS & Android</option>
          <option value="Desktop App">Desktop App</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <label htmlFor="constraints" className={labelClasses}>
          Constraints or Notes <span className="text-gray-400">(optional)</span>
        </label>
        <textarea
          id="constraints"
          value={context.constraints}
          onChange={(e) => handleChange('constraints', e.target.value)}
          placeholder="e.g., Must work offline, Limited dev resources, Brand guidelines restrict colors"
          rows={3}
          className={inputClasses}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

export type { ContextData };
