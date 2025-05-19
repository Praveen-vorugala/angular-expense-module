import React, { useState, useEffect, useMemo } from 'react';
import { useExpense } from '../store/ExpenseContext';
import { ExpensePolicy, User, PolicyCondition, ExpenseRule } from '../types/expense';

interface ReportExpense {
    expenseTypeId: string;
    amount: number;
    description: string;
    receiptUrl: string;
    date: string;
    travelDetails?: {
        fromCity: string;
        toCity: string;
        kilometers: number;
        tripType: 'ONE_WAY' | 'TWO_WAY';
        calculatedFare: number;
    };
}

// Mock city data - replace with actual data from your backend
const CITIES = [
    { id: 'BLR', name: 'Bangalore' },
    { id: 'MUM', name: 'Mumbai' },
    { id: 'DEL', name: 'Delhi' },
    { id: 'CHN', name: 'Chennai' },
    { id: 'HYD', name: 'Hyderabad' }
];

// Mock distance data - replace with actual calculations or API
const CITY_DISTANCES: { [key: string]: { [key: string]: number } } = {
    'BLR': { 'MUM': 980, 'DEL': 2150, 'CHN': 350, 'HYD': 570 },
    'MUM': { 'BLR': 980, 'DEL': 1400, 'CHN': 1200, 'HYD': 700 },
    'DEL': { 'BLR': 2150, 'MUM': 1400, 'CHN': 2200, 'HYD': 1500 },
    'CHN': { 'BLR': 350, 'MUM': 1200, 'DEL': 2200, 'HYD': 630 },
    'HYD': { 'BLR': 570, 'MUM': 700, 'DEL': 1500, 'CHN': 630 }
};

const FARE_PER_KM = 2.8;

