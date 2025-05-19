import React, { useEffect, useState } from 'react';
import { useExpense } from '../store/ExpenseContext';
import { ExpensePolicy, ExpenseRule, ExpenseCategory, PolicyCondition, PolicyFrequency, RuleValueType, ComparisonOperator } from '../types/expense';

const PolicyManagement: React.FC = () => {
    const { policies, addPolicy, updatePolicy, expenseTypes, dropdownTypes } = useExpense();
    const [editingPolicy, setEditingPolicy] = useState<ExpensePolicy | null>(null);
    const [newPolicy, setNewPolicy] = useState<Partial<ExpensePolicy>>({
        name: '',
        description: '',
        frequency: 'DAILY',
        rules: [],
        conditions: []
    });
    const [showRuleForm, setShowRuleForm] = useState(false);
    const [selectedPolicy, setSelectedPolicy] = useState<ExpensePolicy | null>(null);
    const [newRule, setNewRule] = useState<Partial<ExpenseRule>>({
        expenseTypeId: '',
        valueType: 'CONSTANT',
        amount: 0,
        userConditions: [],
        conditions: []
    });
    const [selectedDropdownType, setSelectedDropdownType] = useState<string>('');
    const [selectedDropdownOption, setSelectedDropdownOption] = useState<string>('');
    const [conditionAmount, setConditionAmount] = useState<number>(0);
    const [isAddingCondition, setIsAddingCondition] = useState(false);
    const [ruleCreationType, setRuleCreationType] = useState<'type' | 'category'>('type');
    const [selectedCategories, setSelectedCategories] = useState<ExpenseCategory[]>([]);
    const [categoryAmounts, setCategoryAmounts] = useState<Record<string, number>>({});
    const [ruleValueType, setRuleValueType] = useState<RuleValueType>('CONSTANT');
    const [selectedOperator, setSelectedOperator] = useState<ComparisonOperator>('<');
    const [limitAmount, setLimitAmount] = useState<number>(0);

    // State for condition modal
    const [showConditionModal, setShowConditionModal] = useState(false);
    const [newCondition, setNewCondition] = useState<Partial<PolicyCondition>>({
        propertyType: 'ROLE',
        value: ''
    });

    // Add state for rule condition modal
    const [showRuleConditionModal, setShowRuleConditionModal] = useState(false);
    const [newRuleCondition, setNewRuleCondition] = useState<Partial<PolicyCondition>>({
        propertyType: 'ROLE',
        value: ''
    });

    const availableCategories: ExpenseCategory[] = ['FIELDWORK', 'MEALS', 'LODGING', 'OTHER', 'ADMIN'];

    // Available property values
    const propertyValues = {
        ROLE: ['EMPLOYEE', 'MANAGER'],
        GRADE: ['MS1', 'MS2', 'MS3', 'MS4', 'MS5'],
        POSITION: ['FULLTIME', 'PROBATION']
    };

    const frequencyOptions: { value: PolicyFrequency; label: string }[] = [
        { value: 'DAILY', label: 'Daily' },
        { value: 'WEEKLY', label: 'Weekly' },
        { value: 'FORTNIGHTLY', label: 'Fortnightly' },
        { value: 'MONTHLY', label: 'Monthly' },
        { value: 'QUARTERLY', label: 'Quarterly' },
        { value: 'HALF_YEARLY', label: 'Half Yearly' },
        { value: 'ANNUALLY', label: 'Annually' }
    ];

    const operators: { value: ComparisonOperator; label: string }[] = [
        { value: '<', label: '<' },
        { value: '>', label: '>' },
        { value: '<=', label: '<=' },
        { value: '>=', label: '>=' }
    ];

    useEffect(() => {
        console.log(policies);
        
        
    },[policies]);

    const handleAddRule = (policy: ExpensePolicy | null = null) => {
        if (policy) {
            setSelectedPolicy(policy);
        }
        setShowRuleForm(true);
        setNewRule({ expenseTypeId: '', valueType: 'CONSTANT', amount: 0, userConditions: [], conditions: [] });
    };

    const handleAddCondition = () => {
        if (!newCondition.propertyType || !newCondition.value) return;

        const condition: PolicyCondition = {
            propertyType: newCondition.propertyType,
            value: newCondition.value
        };

        if (editingPolicy) {
            setEditingPolicy({
                ...editingPolicy,
                conditions: [...editingPolicy.conditions, condition]
            });
        } else {
            setNewPolicy(prev => ({
                ...prev,
                conditions: [...(prev.conditions || []), condition]
            }));
        }

        setShowConditionModal(false);
        setNewCondition({ propertyType: 'ROLE', value: '' });
    };

    const handleRemoveCondition = (index: number) => {
        if (editingPolicy) {
            const newConditions = [...editingPolicy.conditions];
            newConditions.splice(index, 1);
            setEditingPolicy({
                ...editingPolicy,
                conditions: newConditions
            });
        } else {
            const newConditions = [...(newPolicy.conditions || [])];
            newConditions.splice(index, 1);
            setNewPolicy({
                ...newPolicy,
                conditions: newConditions
            });
        }
    };

    const handleAddRuleCondition = () => {
        if (!newRuleCondition.propertyType || !newRuleCondition.value) return;

        const condition: PolicyCondition = {
            propertyType: newRuleCondition.propertyType,
            value: newRuleCondition.value
        };

        setNewRule(prev => ({
            ...prev,
            userConditions: [...(prev.userConditions || []), condition]
        }));

        setShowRuleConditionModal(false);
        setNewRuleCondition({ propertyType: 'ROLE', value: '' });
    };

    const handleRemoveRuleCondition = (index: number) => {
        setNewRule(prev => {
            const newConditions = [...(prev.userConditions || [])];
            newConditions.splice(index, 1);
            return {
                ...prev,
                userConditions: newConditions
            };
        });
    };

    // Add helper function to group rules
    const groupRulesByType = (rules: ExpenseRule[]) => {
        // First, group by valueType and groupId
        const groups = rules.reduce((acc, rule) => {
            const key = `${rule.valueType}-${rule.groupId || rule.id}`;
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(rule);
            return acc;
        }, {} as Record<string, ExpenseRule[]>);

        // Sort groups by valueType
        return Object.entries(groups).sort((a, b) => {
            const typeA = a[1][0].valueType;
            const typeB = b[1][0].valueType;
            return typeA.localeCompare(typeB);
        });
    };

    const handleSaveRule = () => {
        if (ruleValueType === 'CONSTANT') {
            if (ruleCreationType === 'type') {
                if (!newRule.expenseTypeId || !newRule.amount) return;

                const rule: ExpenseRule = {
                    id: Date.now().toString(),
                    expenseTypeId: newRule.expenseTypeId,
                    valueType: ruleValueType,
                    amount: newRule.amount || 0,
                    userConditions: newRule.userConditions || []
                };

                if (selectedPolicy) {
                    const updatedPolicy = {
                        ...selectedPolicy,
                        rules: [...selectedPolicy.rules, rule]
                    };
                    updatePolicy(updatedPolicy);
                } else {
                    setNewPolicy(prev => ({
                        ...prev,
                        rules: [...(prev.rules || []), rule]
                    }));
                }
            } else {
                // Handle category-based rules
                if (selectedCategories.length === 0) return;

                const groupId = Date.now().toString();
                const categoryExpenseTypes = expenseTypes.filter(type => 
                    selectedCategories.includes(type.category)
                );

                const newRules: ExpenseRule[] = categoryExpenseTypes
                    .filter(type => categoryAmounts[type.id] !== undefined && categoryAmounts[type.id] > 0)
                    .map(type => ({
                        id: Date.now().toString() + '-' + type.id,
                        groupId,
                        expenseTypeId: type.id,
                        valueType: ruleValueType,
                        amount: categoryAmounts[type.id],
                        userConditions: newRule.userConditions || []
                    }));

                if (newRules.length === 0) return;

                if (selectedPolicy) {
                    const updatedPolicy = {
                        ...selectedPolicy,
                        rules: [...selectedPolicy.rules, ...newRules]
                    };
                    updatePolicy(updatedPolicy);
                } else {
                    setNewPolicy(prev => ({
                        ...prev,
                        rules: [...(prev.rules || []), ...newRules]
                    }));
                }
            }
        } else if (ruleValueType === 'ACTUAL') {
            if (!newRule.expenseTypeId) return;

            const rule: ExpenseRule = {
                id: Date.now().toString(),
                expenseTypeId: newRule.expenseTypeId,
                valueType: ruleValueType,
                amount: 0,
                operator: selectedOperator,
                limitAmount: limitAmount,
                userConditions: newRule.userConditions || []
            };

            if (selectedPolicy) {
                const updatedPolicy = {
                    ...selectedPolicy,
                    rules: [...selectedPolicy.rules, rule]
                };
                updatePolicy(updatedPolicy);
            } else {
                setNewPolicy(prev => ({
                    ...prev,
                    rules: [...(prev.rules || []), rule]
                }));
            }
        } else if (ruleValueType === 'CALCULATED') {
            if (!newRule.expenseTypeId) return;

            const rule: ExpenseRule = {
                id: Date.now().toString(),
                expenseTypeId: newRule.expenseTypeId,
                valueType: ruleValueType,
                amount: 0,
                userConditions: newRule.userConditions || []
            };

            if (selectedPolicy) {
                const updatedPolicy = {
                    ...selectedPolicy,
                    rules: [...selectedPolicy.rules, rule]
                };
                updatePolicy(updatedPolicy);
            } else {
                setNewPolicy(prev => ({
                    ...prev,
                    rules: [...(prev.rules || []), rule]
                }));
            }
        }

        // Reset form
        setShowRuleForm(false);
        setNewRule({ expenseTypeId: '', valueType: 'CONSTANT', amount: 0, userConditions: [] });
        setRuleValueType('CONSTANT');
        setSelectedOperator('<');
        setLimitAmount(0);
        setSelectedCategories([]);
        setCategoryAmounts({});
        setRuleCreationType('type');
    };

    const handleSave = () => {
        if (editingPolicy) {
            updatePolicy(editingPolicy);
        } else if (newPolicy.name && newPolicy.description && newPolicy.frequency) {
            addPolicy({
                name: newPolicy.name,
                description: newPolicy.description,
                frequency: newPolicy.frequency,
                conditions: newPolicy.conditions || [],
                rules: newPolicy.rules || []
            });
        }

        setEditingPolicy(null);
        setNewPolicy({
            name: '',
            description: '',
            frequency: 'MONTHLY',
            rules: [],
            conditions: []
        });
    };

    const isFormValid = () => {
        const policy = editingPolicy || newPolicy;
        return (
            policy.name &&
            policy.description &&
            (policy.conditions?.length || 0) > 0
        );
    };

    const getExpenseTypeName = (typeId: string) => {
        return expenseTypes.find(type => type.id === typeId)?.name || 'Unknown';
    };

    const getDropdownTypeName = (typeId: string) => {
        return dropdownTypes.find(type => type.id === typeId)?.name || 'Unknown';
    };

    const getDropdownOptionValue = (typeId: string, optionId: string) => {
        const type = dropdownTypes.find(t => t.id === typeId);
        return type?.options.find(opt => opt.id === optionId)?.value || 'Unknown';
    };

    // Add this helper function for rendering rule conditions
    const renderRuleConditions = (rule: ExpenseRule) => (
        <>
            {rule.userConditions && rule.userConditions.length > 0 && (
                <div className="mt-2 border-t border-gray-200 pt-2">
                    <div className="text-xs font-medium text-gray-700">Who all are applicable for:</div>
                    <div className="mt-1 space-y-1">
                        {rule.userConditions.map((condition, idx) => (
                            <div key={idx} className="text-sm text-gray-600">
                                {condition.propertyType}: {condition.value}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );

    // Update the display section to show grouped rules
    const renderRuleGroup = (rules: ExpenseRule[]) => {
        const firstRule = rules[0];
        return (
            <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                {rules.length > 1 ? (
                    <div className="mb-2">
                        <div className="text-sm font-medium text-gray-900 mb-2">
                            Multiple Expense Types:
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {rules.map(rule => (
                                <div key={rule.id} className="text-sm text-gray-600">
                                    • {getExpenseTypeName(rule.expenseTypeId)}
                                    {rule.valueType === 'CONSTANT' && (
                                        <span className="ml-2">(₹{rule.amount})</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-sm font-medium text-gray-900">
                        {getExpenseTypeName(firstRule.expenseTypeId)}
                    </div>
                )}

                {firstRule.valueType === 'CONSTANT' && rules.length === 1 && (
                    <div className="text-sm text-gray-600 mt-1">
                        Default Amount: ₹{firstRule.amount}
                    </div>
                )}

                {firstRule.valueType === 'ACTUAL' && (
                    <div className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Actual Value</span>
                        {firstRule.operator && firstRule.limitAmount !== undefined && (
                            <span> with limit: {firstRule.operator} ₹{firstRule.limitAmount}</span>
                        )}
                    </div>
                )}

                {firstRule.valueType === 'CALCULATED' && (
                    <div className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Custom Calculation</span>
                    </div>
                )}

                {/* Keep only rule conditions section */}
                {firstRule.userConditions && firstRule.userConditions.length > 0 && (
                    <div className="mt-2 border-t border-gray-200 pt-2">
                        <div className="text-xs font-medium text-gray-700">Who all are applicable for:</div>
                        <div className="mt-1 space-y-1">
                            {firstRule.userConditions.map((condition, idx) => (
                                <div key={idx} className="text-sm text-gray-600">
                                    {condition.propertyType}: {condition.value}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Expense Policies</h2>

            {/* Policy List */}
            <div className="mb-8">
                <h3 className="text-lg font-medium mb-4">Current Policies</h3>
                <div className="space-y-4">
                    {policies.map(policy => (
                        <div
                            key={policy.id}
                            className="border rounded-lg p-4 bg-white shadow-sm"
                        >
                            <div className="flex justify-between items-start">
                                <div className="space-y-4 flex-grow">
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900">{policy.name}</h4>
                                        <p className="text-sm text-gray-600 mt-1">{policy.description}</p>
                                        <p className="text-sm text-gray-600">
                                            Frequency: {frequencyOptions.find(f => f.value === policy.frequency)?.label}
                                        </p>
                                        <div className="mt-2">
                                            <h5 className="text-sm font-medium">Conditions:</h5>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {policy.conditions.map((condition, index) => (
                                                    <span
                                                        key={index}
                                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                                    >
                                                        {condition.propertyType}: {condition.value}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Expense Rules Display */}
                                    {policy.rules.length > 0 && (
                                        <div className="mt-4">
                                            <h5 className="text-sm font-medium text-gray-900 mb-4">Expense Rules:</h5>
                                            
                                            {/* Constant Rules */}
                                            {policy.rules.some(rule => rule.valueType === 'CONSTANT') && (
                                                <div className="mb-4">
                                                    <h6 className="text-xs font-medium text-gray-700 mb-2">Constant Value Rules</h6>
                                                    <div className="space-y-3">
                                                        {groupRulesByType(policy.rules.filter(rule => rule.valueType === 'CONSTANT'))
                                                            .map(([key, rules]) => (
                                                                <div key={key}>
                                                                    {renderRuleGroup(rules)}
                                                                </div>
                                                            ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Actual Rules */}
                                            {policy.rules.some(rule => rule.valueType === 'ACTUAL') && (
                                                <div className="mb-4">
                                                    <h6 className="text-xs font-medium text-gray-700 mb-2">Actual Value Rules</h6>
                                                    <div className="space-y-3">
                                                        {groupRulesByType(policy.rules.filter(rule => rule.valueType === 'ACTUAL'))
                                                            .map(([key, rules]) => (
                                                                <div key={key}>
                                                                    {renderRuleGroup(rules)}
                                                                </div>
                                                            ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Calculated Rules */}
                                            {policy.rules.some(rule => rule.valueType === 'CALCULATED') && (
                                                <div className="mb-4">
                                                    <h6 className="text-xs font-medium text-gray-700 mb-2">Calculated Value Rules</h6>
                                                    <div className="space-y-3">
                                                        {groupRulesByType(policy.rules.filter(rule => rule.valueType === 'CALCULATED'))
                                                            .map(([key, rules]) => (
                                                                <div key={key}>
                                                                    {renderRuleGroup(rules)}
                                                                </div>
                                                            ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                
                                <div className="ml-4 flex space-x-2">
                                    <button
                                        onClick={() => setEditingPolicy(policy)}
                                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleAddRule(policy)}
                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Add Rule
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add Rule Form Modal */}
            {showRuleForm && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center overflow-y-auto">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full my-8 mx-4">
                        <div className="max-h-[80vh] overflow-y-auto">
                            <h3 className="text-lg font-medium mb-4">Add Expense Rule</h3>

                            {/* Value Type Selection */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Value Type
                                </label>
                                <div className="space-y-2">
                                    {(['ACTUAL', 'CONSTANT', 'CALCULATED'] as RuleValueType[]).map((type) => (
                                        <label key={type} className="flex items-center">
                                            <input
                                                type="radio"
                                                value={type}
                                                checked={ruleValueType === type}
                                                onChange={(e) => {
                                                    setRuleValueType(e.target.value as RuleValueType);
                                                    setNewRule({
                                                        ...newRule,
                                                        valueType: e.target.value as RuleValueType
                                                    });
                                                }}
                                                className="form-radio h-4 w-4 text-indigo-600"
                                            />
                                            <span className="ml-2">{type.charAt(0) + type.slice(1).toLowerCase()}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Rule Conditions Section - Moved here */}
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-700">Rule Conditions</label>
                                    <button
                                        type="button"
                                        onClick={() => setShowRuleConditionModal(true)}
                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                                    >
                                        Add Condition
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {newRule.userConditions?.map((condition, index) => (
                                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                            <span className="text-sm">
                                                {condition.propertyType}: {condition.value}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveRuleCondition(index)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Value Type Specific Forms */}
                            {ruleValueType === 'CONSTANT' && (
                                <>
                                    {/* Rule Type Selection */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Rule Creation Type
                                        </label>
                                        <div className="flex space-x-4">
                                            <label className="inline-flex items-center">
                                                <input
                                                    type="radio"
                                                    value="type"
                                                    checked={ruleCreationType === 'type'}
                                                    onChange={() => {
                                                        setRuleCreationType('type');
                                                        setSelectedCategories([]);
                                                        setCategoryAmounts({});
                                                    }}
                                                    className="form-radio h-4 w-4 text-indigo-600"
                                                />
                                                <span className="ml-2">By Expense Type</span>
                                            </label>
                                            <label className="inline-flex items-center">
                                                <input
                                                    type="radio"
                                                    value="category"
                                                    checked={ruleCreationType === 'category'}
                                                    onChange={() => {
                                                        setRuleCreationType('category');
                                                        setNewRule({ expenseTypeId: '', valueType: ruleValueType, amount: 0, userConditions: [], conditions: [] });
                                                        setSelectedDropdownType('');
                                                        setSelectedDropdownOption('');
                                                        setConditionAmount(0);
                                                    }}
                                                    className="form-radio h-4 w-4 text-indigo-600"
                                                />
                                                <span className="ml-2">By Category</span>
                                            </label>
                                        </div>
                                    </div>

                                    {ruleCreationType === 'type' ? (
                                        <>
                                            {/* Basic Rule Fields */}
                                            <div className="space-y-4 mb-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">
                                                        Expense Type
                                                    </label>
                                                    <select
                                                        value={newRule.expenseTypeId}
                                                        onChange={(e) => setNewRule({ ...newRule, expenseTypeId: e.target.value })}
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                    >
                                                        <option value="">Select an expense type</option>
                                                        {expenseTypes.map(type => (
                                                            <option key={type.id} value={type.id}>
                                                                {type.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">
                                                        Default Amount Limit
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={newRule.amount}
                                                        onChange={(e) => setNewRule({ ...newRule, amount: parseFloat(e.target.value) })}
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                    />
                                                </div>
                                            </div>

                                            {/* Conditions Section */}
                                            
                                        </>
                                    ) : (
                                        /* Category Based Rules */
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Select Expense Categories
                                                </label>
                                                <div className="space-y-2 bg-gray-50 p-4 rounded-md">
                                                    {availableCategories.map(category => (
                                                        <label key={category} className="flex items-center space-x-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedCategories.includes(category)}
                                                                onChange={() => {
                                                                    const newCategories = selectedCategories.includes(category)
                                                                        ? selectedCategories.filter(c => c !== category)
                                                                        : [...selectedCategories, category];
                                                                    setSelectedCategories(newCategories);
                                                                    
                                                                    // Clear amounts for unselected categories
                                                                    if (!newCategories.includes(category)) {
                                                                        const newAmounts = { ...categoryAmounts };
                                                                        expenseTypes
                                                                            .filter(type => type.category === category)
                                                                            .forEach(type => {
                                                                                delete newAmounts[type.id];
                                                                            });
                                                                        setCategoryAmounts(newAmounts);
                                                                    }
                                                                }}
                                                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                            />
                                                            <span className="text-sm text-gray-700">{category}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            {selectedCategories.length > 0 && (
                                                <div className="space-y-6">
                                                    {selectedCategories.map(category => (
                                                        <div key={category} className="bg-white border rounded-md p-4">
                                                            <h4 className="font-medium text-gray-900 mb-3">
                                                                {category}
                                                            </h4>
                                                            <div className="space-y-3">
                                                                {expenseTypes
                                                                    .filter(type => type.category === category)
                                                                    .map(type => (
                                                                        <div key={type.id} className="flex items-center space-x-4">
                                                                            <label className="text-sm text-gray-600 flex-grow">
                                                                                {type.name}
                                                                            </label>
                                                                            <input
                                                                                type="number"
                                                                                min="0"
                                                                                step="0.01"
                                                                                value={categoryAmounts[type.id] || ''}
                                                                                onChange={(e) => {
                                                                                    const value = e.target.value ? parseFloat(e.target.value) : 0;
                                                                                    setCategoryAmounts(prev => ({
                                                                                        ...prev,
                                                                                        [type.id]: value
                                                                                    }));
                                                                                }}
                                                                                className="w-32 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                                                placeholder="Enter amount"
                                                                            />
                                                                        </div>
                                                                    ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}

                            {ruleValueType === 'ACTUAL' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Expense Type
                                        </label>
                                        <select
                                            value={newRule.expenseTypeId}
                                            onChange={(e) => setNewRule({ ...newRule, expenseTypeId: e.target.value })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        >
                                            <option value="">Select an expense type</option>
                                            {expenseTypes.map(type => (
                                                <option key={type.id} value={type.id}>
                                                    {type.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {newRule.expenseTypeId && (
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Value Type
                                                </label>
                                                <input
                                                    type="text"
                                                    value="Actual Value"
                                                    disabled
                                                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Operator
                                                </label>
                                                <select
                                                    value={selectedOperator}
                                                    onChange={(e) => setSelectedOperator(e.target.value as ComparisonOperator)}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-center"
                                                >
                                                    {operators.map(op => (
                                                        <option key={op.value} value={op.value}>
                                                            {op.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Limit Amount
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={limitAmount}
                                                    onChange={(e) => setLimitAmount(parseFloat(e.target.value) || 0)}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                    placeholder="Enter limit amount"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {ruleValueType === 'CALCULATED' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Expense Type
                                        </label>
                                        <select
                                            value={newRule.expenseTypeId}
                                            onChange={(e) => setNewRule({ ...newRule, expenseTypeId: e.target.value })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        >
                                            <option value="">Select an expense type</option>
                                            {expenseTypes.map(type => (
                                                <option key={type.id} value={type.id}>
                                                    {type.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {newRule.expenseTypeId && (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Value Type
                                                </label>
                                                <input
                                                    type="text"
                                                    value="Custom"
                                                    disabled
                                                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                />
                                            </div>
                                            {/* <div className="bg-blue-50 border border-blue-200 rounded p-4">
                                                <p className="text-sm text-blue-700">
                                                    This expense type will use a custom calculation method. 
                                                </p>
                                            </div> */}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Modal Footer */}
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    onClick={handleSaveRule}
                                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                    disabled={
                                        ruleValueType === 'CONSTANT' && (
                                            (ruleCreationType === 'type' && (!newRule.expenseTypeId || !newRule.amount)) ||
                                            (ruleCreationType === 'category' && 
                                                (selectedCategories.length === 0 || 
                                                !Object.values(categoryAmounts).some(amount => amount > 0)))
                                        )
                                    }
                                >
                                    Save Rule
                                </button>
                                <button
                                    onClick={() => {
                                        setShowRuleForm(false);
                                        setNewRule({ expenseTypeId: '', valueType: 'CONSTANT', amount: 0, userConditions: [] });
                                        setRuleValueType('CONSTANT');
                                        setSelectedOperator('<');
                                        setLimitAmount(0);
                                        setSelectedCategories([]);
                                        setCategoryAmounts({});
                                        setRuleCreationType('type');
                                    }}
                                    className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit/Create Form */}
            <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">
                    {editingPolicy ? 'Edit Policy' : 'Create New Policy'}
                </h3>
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Policy Name
                        </label>
                        <input
                            type="text"
                            value={editingPolicy?.name || newPolicy.name}
                            onChange={(e) => {
                                if (editingPolicy) {
                                    setEditingPolicy({
                                        ...editingPolicy,
                                        name: e.target.value
                                    });
                                } else {
                                    setNewPolicy({
                                        ...newPolicy,
                                        name: e.target.value
                                    });
                                }
                            }}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            placeholder="Enter policy name"
                            required
                        />
                    </div>
                    
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700">Who all are applicable for</label>
                            <button
                                type="button"
                                onClick={() => setShowConditionModal(true)}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                            >
                                Add Condition
                            </button>
                        </div>
                        <div className="space-y-2">
                            {(editingPolicy?.conditions || newPolicy.conditions || []).map((condition, index) => (
                                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                    <span className="text-sm">
                                        {condition.propertyType}: {condition.value}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveCondition(index)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Description
                        </label>
                        <textarea
                            value={editingPolicy?.description || newPolicy.description}
                            onChange={(e) => {
                                if (editingPolicy) {
                                    setEditingPolicy({
                                        ...editingPolicy,
                                        description: e.target.value
                                    });
                                } else {
                                    setNewPolicy({
                                        ...newPolicy,
                                        description: e.target.value
                                    });
                                }
                            }}
                            rows={3}
                            required
                            placeholder="Enter policy description"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>

                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Frequency
                        </label>
                        <select
                            value={editingPolicy?.frequency || newPolicy.frequency}
                            onChange={(e) => {
                                const value = e.target.value as PolicyFrequency;
                                if (editingPolicy) {
                                    setEditingPolicy({
                                        ...editingPolicy,
                                        frequency: value
                                    });
                                } else {
                                    setNewPolicy({
                                        ...newPolicy,
                                        frequency: value
                                    });
                                }
                            }}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            required
                        >
                            {frequencyOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    

                   
                    

                    {/* Display Rules for New Policy */}
                    {!editingPolicy && newPolicy.rules && newPolicy.rules.length > 0 && (
                        <div className="mt-6 border-t pt-4">
                            <h5 className="text-sm font-medium text-gray-900 mb-2">Expense Rules:</h5>
                            <div className="space-y-3">
                                {newPolicy.rules.map(rule => (
                                    <div key={rule.id} className="bg-gray-50 p-3 rounded-md border border-gray-200">
                                        <div className="text-sm font-medium text-gray-900">
                                            {getExpenseTypeName(rule.expenseTypeId)}
                                        </div>
                                        {rule.valueType === 'CONSTANT' ? (
                                            <div className="text-sm text-gray-600 mt-1">
                                                Default Amount: ₹{rule.amount}
                                            </div>
                                        ) : rule.valueType === 'ACTUAL' ? (
                                            <div className="text-sm text-gray-600 mt-1">
                                                <span className="font-medium">Actual Value</span>
                                                {rule.operator && rule.limitAmount !== undefined && (
                                                    <span> with limit: {rule.operator} ₹{rule.limitAmount}</span>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-sm text-gray-600 mt-1">
                                                <span className="font-medium">Custom Calculation</span>
                                            </div>
                                        )}
                                        {rule.userConditions && rule.userConditions.length > 0 && (
                                            <div className="mt-2 border-t border-gray-200 pt-2">
                                                <div className="text-xs font-medium text-gray-700">Rule Conditions:</div>
                                                <div className="ml-4 mt-1 space-y-1">
                                                    {rule.userConditions.map((condition, idx) => (
                                                        <div key={idx} className="text-sm text-gray-600">
                                                            {condition.propertyType}: {condition.value}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Display Rules for Editing Policy */}
                    {editingPolicy && editingPolicy.rules.length > 0 && (
                        <div className="mt-6 border-t pt-4">
                            <h5 className="text-sm font-medium text-gray-900 mb-2">Expense Rules:</h5>
                            <div className="space-y-3">
                                {editingPolicy.rules.map(rule => (
                                    <div key={rule.id} className="bg-gray-50 p-3 rounded-md border border-gray-200">
                                        <div className="text-sm font-medium text-gray-900">
                                            {getExpenseTypeName(rule.expenseTypeId)}
                                        </div>
                                        {rule.valueType === 'CONSTANT' ? (
                                            <div className="text-sm text-gray-600 mt-1">
                                                Default Amount: ₹{rule.amount}
                                            </div>
                                        ) : rule.valueType === 'ACTUAL' ? (
                                            <div className="text-sm text-gray-600 mt-1">
                                                <span className="font-medium">Actual Value</span>
                                                {rule.operator && rule.limitAmount !== undefined && (
                                                    <span> with limit: {rule.operator} ₹{rule.limitAmount}</span>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-sm text-gray-600 mt-1">
                                                <span className="font-medium">Custom Calculation</span>
                                            </div>
                                        )}
                                        {rule.userConditions && rule.userConditions.length > 0 && (
                                            <div className="mt-2 border-t border-gray-200 pt-2">
                                                <div className="text-xs font-medium text-gray-700">Rule Conditions:</div>
                                                <div className="ml-4 mt-1 space-y-1">
                                                    {rule.userConditions.map((condition, idx) => (
                                                        <div key={idx} className="text-sm text-gray-600">
                                                            {condition.propertyType}: {condition.value}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Add Rule Button */}
                    <div className="mt-4">
                        <button
                            type="button"
                            onClick={() => handleAddRule()}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Add Expense Rule
                        </button>
                    </div>

                    <div className="flex space-x-3 mt-6">
                        <button
                            type="submit"
                            disabled={!isFormValid()}
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {editingPolicy ? 'Save Changes' : 'Create Policy'}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setEditingPolicy(null);
                                setNewPolicy({
                                    name: '',
                                    description: '',
                                    frequency: 'MONTHLY',
                                    rules: [],
                                    conditions: []
                                });
                            }}
                            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>

            {/* Condition Modal */}
            {showConditionModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-medium mb-4">Add Condition</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Property Type</label>
                                <select
                                    value={newCondition.propertyType}
                                    onChange={(e) => setNewCondition({
                                        ...newCondition,
                                        propertyType: e.target.value as 'ROLE' | 'GRADE' | 'POSITION',
                                        value: ''
                                    })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                >
                                    <option value="ROLE">Role</option>
                                    <option value="GRADE">Grade</option>
                                    <option value="POSITION">Position</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Value</label>
                                <select
                                    value={newCondition.value}
                                    onChange={(e) => setNewCondition({
                                        ...newCondition,
                                        value: e.target.value
                                    })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                >
                                    <option value="">Select a value</option>
                                    {newCondition.propertyType && propertyValues[newCondition.propertyType].map(value => (
                                        <option key={value} value={value}>
                                            {value}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowConditionModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleAddCondition}
                                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                                    disabled={!newCondition.propertyType || !newCondition.value}
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Rule Condition Modal */}
            {showRuleConditionModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-medium mb-4">Add Rule Condition</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Property Type</label>
                                <select
                                    value={newRuleCondition.propertyType}
                                    onChange={(e) => setNewRuleCondition({
                                        ...newRuleCondition,
                                        propertyType: e.target.value as 'ROLE' | 'GRADE' | 'POSITION',
                                        value: ''
                                    })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                >
                                    <option value="ROLE">Role</option>
                                    <option value="GRADE">Grade</option>
                                    <option value="POSITION">Position</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Value</label>
                                <select
                                    value={newRuleCondition.value}
                                    onChange={(e) => setNewRuleCondition({
                                        ...newRuleCondition,
                                        value: e.target.value
                                    })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                >
                                    <option value="">Select a value</option>
                                    {newRuleCondition.propertyType && propertyValues[newRuleCondition.propertyType].map(value => (
                                        <option key={value} value={value}>
                                            {value}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowRuleConditionModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleAddRuleCondition}
                                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                                    disabled={!newRuleCondition.propertyType || !newRuleCondition.value}
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PolicyManagement; 