import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AssetCard } from "@/components/AssetCard";
import type { CGTInputs, Asset } from "@/utils/cgtCalculations";

interface CalculatorFormProps {
  inputs: CGTInputs;
  onChange: (inputs: CGTInputs) => void;
}

export function CalculatorForm({ inputs, onChange }: CalculatorFormProps) {
  const updateInputs = (updates: Partial<CGTInputs>) => {
    onChange({ ...inputs, ...updates });
  };

  const addAsset = () => {
    const newAsset: Asset = {
      id: `asset-${inputs.assets.length + 1}`,
      ownedMoreThan12Months: true,
      purchasePrice: 0,
      additionalCosts: 0,
      salePrice: 0
    };
    updateInputs({ assets: [...inputs.assets, newAsset] });
  };

  const updateAsset = (assetId: string, updates: Partial<Asset>) => {
    const updatedAssets = inputs.assets.map(asset =>
      asset.id === assetId ? { ...asset, ...updates } : asset
    );
    updateInputs({ assets: updatedAssets });
  };

  const removeAsset = (assetId: string) => {
    if (inputs.assets.length > 1) {
      const updatedAssets = inputs.assets.filter(asset => asset.id !== assetId);
      updateInputs({ assets: updatedAssets });
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Annual Taxable Income and Income Year */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="income" className="text-sm font-medium">
              Annual taxable income (before tax)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="income"
                type="number"
                value={inputs.annualTaxableIncome}
                onChange={(e) => updateInputs({ annualTaxableIncome: Number(e.target.value) || 0 })}
                className="pl-8 h-11 rounded-lg border-input"
                placeholder="90,000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="income-year" className="text-sm font-medium">
              Income year
            </Label>
            <Select value={inputs.incomeYear} onValueChange={(value) => updateInputs({ incomeYear: value })}>
              <SelectTrigger className="h-11 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2025-2026">2025-2026</SelectItem>
                <SelectItem value="2024-2025">2024-2025</SelectItem>
                <SelectItem value="2023-2024">2023-2024</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Unapplied Net Capital Losses */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">
              Any unapplied net capital losses from previous years?
            </Label>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">Capital losses from previous years that haven't been used to offset capital gains</p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          <RadioGroup
            value={inputs.hasUnappliedLosses ? "yes" : "no"}
            onValueChange={(value) => updateInputs({ hasUnappliedLosses: value === "yes" })}
            className="flex gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="losses-yes" className="border-2" />
              <Label htmlFor="losses-yes" className="text-sm">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="losses-no" className="border-2" />
              <Label htmlFor="losses-no" className="text-sm">No</Label>
            </div>
          </RadioGroup>

          {inputs.hasUnappliedLosses && (
            <div className="mt-3">
              <Label htmlFor="losses-amount" className="text-sm font-medium">
                Amount of unapplied losses
              </Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="losses-amount"
                  type="number"
                  value={inputs.unappliedLossesAmount}
                  onChange={(e) => updateInputs({ unappliedLossesAmount: Number(e.target.value) || 0 })}
                  className="pl-8 h-11 rounded-lg"
                  placeholder="0"
                />
              </div>
            </div>
          )}
        </div>

        {/* Pre-1985 Assets */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">
              Did you purchase any assets before 20 Sep 1985?
            </Label>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">Assets purchased before this date are generally exempt from CGT</p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          <RadioGroup
            value={inputs.assetsPurchasedBefore1985 ? "yes" : "no"}
            onValueChange={(value) => updateInputs({ assetsPurchasedBefore1985: value === "yes" })}
            className="flex gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="pre85-yes" className="border-2" />
              <Label htmlFor="pre85-yes" className="text-sm">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="pre85-no" className="border-2" />
              <Label htmlFor="pre85-no" className="text-sm">No</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Foreign/Temporary Resident */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">
              Foreign or temporary resident whilst holding the asset(s)?
            </Label>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">Non-residents don't get the 50% CGT discount</p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          <RadioGroup
            value={inputs.foreignOrTemporaryResident ? "yes" : "no"}
            onValueChange={(value) => updateInputs({ foreignOrTemporaryResident: value === "yes" })}
            className="flex gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="foreign-yes" className="border-2" />
              <Label htmlFor="foreign-yes" className="text-sm">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="foreign-no" className="border-2" />
              <Label htmlFor="foreign-no" className="text-sm">No</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Assets */}
        <div className="space-y-4">
          {inputs.assets.map((asset, index) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              assetNumber={index + 1}
              onUpdate={(updates) => updateAsset(asset.id, updates)}
              onRemove={() => removeAsset(asset.id)}
              canRemove={inputs.assets.length > 1}
            />
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addAsset}
            className="w-full h-12 rounded-lg border-dashed border-2 hover:bg-muted/50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add another asset
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}