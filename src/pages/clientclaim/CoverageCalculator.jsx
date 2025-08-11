import React, { useState } from 'react';
import { Calculator, TrendingUp, BarChart3, PieChart, DollarSign, AlertCircle, Check, Plus, Shield, Info } from 'lucide-react';

const CoverageCalculator = ({ 
    insuranceConfig = {
        motor: {
            name: 'Motor Insurance',
            categories: {
                silver: { 
                    name: 'Silver Plan', 
                    coverage_percentage: 50,
                    description: 'Basic motor coverage - 50% damage coverage'
                },
                bronze: { 
                    name: 'Bronze Plan', 
                    coverage_percentage: 70,
                    description: 'Enhanced motor coverage - 70% damage coverage'
                },
                gold: { 
                    name: 'Gold Plan', 
                    coverage_percentage: 100,
                    description: 'Premium motor coverage - 100% damage coverage'
                }
            }
        },
        property: {
            name: 'Property Insurance',
            categories: {
                basic: { 
                    name: 'Basic Property', 
                    coverage_percentage: 60,
                    description: 'Basic property coverage - 60% damage coverage'
                },
                comprehensive: { 
                    name: 'Comprehensive', 
                    coverage_percentage: 85,
                    description: 'Comprehensive property coverage - 85% damage coverage'
                },
                premium: { 
                    name: 'Premium Property', 
                    coverage_percentage: 100,
                    description: 'Premium property coverage - 100% damage coverage'
                }
            }
        },
        health: {
            name: 'Health Insurance',
            categories: {
                basic: { 
                    name: 'Basic Health', 
                    coverage_percentage: 70,
                    description: 'Basic health coverage - 70% medical expenses'
                },
                family: { 
                    name: 'Family Health', 
                    coverage_percentage: 85,
                    description: 'Family health coverage - 85% medical expenses'
                },
                premium: { 
                    name: 'Premium Health', 
                    coverage_percentage: 95,
                    description: 'Premium health coverage - 95% medical expenses'
                }
            }
        },
        life: {
            name: 'Life Insurance',
            categories: {
                term: { 
                    name: 'Term Life', 
                    coverage_percentage: 100,
                    description: 'Term life insurance - Full coverage for specified term'
                },
                whole: { 
                    name: 'Whole Life', 
                    coverage_percentage: 100,
                    description: 'Whole life insurance - Lifetime coverage with investment'
                },
                universal: { 
                    name: 'Universal Life', 
                    coverage_percentage: 100,
                    description: 'Universal life insurance - Flexible premiums and coverage'
                }
            }
        }
    }, 
    onSubmitClaim = null,
    className = '',
    showSubmitButton = true 
}) => {
    const [quoteForm, setQuoteForm] = useState({
        insurance_type: '',
        insurance_category: '',
        claim_amount: ''
    });
    const [quoteResult, setQuoteResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const calculateCoverageLocal = (formData) => {
        const insuranceType = formData.insurance_type;
        const category = formData.insurance_category;
        const config = insuranceConfig[insuranceType]?.categories[category];
        
        if (!config) {
            return {
                error: 'Invalid insurance configuration',
                covered_amount: 0,
                coverage_percentage: 0
            };
        }

        const claimAmount = parseFloat(formData.claim_amount);
        const coveragePercentage = config.coverage_percentage;

        // No policy maximum - coverage applies directly to claim amount
        const eligibleAmount = claimAmount;
        const coveredAmount = (eligibleAmount * coveragePercentage) / 100;

        return {
            claimed_amount: claimAmount,
            eligible_amount: eligibleAmount,
            coverage_percentage: coveragePercentage,
            covered_amount: coveredAmount,
            customer_liability: claimAmount - coveredAmount,
            exceeded_limit: false // Never exceeds limit since there's no limit
        };
    };

    const handleCalculateQuote = async () => {
        setLoading(true);
        try {
            // Calculate locally instead of API call
            const result = calculateCoverageLocal(quoteForm);
            
            if (result.error) {
                throw new Error(result.error);
            }
            
            setQuoteResult(result);
        } catch (error) {
            console.error('Error calculating quote:', error);
            alert(error.message || 'Failed to calculate coverage quote');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-RW', {
            style: 'currency',
            currency: 'RWF',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const handleSubmitClaimFromCalculator = () => {
        if (onSubmitClaim) {
            onSubmitClaim({
                insurance_type: quoteForm.insurance_type,
                insurance_category: quoteForm.insurance_category,
                claim_amount: quoteForm.claim_amount
            });
        }
    };

    // Helper function to get coverage percentage (always the same as policy rate)
    const getCoveragePercentage = (result) => {
        return result ? result.coverage_percentage : 0;
    };

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Calculator Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center space-x-3 mb-4">
                    <Calculator className="h-8 w-8" />
                    <div>
                        <h2 className="text-2xl font-bold">Smart Coverage Calculator</h2>
                        <p className="text-blue-100">Calculate your potential coverage instantly</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calculator Form */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border-0 overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <Calculator className="h-5 w-5 mr-2 text-blue-600" />
                            Calculate Your Coverage
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">Enter your details to see instant coverage estimates</p>
                    </div>
                    
                    <div className="p-6">
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Insurance Type
                                    </label>
                                    <select
                                        required
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                                        value={quoteForm.insurance_type}
                                        onChange={(e) => setQuoteForm({...quoteForm, insurance_type: e.target.value, insurance_category: ''})}
                                    >
                                        <option value="">Choose insurance type</option>
                                        {Object.keys(insuranceConfig).map(type => (
                                            <option key={type} value={type}>
                                                {insuranceConfig[type]?.name || type}
                                            </option>
                                        ))}
                                    </select>
                                    {quoteForm.insurance_type && (
                                        <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                            <p className="text-xs text-blue-700 font-medium">
                                                ✓ {insuranceConfig[quoteForm.insurance_type]?.name} selected
                                            </p>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Coverage Plan
                                    </label>
                                    <select
                                        required
                                        disabled={!quoteForm.insurance_type}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        value={quoteForm.insurance_category}
                                        onChange={(e) => setQuoteForm({...quoteForm, insurance_category: e.target.value})}
                                    >
                                        <option value="">Select coverage plan</option>
                                        {quoteForm.insurance_type && insuranceConfig[quoteForm.insurance_type]?.categories && 
                                            Object.keys(insuranceConfig[quoteForm.insurance_type].categories).map(category => (
                                                <option key={category} value={category}>
                                                    {insuranceConfig[quoteForm.insurance_type].categories[category].name}
                                                </option>
                                            ))
                                        }
                                    </select>
                                    {quoteForm.insurance_category && (
                                        <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                                            <p className="text-xs text-green-700 font-medium">
                                                ✓ {insuranceConfig[quoteForm.insurance_type]?.categories[quoteForm.insurance_category]?.name} plan
                                            </p>
                                            <p className="text-xs text-green-600 mt-1">
                                                {insuranceConfig[quoteForm.insurance_type]?.categories[quoteForm.insurance_category]?.coverage_percentage}% coverage rate
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Claim Amount (RWF)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="1000"
                                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white text-lg font-medium"
                                        placeholder="Enter potential claim amount"
                                        value={quoteForm.claim_amount}
                                        onChange={(e) => setQuoteForm({...quoteForm, claim_amount: e.target.value})}
                                    />
                                    <div className="absolute right-4 top-4 text-gray-400">
                                        <span className="text-sm font-medium">RWF</span>
                                    </div>
                                </div>
                                {quoteForm.claim_amount && (
                                    <div className="mt-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                                        <p className="text-xs text-purple-700 font-medium">
                                            💰 Calculating coverage for {formatCurrency(quoteForm.claim_amount)}
                                        </p>
                                    </div>
                                )}
                            </div>
                            
                            <button
                                onClick={handleCalculateQuote}
                                disabled={loading || !quoteForm.insurance_type || !quoteForm.insurance_category || !quoteForm.claim_amount}
                                className={`w-full px-6 py-4 rounded-xl font-bold text-lg transition-all duration-200 transform ${
                                    loading 
                                        ? 'bg-gray-400 cursor-not-allowed scale-95' 
                                        : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95'
                                }`}
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        <span>Calculating...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center space-x-2">
                                        <Calculator className="h-5 w-5" />
                                        <span>Calculate My Coverage</span>
                                    </div>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Enhanced Quote Results */}
                <div className="space-y-6">
                    {quoteResult ? (
                        <div className="bg-white rounded-xl shadow-lg border-0 overflow-hidden">
                            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
                                <h3 className="text-xl font-bold flex items-center">
                                    <TrendingUp className="h-6 w-6 mr-2" />
                                    Your Coverage Breakdown
                                </h3>
                                <p className="text-green-100 mt-1">Detailed calculation results</p>
                            </div>
                            
                            <div className="p-6 space-y-6">
                                {/* Main Coverage Display */}
                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                                    <div className="text-center mb-4">
                                        <p className="text-sm text-gray-600 mb-2">Insurance Will Pay</p>
                                        <p className="text-4xl font-bold text-green-600 mb-2">
                                            {formatCurrency(quoteResult.covered_amount)}
                                        </p>
                                        <div className="flex items-center justify-center space-x-2">
                                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-200 text-blue-800 text-sm font-medium">
                                                {getCoveragePercentage(quoteResult)}% Coverage
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Coverage Bar - Shows policy coverage percentage */}
                                    <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                                        <div 
                                            className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${getCoveragePercentage(quoteResult)}%` }}
                                        ></div>
                                    </div>
                                    
                                    {/* Customer liability info */}
                                    {quoteResult.customer_liability > 0 && (
                                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                            <div className="flex items-center space-x-2">
                                                <Info className="h-4 w-4 text-blue-600" />
                                                <span className="text-sm text-blue-800">
                                                    You'll pay {getCoveragePercentage(quoteResult) < 100 ? 'the remaining ' + (100 - getCoveragePercentage(quoteResult)) + '%' : 'nothing'} as your deductible portion
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Detailed Breakdown */}
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <div className="flex items-center space-x-2">
                                            <DollarSign className="h-4 w-4 text-blue-600" />
                                            <span className="text-sm font-medium text-gray-700">Total Claimed</span>
                                        </div>
                                        <span className="font-bold text-lg text-gray-900">{formatCurrency(quoteResult.claimed_amount)}</span>
                                    </div>
                                    
                                    <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border border-green-200">
                                        <div className="flex items-center space-x-2">
                                            <Check className="h-4 w-4 text-green-600" />
                                            <span className="text-sm font-medium text-gray-700">Insurance Pays ({quoteResult.coverage_percentage}%)</span>
                                        </div>
                                        <span className="font-bold text-lg text-green-600">{formatCurrency(quoteResult.covered_amount)}</span>
                                    </div>
                                    
                                    {quoteResult.customer_liability > 0 && (
                                        <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                                            <div className="flex items-center space-x-2">
                                                <AlertCircle className="h-4 w-4 text-orange-600" />
                                                <span className="text-sm font-medium text-gray-700">Your Deductible ({100 - quoteResult.coverage_percentage}%)</span>
                                            </div>
                                            <span className="font-bold text-lg text-orange-600">{formatCurrency(quoteResult.customer_liability)}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Coverage Insights */}
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                        <BarChart3 className="h-4 w-4 mr-2 text-gray-600" />
                                        Coverage Analysis
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Policy Coverage Rate:</span>
                                            <span className="font-medium text-green-600">{quoteResult.coverage_percentage}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Insurance Pays:</span>
                                            <span className="font-medium text-green-600">{formatCurrency(quoteResult.covered_amount)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Your Deductible:</span>
                                            <span className="font-medium text-orange-600">{formatCurrency(quoteResult.customer_liability)}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                        <p className="text-xs text-gray-600">
                                            Your policy covers {quoteResult.coverage_percentage}% of all eligible claims with no maximum limit.
                                            {quoteResult.coverage_percentage < 100 && 
                                                ` You'll pay the remaining ${100 - quoteResult.coverage_percentage}% as your deductible.`
                                            }
                                        </p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex space-x-3">
                                    {showSubmitButton && onSubmitClaim && (
                                        <button
                                            onClick={handleSubmitClaimFromCalculator}
                                            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
                                        >
                                            <Plus className="h-4 w-4" />
                                            <span>Submit This Claim</span>
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                            setQuoteForm({ insurance_type: '', insurance_category: '', claim_amount: '' });
                                            setQuoteResult(null);
                                        }}
                                        className="px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        Reset
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Empty State */
                        <div className="bg-white rounded-xl shadow-lg border-0 p-8 text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Calculator className="h-8 w-8 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Calculate Your Coverage</h3>
                            <p className="text-gray-600 text-sm mb-4">
                                Fill in the form to see how much you'll receive from your insurance claim
                            </p>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div className="p-3 bg-green-50 rounded-lg">
                                    <PieChart className="h-6 w-6 text-green-600 mx-auto mb-1" />
                                    <p className="text-xs text-green-700 font-medium">Instant</p>
                                    <p className="text-xs text-green-600">Calculation</p>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <Shield className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                                    <p className="text-xs text-blue-700 font-medium">Accurate</p>
                                    <p className="text-xs text-blue-600">Coverage</p>
                                </div>
                                <div className="p-3 bg-purple-50 rounded-lg">
                                    <TrendingUp className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                                    <p className="text-xs text-purple-700 font-medium">No Limits</p>
                                    <p className="text-xs text-purple-600">Coverage</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Coverage Comparison Table */}
                    {quoteForm.insurance_type && insuranceConfig[quoteForm.insurance_type] && (
                        <div className="bg-white rounded-xl shadow-lg border-0 overflow-hidden">
                            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 border-b">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
                                    Plan Comparison
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">Compare coverage rates for {insuranceConfig[quoteForm.insurance_type]?.name}</p>
                            </div>
                            
                            <div className="p-6">
                                <div className="space-y-4">
                                    {Object.entries(insuranceConfig[quoteForm.insurance_type]?.categories || {}).map(([key, category]) => {
                                        const isSelected = quoteForm.insurance_category === key;
                                        
                                        return (
                                            <div 
                                                key={key} 
                                                className={`p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                                                    isSelected 
                                                        ? 'border-blue-500 bg-blue-50 shadow-md transform scale-105' 
                                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                }`}
                                                onClick={() => setQuoteForm({...quoteForm, insurance_category: key})}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2 mb-2">
                                                            <h4 className="font-semibold text-gray-900">{category.name}</h4>
                                                            {isSelected && (
                                                                <div className="flex items-center space-x-1 px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                                                                    <Check className="h-3 w-3" />
                                                                    <span>Selected</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-gray-600 mb-3">{category.description}</p>
                                                        
                                                        <div className="grid grid-cols-1 gap-2 text-sm">
                                                            <div>
                                                                <span className="text-gray-500">Coverage Rate:</span>
                                                                <p className="font-bold text-lg text-green-600">{category.coverage_percentage}%</p>
                                                                <p className="text-xs text-gray-500">Applied to full claim amount</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                
                                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                                    <div className="flex items-center space-x-2">
                                        <Shield className="h-4 w-4 text-green-600" />
                                        <p className="text-xs text-green-700">
                                            <strong>No Policy Limits:</strong> Your coverage percentage applies to the full claim amount with no maximum restrictions.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CoverageCalculator;