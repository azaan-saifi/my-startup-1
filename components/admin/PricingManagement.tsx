import React, { useState, useEffect } from "react";
import { FiEdit2, FiCheck, FiX } from "react-icons/fi";
import { IoIosArrowRoundForward } from "react-icons/io";
import toast from "react-hot-toast";

// Define the pricing plan interface
interface PricingPlan {
  id: string;
  name: string;
  price: number;
  interval: string;
  description: string;
  features: string[];
  isPopular: boolean;
}

interface EditablePricingPlanProps {
  plan: PricingPlan;
  onSave: (plan: PricingPlan) => void;
  onCancel: () => void;
}

const EditablePricingPlan = ({ plan, onSave, onCancel }: EditablePricingPlanProps) => {
  const [editedPlan, setEditedPlan] = useState<PricingPlan>({ ...plan });
  
  const handleChange = (field: keyof PricingPlan, value: any) => {
    setEditedPlan({ ...editedPlan, [field]: value });
  };
  
  const handleFeatureChange = (index: number, value: string) => {
    const updatedFeatures = [...editedPlan.features];
    updatedFeatures[index] = value;
    setEditedPlan({ ...editedPlan, features: updatedFeatures });
  };
  
  const addFeature = () => {
    setEditedPlan({
      ...editedPlan,
      features: [...editedPlan.features, ""]
    });
  };
  
  const removeFeature = (index: number) => {
    setEditedPlan({
      ...editedPlan,
      features: editedPlan.features.filter((_, i) => i !== index)
    });
  };
  
  return (
    <div className="space-y-4 rounded-lg border border-[#f0bb1c]/30 bg-black/80 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            className="w-full sm:w-auto rounded border border-zinc-800 bg-zinc-900/50 px-2 py-1 text-lg font-medium text-white focus:border-[#f0bb1c] focus:outline-none"
            value={editedPlan.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
          <div className="flex items-center gap-1 text-xs">
            <input
              type="checkbox"
              id="isPopular"
              checked={editedPlan.isPopular}
              onChange={(e) => handleChange("isPopular", e.target.checked)}
              className="h-3 w-3 rounded border-zinc-700 bg-zinc-900 text-[#f0bb1c]"
            />
            <label htmlFor="isPopular" className="text-zinc-400">Popular</label>
          </div>
        </div>
        <div className="flex gap-2 mt-2 sm:mt-0">
          <button 
            onClick={() => onSave(editedPlan)}
            className="rounded p-1 text-emerald-500 hover:bg-zinc-800"
          >
            <FiCheck />
          </button>
          <button 
            onClick={onCancel}
            className="rounded p-1 text-rose-500 hover:bg-zinc-800"
          >
            <FiX />
          </button>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-zinc-400">$</span>
        <input
          type="number"
          className="w-20 rounded border border-zinc-800 bg-zinc-900/50 px-2 py-1 text-xl font-bold text-white focus:border-[#f0bb1c] focus:outline-none"
          value={editedPlan.price}
          onChange={(e) => handleChange("price", Number(e.target.value))}
        />
        <span className="text-zinc-400">per month</span>
      </div>
      
      <div>
        <textarea
          className="w-full rounded border border-zinc-800 bg-zinc-900/50 px-2 py-1 text-sm text-white focus:border-[#f0bb1c] focus:outline-none"
          value={editedPlan.description}
          onChange={(e) => handleChange("description", e.target.value)}
          rows={2}
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-zinc-400">Features</h4>
          <button 
            onClick={addFeature}
            className="rounded-full bg-zinc-900 p-1 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            + Add
          </button>
        </div>
        
        {editedPlan.features.map((feature, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="text"
              className="flex-1 rounded border border-zinc-800 bg-zinc-900/50 px-2 py-1 text-sm text-white focus:border-[#f0bb1c] focus:outline-none"
              value={feature}
              onChange={(e) => handleFeatureChange(index, e.target.value)}
            />
            <button 
              onClick={() => removeFeature(index)}
              className="rounded p-1 text-xs text-zinc-400 hover:text-rose-500"
            >
              <FiX />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const PricingManagement = () => {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Fetch pricing plans from the API
  useEffect(() => {
    const fetchPricingPlans = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/pricing');
        
        if (!response.ok) {
          throw new Error('Failed to fetch pricing plans');
        }
        
        const data = await response.json();
        setPlans(data);
      } catch (error) {
        console.error('Error fetching pricing plans:', error);
        toast.error('Failed to load pricing plans');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPricingPlans();
  }, []);
  
  const handleEdit = (id: string) => {
    setEditingPlanId(id);
  };
  
  const handleSave = (updatedPlan: PricingPlan) => {
    setPlans(
      plans.map((plan) => (plan.id === updatedPlan.id ? updatedPlan : plan))
    );
    setEditingPlanId(null);
  };
  
  const handleCancel = () => {
    setEditingPlanId(null);
  };
  
  const handlePublish = async () => {
    try {
      setIsSaving(true);
      
      const response = await fetch('/api/pricing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(plans),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update pricing plans');
      }
      
      toast.success('Pricing plans published successfully!');
    } catch (error) {
      console.error('Error publishing pricing plans:', error);
      toast.error('Failed to publish pricing plans');
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-black/60 p-4 sm:p-6 backdrop-blur-sm">
        <div className="flex justify-center items-center h-40">
          <div className="animate-pulse text-zinc-400">Loading pricing plans...</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-black/60 p-4 sm:p-6 backdrop-blur-sm">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-medium text-white">Pricing Management</h3>
          <p className="mt-1 text-sm text-zinc-400">Update pricing plans shown on the pricing page</p>
        </div>
        
        <button 
          onClick={handlePublish}
          disabled={isSaving}
          className="flex items-center justify-center gap-2 rounded-md bg-[#ffc20b31] px-4 py-2 text-sm font-medium text-[#f0bb1c] transition-colors hover:bg-[#ffc20b50] disabled:opacity-50 disabled:cursor-not-allowed mt-3 sm:mt-0"
        >
          <span>{isSaving ? 'Publishing...' : 'Publish Changes'}</span>
          <IoIosArrowRoundForward className="text-xl" />
        </button>
      </div>
      
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
        {plans.map((plan) => (
          <div key={plan.id}>
            {editingPlanId === plan.id ? (
              <EditablePricingPlan
                plan={plan}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            ) : (
              <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-black/60 p-4 sm:p-6 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700 hover:shadow-lg">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-lg font-medium text-white">{plan.name}</h4>
                  <div className="flex items-center gap-2">
                    {plan.isPopular && (
                      <div className="rounded-full border border-[#f0bb1c]/30 bg-[#ffc20b31] px-2 py-0.5">
                        <span className="text-xs font-medium text-[#f0bb1c]">POPULAR</span>
                      </div>
                    )}
                    <button 
                      onClick={() => handleEdit(plan.id)}
                      className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    >
                      <FiEdit2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-baseline">
                    <span className="text-2xl font-bold text-white">${plan.price}</span>
                    <span className="ml-1 text-zinc-400">/month</span>
                  </div>
                  <p className="mt-2 text-sm text-zinc-400">{plan.description}</p>
                </div>
                
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-sm">
                      <FiCheck className="mr-2 mt-0.5 text-[#f0bb1c]" />
                      <span className="text-zinc-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PricingManagement;