export interface ProcessRecipeItem {
  productId: string;
  productName: string;
  itemType?: string;
  unitOfMeasure?: string;
  quantity: number;
}

export interface AllowedRecipeItem {
  productId: string;
  productName: string;
  itemType: string;
  unitOfMeasure: string;
}