const ReportForm: React.FC = () => {
    const { currentUser, policies, expenseTypes, addExpense } = useExpense();
    const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
    const [expenses, setExpenses] = useState<ReportExpense[]>([]);
    const [currentExpense, setCurrentExpense] = useState<ReportExpense>({
        expenseTypeId: '',
        amount: 0,
        description: '',
        receiptUrl: '',
        date: new Date().toISOString().split('T')[0]
    });
    const [travelDetails, setTravelDetails] = useState({
        fromCity: '',
        toCity: '',
        kilometers: 0,
        tripType: 'ONE_WAY' as 'ONE_WAY' | 'TWO_WAY',
        calculatedFare: 0
    });

    // Find the "New Policy for ms 1" policy
    const selectedPolicy = policies.find(policy => policy.name === "New Policy for ms 1");
    console.log(selectedPolicy);
    
    const policyRules = selectedPolicy?.rules || [];

    // Filter out already used expense types
    const availableRules = policyRules.filter(rule => 
        !expenses.some(expense => expense.expenseTypeId === rule.expenseTypeId)
    );

    const calculateFare = (fromCity: string, toCity: string, tripType: 'ONE_WAY' | 'TWO_WAY') => {
        if (!fromCity || !toCity) return 0;
        const distance = CITY_DISTANCES[fromCity]?.[toCity] || 0;
        const multiplier = tripType === 'TWO_WAY' ? 2 : 1;
        return Math.round(distance * FARE_PER_KM * multiplier * 100) / 100;
    };

    const handleTravelDetailsChange = (field: string, value: string) => {
        const newDetails = { ...travelDetails, [field]: value };
        
        if (field === 'fromCity' || field === 'toCity' || field === 'tripType') {
            const fare = calculateFare(
                field === 'fromCity' ? value : travelDetails.fromCity,
                field === 'toCity' ? value : travelDetails.toCity,
                field === 'tripType' ? value as 'ONE_WAY' | 'TWO_WAY' : travelDetails.tripType
            );
            newDetails.calculatedFare = fare;
            newDetails.kilometers = CITY_DISTANCES[newDetails.fromCity]?.[newDetails.toCity] || 0;
            
            setCurrentExpense({
                ...currentExpense,
                amount: fare
            });
        }
        
        setTravelDetails(newDetails);
    };

    const isCalculatedExpenseType = (expenseTypeId: string) => {
        const rule = policyRules.find(r => r.expenseTypeId === expenseTypeId);
        return rule?.valueType === 'CALCULATED';
    };

    const handleAddExpense = () => {
        if (!currentExpense.expenseTypeId || !currentExpense.amount) return;

        setExpenses([...expenses, currentExpense]);
        setCurrentExpense({
            expenseTypeId: '',
            amount: 0,
            description: '',
            receiptUrl: '',
            date: new Date().toISOString().split('T')[0]
        });
    };

    const handleRemoveExpense = (index: number) => {
        setExpenses(expenses.filter((_, i) => i !== index));
    };

    const getExpenseTypeName = (typeId: string) => {
        return expenseTypes.find(type => type.id === typeId)?.name || 'Unknown';
    };

    const handleExpenseTypeChange = (expenseTypeId: string) => {
        const rule = policyRules.find(r => r.expenseTypeId === expenseTypeId);
        let amount = 0;
        
        if (rule?.valueType === 'CONSTANT') {
            amount = rule.amount;
        }

        setCurrentExpense({
            ...currentExpense,
            expenseTypeId,
            amount
        });
    };

    const handleAmountChange = (value: string) => {
        const amount = parseFloat(value) || 0;
        const rule = policyRules.find(r => r.expenseTypeId === currentExpense.expenseTypeId);
        
        if (rule?.valueType === 'ACTUAL' && rule.limitAmount) {
            if (amount > rule.limitAmount) {
                return; // Don't update if exceeds limit
            }
        }
        
        setCurrentExpense({
            ...currentExpense,
            amount
        });
    };

    const isAmountValid = () => {
        const rule = policyRules.find(r => r.expenseTypeId === currentExpense.expenseTypeId);
        if (!rule) return true;

        if (rule.valueType === 'ACTUAL' && rule.limitAmount) {
            return currentExpense.amount <= rule.limitAmount;
        }
        return true;
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Here you would typically upload the file to your server
            // For now, we'll just create a local URL
            const url = URL.createObjectURL(file);
            setCurrentExpense({
                ...currentExpense,
                receiptUrl: url
            });
        }
    };

    const handleSubmitReport = () => {
        if (!selectedPolicy || expenses.length === 0) return;
        
        addExpense(reportDate, selectedPolicy.id, expenses);
        
        // Reset form
        setExpenses([]);
        setCurrentExpense({
            expenseTypeId: '',
            amount: 0,
            description: '',
            receiptUrl: '',
            date: new Date().toISOString().split('T')[0]
        });
        setTravelDetails({
            fromCity: '',
            toCity: '',
            kilometers: 0,
            tripType: 'ONE_WAY',
            calculatedFare: 0
        });
    };

    // Calculate total amount of all expenses
    const totalAmount = useMemo(() => {
        return expenses.reduce((sum, expense) => sum + expense.amount, 0);
    }, [expenses]);

    if (!selectedPolicy) {
        return <div>Policy "New Policy for ms 1" not found.</div>;
    }

    const isActualExpenseType = policyRules.find(
        r => r.expenseTypeId === currentExpense.expenseTypeId
    )?.valueType === 'ACTUAL';

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-2xl font-bold">Create New Report (Daily)</h2>
                </div>
                <div className="w-48">
                    <label className="block text-sm font-medium text-gray-700">
                        Report Date
                    </label>
                    <input
                        type="date"
                        value={reportDate}
                        onChange={(e) => setReportDate(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
            </div>

            <div className="space-y-6">
                <div className="border-t pt-4">
                    <h3 className="text-lg font-medium mb-4">Add Expense</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Expense Type
                            </label>
                            <select
                                value={currentExpense.expenseTypeId}
                                onChange={(e) => {
                                    handleExpenseTypeChange(e.target.value);
                                    if (!isCalculatedExpenseType(e.target.value)) {
                                        setTravelDetails({
                                            fromCity: '',
                                            toCity: '',
                                            kilometers: 0,
                                            tripType: 'ONE_WAY',
                                            calculatedFare: 0
                                        });
                                    }
                                }}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                disabled={availableRules.length === 0}
                            >
                                <option value="">
                                    {availableRules.length === 0 
                                        ? "All expense types added" 
                                        : "Select expense type"
                                    }
                                </option>
                                {availableRules.map(rule => (
                                    <option key={rule.id} value={rule.expenseTypeId}>
                                        {getExpenseTypeName(rule.expenseTypeId)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Travel Details for Calculated Expense Types */}
                        {currentExpense.expenseTypeId && isCalculatedExpenseType(currentExpense.expenseTypeId) && (
                            <div className="space-y-4 border rounded-md p-4 bg-gray-50">
                                <h4 className="font-medium text-gray-900">Travel Details</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">From</label>
                                        <select
                                            value={travelDetails.fromCity}
                                            onChange={(e) => handleTravelDetailsChange('fromCity', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        >
                                            <option value="">Select city</option>
                                            {CITIES.map(city => (
                                                <option key={city.id} value={city.id}>
                                                    {city.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">To</label>
                                        <select
                                            value={travelDetails.toCity}
                                            onChange={(e) => handleTravelDetailsChange('toCity', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        >
                                            <option value="">Select city</option>
                                            {CITIES.map(city => (
                                                <option 
                                                    key={city.id} 
                                                    value={city.id}
                                                    disabled={city.id === travelDetails.fromCity}
                                                >
                                                    {city.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Trip Type</label>
                                        <select
                                            value={travelDetails.tripType}
                                            onChange={(e) => handleTravelDetailsChange('tripType', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        >
                                            <option value="ONE_WAY">One Way</option>
                                            <option value="TWO_WAY">Two Way</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Distance (km)</label>
                                        <input
                                            type="text"
                                            value={travelDetails.kilometers}
                                            readOnly
                                            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Calculated Fare</label>
                                    <input
                                        type="text"
                                        value={`₹${travelDetails.calculatedFare}`}
                                        readOnly
                                        className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Amount field - only show for non-calculated types */}
                        {currentExpense.expenseTypeId && !isCalculatedExpenseType(currentExpense.expenseTypeId) && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Amount
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={currentExpense.amount || ''}
                                    onChange={(e) => handleAmountChange(e.target.value)}
                                    disabled={policyRules.find(r => r.expenseTypeId === currentExpense.expenseTypeId)?.valueType === 'CONSTANT'}
                                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                                        !isAmountValid() ? 'border-red-500' : ''
                                    } ${
                                        policyRules.find(r => r.expenseTypeId === currentExpense.expenseTypeId)?.valueType === 'CONSTANT' 
                                        ? 'bg-gray-100' 
                                        : ''
                                    }`}
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Description (Optional)
                            </label>
                            <textarea
                                value={currentExpense.description}
                                onChange={(e) => setCurrentExpense({
                                    ...currentExpense,
                                    description: e.target.value
                                })}
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>

                        {isActualExpenseType && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Upload Receipt
                                </label>
                                <div className="mt-1 flex items-center">
                                    <input
                                        type="file"
                                        accept="image/*,.pdf"
                                        onChange={handleFileUpload}
                                        className="block w-full text-sm text-gray-500
                                            file:mr-4 file:py-2 file:px-4
                                            file:rounded-md file:border-0
                                            file:text-sm file:font-semibold
                                            file:bg-indigo-50 file:text-indigo-700
                                            hover:file:bg-indigo-100"
                                    />
                                </div>
                                {currentExpense.receiptUrl && (
                                    <div className="mt-2 text-sm text-gray-500">
                                        Receipt uploaded successfully
                                    </div>
                                )}
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={() => {
                                const expenseToAdd = {
                                    ...currentExpense,
                                    travelDetails: isCalculatedExpenseType(currentExpense.expenseTypeId) ? travelDetails : undefined
                                };
                                setExpenses([...expenses, expenseToAdd]);
                                setCurrentExpense({
                                    expenseTypeId: '',
                                    amount: 0,
                                    description: '',
                                    receiptUrl: '',
                                    date: new Date().toISOString().split('T')[0]
                                });
                                setTravelDetails({
                                    fromCity: '',
                                    toCity: '',
                                    kilometers: 0,
                                    tripType: 'ONE_WAY',
                                    calculatedFare: 0
                                });
                            }}
                            disabled={
                                !currentExpense.expenseTypeId || 
                                !currentExpense.amount || 
                                !isAmountValid() || 
                                (isActualExpenseType && !currentExpense.receiptUrl) ||
                                (isCalculatedExpenseType(currentExpense.expenseTypeId) && (!travelDetails.fromCity || !travelDetails.toCity))
                            }
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            Add Expense to Report
                        </button>
                    </div>
                </div>

                {/* Display Added Expenses */}
                {expenses.length > 0 && (
                    <div className="border-t pt-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium">Added Expenses</h3>
                            <div className="text-lg font-semibold text-gray-900">
                                Total: ₹{totalAmount.toFixed(2)}
                            </div>
                        </div>
                        <div className="space-y-3">
                            {expenses.map((expense, index) => (
                                <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                    <div>
                                        <div className="font-medium">{getExpenseTypeName(expense.expenseTypeId)}</div>
                                        <div className="text-sm text-gray-500">
                                            Amount: ₹{expense.amount}
                                        </div>
                                        {expense.description && (
                                            <div className="text-sm text-gray-500">{expense.description}</div>
                                        )}
                                        {expense.travelDetails && (
                                            <div className="text-sm text-gray-500">
                                                {CITIES.find(c => c.id === expense.travelDetails?.fromCity)?.name} to {CITIES.find(c => c.id === expense.travelDetails?.toCity)?.name} ({expense.travelDetails.tripType === 'TWO_WAY' ? 'Round Trip' : 'One Way'})
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="text-sm font-medium text-gray-900">
                                            ₹{expense.amount.toFixed(2)}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveExpense(index)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-medium text-gray-700">Report Total</span>
                                <span className="text-xl font-bold text-gray-900">₹{totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Submit Report Button */}
                {expenses.length > 0 && (
                    <div className="border-t pt-4">
                        <button
                            type="button"
                            onClick={handleSubmitReport}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            Submit Report (Total: ₹{totalAmount.toFixed(2)})
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportForm; 