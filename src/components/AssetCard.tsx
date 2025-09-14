import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { Asset } from "@/utils/cgtCalculations";

interface AssetCardProps {
  asset: Asset;
  assetNumber: number;
  onUpdate: (updates: Partial<Asset>) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export function AssetCard({ asset, assetNumber, onUpdate, onRemove, canRemove }: AssetCardProps) {
  return (
    <Card className="border-2 border-muted">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Asset {assetNumber}</CardTitle>
          {canRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Ownership Duration */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            Have you owned the asset for at least 12 months?
          </Label>
          <RadioGroup
            value={asset.ownedMoreThan12Months ? "yes" : "no"}
            onValueChange={(value) => onUpdate({ ownedMoreThan12Months: value === "yes" })}
            className="flex gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id={`${asset.id}-12months-yes`} className="border-2" />
              <Label htmlFor={`${asset.id}-12months-yes`} className="text-sm">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id={`${asset.id}-12months-no`} className="border-2" />
              <Label htmlFor={`${asset.id}-12months-no`} className="text-sm">No</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Purchase Price */}
        <div className="space-y-2">
          <Label htmlFor={`${asset.id}-purchase`} className="text-sm font-medium">
            Purchase price of asset
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              $
            </span>
            <Input
              id={`${asset.id}-purchase`}
              type="number"
              value={asset.purchasePrice}
              onChange={(e) => onUpdate({ purchasePrice: Number(e.target.value) || 0 })}
              className="pl-8 h-11 rounded-lg"
              placeholder="0"
            />
          </div>
        </div>

        {/* Additional Costs */}
        <div className="space-y-2">
          <Label htmlFor={`${asset.id}-costs`} className="text-sm font-medium">
            Additional costs of purchasing, owning and selling the asset
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              $
            </span>
            <Input
              id={`${asset.id}-costs`}
              type="number"
              value={asset.additionalCosts}
              onChange={(e) => onUpdate({ additionalCosts: Number(e.target.value) || 0 })}
              className="pl-8 h-11 rounded-lg"
              placeholder="0"
            />
          </div>
        </div>

        {/* Sale Price */}
        <div className="space-y-2">
          <Label htmlFor={`${asset.id}-sale`} className="text-sm font-medium">
            Sale price of asset
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              $
            </span>
            <Input
              id={`${asset.id}-sale`}
              type="number"
              value={asset.salePrice}
              onChange={(e) => onUpdate({ salePrice: Number(e.target.value) || 0 })}
              className="pl-8 h-11 rounded-lg"
              placeholder="0"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}