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
    <div className="space-y-4 rounded-lg border border-[#f0bb1c]/30 bg-black/80 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="rounded border border-zinc-800 bg-zinc-900/50 px-2 py-1 text-lg font-medium text-white focus:border-[#f0bb1c] focus:outline-none"
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
        <div className="flex gap-2">
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
  const [isProduction, setIsProduction] = useState(false);
  
  // Check if we're in production environment
  useEffect(() => {
    // In the browser, window.location.hostname will indicate if we're on localhost or a production domain
    const hostname = window.location.hostname;
    setIsProduction(hostname !== 'localhost' && hostname !== '127.0.0.1');
  }, []);
  
  // Fetch pricing plans from the API
  useEffect(() => {
    const fetchPricingPlans = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching pricing plans...');
        const response = await fetch('/api/pricing');
        
        if (!response.ok) {
          console.error('API response not OK:', response.status, response.statusText);
          throw new Error(`Failed to fetch pricing plans: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Fetched pricing plans:', data);
        setPlans(data);
      } catch (error) {
        console.error('Error fetching pricing plans:', error);
        toast.error('Failed to load pricing plans');
        // Set some default plans for UI display
        setPlans([
          {
            id: "1",
            name: "Basic Bender",
            price: 29,
            interval: "monthly",
            description: "Perfect for beginners looking to start their coding journey.",
            features: [
              "Access to core courses",
              "Practice exercises",
              "Community forum access",
              "Monthly coding challenges",
              "Email support"
            ],
            isPopular: false,
          },
          {
            id: "2",
            name: "Master Bender",
            price: 89,
            interval: "monthly",
            description: "For serious learners ready to master the code of the Matrix.",
            features: [
              "All Basic features",
              "Advanced courses",
              "1-on-1 mentoring sessions",
              "Project reviews",
              "Priority support",
              "Certificate of completion",
              "Job opportunity alerts"
            ],
            isPopular: true,
          }
        ]);
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
      console.log('Publishing pricing plans:', plans);
      
      const response = await fetch('/api/pricing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(plans),
      });
      
      if (!response.ok) {
        console.error('API response not OK:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        throw new Error(`Failed to update pricing plans: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('API response:', result);
      
      // Check if we're in production and show a special message
      if (result.message && result.message.includes("won't persist in production")) {
        toast.success('Pricing plans updated in UI (changes will not persist in production without a database)');
      } else {
        toast.success('Pricing plans published successfully!');
      }
    } catch (error) {
      console.error('Error publishing pricing plans:', error);
      toast.error('Failed to publish pricing plans');
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-black/60 p-6 backdrop-blur-sm">
        <div className="flex justify-center items-center h-40">
          <div className="animate-pulse text-zinc-400">Loading pricing plans...</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-black/60 p-6 backdrop-blur-sm">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      
      {isProduction && (
        <div className="mb-6 p-4 rounded-lg border border-[#f0bb1c]/30 bg-[#ffc20b10]">
          <h4 className="text-[#f0bb1c] font-medium">Production Environment Notice</h4>
          <p className="mt-1 text-sm text-zinc-300">
            You are currently in the production environment. Changes made to pricing plans will update the UI temporarily but won't be permanently saved. 
            For persistent changes in production, a database integration is required.
          </p>
        </div>
      )}
      
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-medium text-white">Pricing Management</h3>
          <p className="mt-1 text-sm text-zinc-400">Update pricing plans shown on the pricing page</p>
        </div>
        
        <button 
          onClick={handlePublish}
          disabled={isSaving}
          className="flex items-center gap-2 rounded-md bg-[#ffc20b31] px-4 py-2 text-sm font-medium text-[#f0bb1c] transition-colors hover:bg-[#ffc20b50] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{isSaving ? 'Publishing...' : 'Publish Changes'}</span>
          <IoIosArrowRoundForward className="text-xl" />
        </button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {plans.map((plan) => (
          <div key={plan.id}>
            {editingPlanId === plan.id ? (
              <EditablePricingPlan
                plan={plan}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            ) : (
              <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-black/60 p-6 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700 hover:shadow-lg">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                
                <div className="mb-2 flex items-center justify-between">
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